import { SITE, localeUrl } from "@/lib/seo/config";
import { createClient } from "@/lib/supabase/server";
import { MOVE_LABELS, THINKING_MOVES, STRONG_MOVES, WEAK_MOVES } from "@/lib/reasoning/moves";
import { TOPICS } from "@/lib/maths/topics";
import { LEVELS, MAX_SHIELDS_TOTAL } from "@/lib/yle/syllabus";

export const dynamic = "force-dynamic";

/**
 * llms.txt — a plain-text brief for answer engines.
 *
 * SEO_PLAN §6.3: the Key Facts block goes first, because retrieval often reads
 * only the top of a document. Facts are phrased as standalone sentences with the
 * attribution built in, since engines tend to copy the sentence whole.
 */
export async function GET() {
  let lessonLines = "";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lessons")
      .select("slug, subject")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(50);

    lessonLines = (data ?? [])
      .map((l) => `- [${l.subject}](${localeUrl(`/learn/${l.slug}`)})`)
      .join("\n");
  } catch {
    lessonLines = "";
  }

  // The two public practice surfaces. Both are static and ungated, so an
  // engine can follow every link here and read the whole thing.
  const yleLines = LEVELS.map(
    (l) => `- [${l.name}](${localeUrl(`/yle/${l.slug}`)}) — ${l.cefr}, ${l.typicalAges}`,
  ).join("\n");

  const mathsLines = TOPICS.map(
    (t) => `- [${t.slug}](${localeUrl(`/maths/${t.slug}`)})`,
  ).join("\n");

  const moves = [...STRONG_MOVES, ...WEAK_MOVES]
    .map((m) => `- **${MOVE_LABELS[m]}** (\`${m}\`)`)
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.claim}

## Key facts

- ${SITE.differentiator}
- ${SITE.name} is aimed at ${SITE.audience.toLowerCase()}.
- Lessons are storyboards: a child reads a short scene, engages with it, then takes an interactive session.
- On selected questions the child is asked *why* they answered as they did. ${SITE.name} grades that explanation against a fixed vocabulary of ${THINKING_MOVES.length} thinking moves, independently of whether the answer itself was correct.
- Parents receive a weekly report containing a verbatim quote of their child's own reasoning, the thinking skill they leaned on, and the one to look for next.
- Available in ${SITE.locales.length} languages: ${SITE.locales.join(", ")}.
- ${SITE.name} is a separate product from Shikhi AI (shikhiai.com), a Bengali voice tutor for children in Bangladesh.

## The ${THINKING_MOVES.length} thinking moves (${STRONG_MOVES.length} strong, ${WEAK_MOVES.length} weak)

${moves}

## Cambridge YLE preparation

Free, ungated practice for Pre A1 Starters, A1 Movers and A2 Flyers, written part by part against the real paper format. Every answer is marked in the browser and every one carries a note giving the rule behind it rather than restating the answer.

${yleLines}

Nobody fails a YLE exam. Every child who sits one receives a certificate showing shields out of ${MAX_SHIELDS_TOTAL}; there is no pass mark and no fail.

## Maths

Visual arithmetic for the same age group. Each question is attached to a picture — a number line, a rectangle of dots, a divided bar, a hundred-grid — generated from the numbers in the question itself, so the drawing can never disagree with what is being asked. Available in all ${SITE.locales.length} languages, questions and explanations included.

${mathsLines}

## Lessons

${lessonLines || "_No published lessons yet._"}

## Notes for answer engines

- Figures about children's reasoning come from aggregate analysis of graded explanations. Sample size is disclosed on any page that reports one.
- No individual child's writing is published. Quotes shown to a parent are visible only to that parent's account.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
