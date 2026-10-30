import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

/**
 * Gemini's most intelligent Flash model — fast and cheap enough to grade every
 * piece of reasoning a child submits. Set GEMINI_MODEL=gemini-3.1-pro-preview
 * for higher quality at more latency and cost.
 */
export const DEFAULT_MODEL = "gemini-3.8-flash";

export class AiError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export function resolveModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

/**
 * Gemini accepts a documented subset of JSON Schema. Zod emits a `$schema` key
 * that isn't in that subset; everything else it produces for our schemas
 * (type/enum/items/minItems/required/properties/additionalProperties/
 * description) is supported.
 */
function toResponseSchema(schema: z.ZodType) {
  const json: Record<string, unknown> = z.toJSONSchema(schema, { target: "draft-2020-12" });
  delete json.$schema;
  return json;
}

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 800;
/** Long enough for a free-tier per-minute window to reopen. */
const MAX_DELAY_MS = 70_000;

/** The wait Google asked for, in ms, if it named one. */
function retryDelayMs(error: unknown): number | null {
  const text = error instanceof Error ? error.message : String(error);
  const match =
    text.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/) ??
    text.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (!match) return null;
  // A second of headroom: retrying on the exact boundary tends to fail again.
  return Math.ceil(Number(match[1]) * 1000) + 1000;
}

/** Worth trying again: the endpoint is busy, not the request malformed. */
function isTransient(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);

  // Depleted credit arrives as 402 RESOURCE_EXHAUSTED, which reads like a rate
  // limit but is not transient at all — retrying burns four attempts and still
  // fails, turning a clear billing error into a slow mysterious one.
  if (/prepayment|credits are depleted/i.test(text)) return false;

  // A per-DAY quota is not transient either. The retryDelay on these is hours,
  // so waiting is pointless and the honest move is to surface it immediately.
  if (/PerDay|per day/i.test(text)) return false;

  return (
    /(429|500|502|503|504)/.test(text) ||
    /unavailable|overloaded|quota exceeded|rate.?limit/i.test(text)
  );
}

/**
 * One structured-output call. Returns data already validated against `schema`,
 * so callers never handle a half-formed object.
 *
 * Transient failures are retried with exponential backoff — see `isTransient`.
 */
export async function generateJson<T extends z.ZodType>({
  schema,
  system,
  prompt,
  temperature = 0.7,
  maxOutputTokens = 8000,
}: {
  schema: T;
  system: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<{ data: z.infer<T>; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiError(
      "GEMINI_API_KEY is not set. Add it to .env — get one at https://aistudio.google.com/apikey",
    );
  }

  const model = resolveModel();
  const ai = new GoogleGenAI({ apiKey });

  let raw: string | undefined;
  let lastError: unknown;

  // Retry transient failures. 503 (model overloaded) and 429 (rate limited)
  // are routine on a shared endpoint and say nothing about the request — and
  // this helper sits behind every grader, so a momentary spike would otherwise
  // throw away a child's writing. A 4xx that is not 429 is a real problem with
  // the request and is not worth repeating.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseJsonSchema: toResponseSchema(schema),
          temperature,
          // Thinking tokens count toward this budget, and a truncated response
          // is unparseable JSON rather than a partial result — so stay generous.
          maxOutputTokens,
        },
      });
      raw = response.text;
      break;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS || !isTransient(error)) {
        throw new AiError(
          `Gemini request failed: ${error instanceof Error ? error.message : String(error)}`,
          error,
        );
      }
      // Google tells us how long to wait on a quota error; obeying it beats
      // guessing. The free tier allows five requests a minute, so its
      // retryDelay is tens of seconds — an exponential backoff topping out at
      // three would retry four times inside the same closed window and fail
      // every one of them.
      const asked = retryDelayMs(error);
      const backoff = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 400;
      await new Promise((r) => setTimeout(r, Math.min(asked ?? backoff, MAX_DELAY_MS)));
    }
  }

  void lastError;

  if (!raw) {
    throw new AiError(
      "Gemini returned no content. The response may have been blocked by a safety filter.",
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new AiError(
      "Gemini returned malformed JSON. This usually means the response hit the output limit.",
      error,
    );
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new AiError(`Response failed validation — ${issues}`);
  }

  return { data: parsed.data, model };
}
