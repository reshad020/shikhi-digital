import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Unsubscribe tokens.
 *
 * The one thing in this product that is deliberately reachable without a
 * session — because an unsubscribe link that demands a login is how recurring
 * mail gets reported as spam instead of unsubscribed from.
 *
 * Scope is the point. The token authorises exactly one irreversible-by-a-
 * stranger action: setting `weekly_email = false` on one profile. It grants no
 * read access to anything, and in particular it is **not** a link to the
 * report. The old capability URL that exposed a child's writing was removed on
 * purpose and this does not reintroduce it — the report itself still lives
 * behind the parent's session.
 *
 * Keyed off the service-role key rather than a new secret, so the feature
 * needs no extra configuration to be safe. A rotation of that key invalidates
 * every outstanding unsubscribe link, which is the correct behaviour if it
 * ever leaks.
 */

function secret() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to sign unsubscribe links");
  // Domain separation: this key signs other things elsewhere, and a token
  // minted here must never be valid anywhere else.
  return `shikhi:unsubscribe:${key}`;
}

function sign(profileId: string) {
  return createHmac("sha256", secret()).update(profileId).digest("base64url");
}

export function unsubscribeToken(profileId: string) {
  return `${profileId}.${sign(profileId)}`;
}

/** The profile this token authorises, or null if it does not verify. */
export function verifyUnsubscribeToken(token: string): string | null {
  const cut = token.lastIndexOf(".");
  if (cut <= 0) return null;

  const profileId = token.slice(0, cut);
  const provided = token.slice(cut + 1);
  const expected = sign(profileId);

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length must match before timingSafeEqual, which throws on a mismatch.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return profileId;
}
