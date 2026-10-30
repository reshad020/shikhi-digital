import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

/**
 * Regenerates `types.generated.ts` from a live schema.
 *
 *   npm run db:types              # local stack (needs Docker)
 *   npm run db:types -- --hosted  # the linked hosted project
 *
 * Exists because the obvious one-liner is a trap:
 *
 *     supabase gen types typescript --local > src/lib/supabase/types.generated.ts
 *
 * The shell truncates the target *before* running the command, so any failure —
 * Docker down, not logged in, wrong project ref — leaves an empty file and a
 * codebase that no longer compiles. That has already happened once. Here the
 * output is captured, checked, and only then written.
 */

const hosted = process.argv.includes("--hosted");
const projectId = process.env.SUPABASE_PROJECT_ID ?? "dyquzitsxggoqicaflsg";
const target = "src/lib/supabase/types.generated.ts";

const args = hosted
  ? ["supabase", "gen", "types", "typescript", "--project-id", projectId]
  : ["supabase", "gen", "types", "typescript", "--local"];

console.log(`generating from ${hosted ? `hosted project ${projectId}` : "the local stack"}...`);

let output: string;
try {
  output = execFileSync("npx", args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    shell: process.platform === "win32",
  });
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`\nfailed, and ${target} was left untouched:\n${detail}`);
  if (hosted) console.error("\nIf this is an auth error, run: npx supabase login");
  else console.error("\nIf this is a connection error, run: npm run db:start");
  process.exit(1);
}

// A truncated or error-page response would otherwise be written straight over
// the only description of the schema the app has.
const problems: string[] = [];
if (output.length < 2000) problems.push(`output is only ${output.length} bytes`);
if (!output.includes("export type Database")) problems.push("no `export type Database` found");
// Quoted or bare: CLI 2.122 emits `"public":`, older versions emitted `public:`.
if (!/["']?public["']?\s*:/.test(output)) problems.push("no `public` schema found");

if (problems.length > 0) {
  console.error(`\nrefusing to write, ${target} left untouched:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

// PowerShell and the CLI both like a BOM and CRLF; the repo uses neither.
writeFileSync(target, output.replace(/^﻿/, "").replace(/\r\n/g, "\n"), "utf8");

console.log(`wrote ${target} (${output.split("\n").length} lines)`);
console.log("now run: npx tsc --noEmit");
