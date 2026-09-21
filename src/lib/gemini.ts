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

/**
 * One structured-output call. Returns data already validated against `schema`,
 * so callers never handle a half-formed object.
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
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        responseJsonSchema: toResponseSchema(schema),
        temperature,
        // Thinking tokens count toward this budget, and a truncated response is
        // unparseable JSON rather than a partial result — so stay generous.
        maxOutputTokens,
      },
    });
    raw = response.text;
  } catch (error) {
    throw new AiError(
      `Gemini request failed: ${error instanceof Error ? error.message : String(error)}`,
      error,
    );
  }

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
