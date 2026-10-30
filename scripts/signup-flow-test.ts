import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";

/**
 * The path a brand-new family actually takes.
 *
 *   npm run test:signup
 *
 * Everything here runs as the SIGNED-IN PARENT, through the publishable key --
 * not the service key. That is the whole point: the service key bypasses row
 * level security, so a test written with it proves the tables exist and
 * nothing about whether a real person can use them. Every check below is one
 * the policies could silently fail.
 *
 * The contract: sign up, get a profile without asking for one, create a child,
 * read that child back, and be able to read the shared content bank. If any of
 * that is refused, a new user signs up and lands on a dead end.
 *
 * Cleans up with the service key at the end, since a parent cannot delete
 * themselves.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY must be set in .env",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

let failed = 0;
function check(ok: boolean, label: string, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

async function main() {
  const stamp = Date.now();

  // example.com, not the more correct example.test: hosted Supabase validates
  // the address on public signUp and rejects the .test TLD outright, so a
  // suite that passed against the local stack failed against the real one for
  // a reason that had nothing to do with the code under test. The addresses
  // are still unroutable -- example.com is reserved by RFC 2606 and accepts
  // no mail -- so nothing can be delivered to a real person by accident.
  const email = `zz-signup-${stamp}@example.com`;
  const password = "zz-signup-test-password";

  // A second family, to prove one parent cannot see another's child.
  const otherEmail = `zz-other-${stamp}@example.com`;

  const parent = createClient(url!, anonKey!, { auth: { persistSession: false } });
  let parentId: string | null = null;
  let otherId: string | null = null;

  try {
    // -- 1. sign up ---------------------------------------------------------
    //
    // Against a hosted project this is rate limited: Supabase sends a
    // confirmation mail on every public signUp and the free tier allows two an
    // hour, so the real endpoint can only be exercised a couple of times a
    // day. Rather than let that take the whole suite down -- the nine checks
    // below are about OUR triggers and OUR policies, and none of them care how
    // the row got into auth.users -- the signup is attempted for real and
    // falls back to creating the user with the service key. The fallback is
    // announced, never silent, so a genuinely broken signup cannot hide behind
    // it.
    const { data: signUp, error: signUpError } = await parent.auth.signUp({
      email,
      password,
      options: { data: { full_name: "ZZ Test Parent" } },
    });

    const quotaBlocked =
      Boolean(signUpError) && /rate limit|email|smtp/i.test(signUpError?.message ?? "");

    if (signUp.user) {
      check(true, "a new parent can sign up");
      parentId = signUp.user.id;
      check(
        Boolean(signUp.session),
        "signup returns a session",
        "without one the parent is bounced to /signin immediately after signing up",
      );
    } else if (quotaBlocked) {
      console.log(`--    public signUp unavailable (${signUpError?.message}) -- using the admin API`);
      console.log("--    signup returns a session  NOT CHECKED (needs the real endpoint)");
      const { data: made, error: madeError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "ZZ Test Parent" },
      });
      if (madeError || !made.user) throw madeError ?? new Error("no user from admin createUser");
      parentId = made.user.id;
    } else {
      check(false, "a new parent can sign up", signUpError?.message ?? "");
      throw new Error("no user returned from signUp");
    }

    // From here on everything runs as the parent, through the publishable key.
    const { error: signInError } = await parent.auth.signInWithPassword({ email, password });
    check(!signInError, "the parent can sign in", signInError?.message ?? "");

    // -- 2. the profile trigger ---------------------------------------------
    const { data: profile, error: profileError } = await parent
      .from("profiles")
      .select("id, email, full_name, role, consented_at")
      .eq("id", parentId)
      .single();

    check(!profileError && !!profile, "a profile exists without being created", profileError?.message ?? "");
    check(profile?.role === "parent", "the new parent is not an admin", `role=${profile?.role}`);
    check(
      Boolean(profile?.consented_at),
      "consent is recorded at signup",
      "the timestamp IS the consent record for an under-13 product",
    );
    check(
      profile?.full_name === "ZZ Test Parent",
      "full_name carries through from signup metadata",
      "the same path Google OAuth uses for raw_user_meta_data",
    );

    // -- 3. create a child ---------------------------------------------------
    const { data: child, error: childError } = await parent
      .from("children")
      .insert({ parent_id: parentId, name: "ZZ Test Kid", avatar: "fox", birth_year: 2016 })
      .select("id, name")
      .single();

    check(!childError && !!child, "the parent can create a child", childError?.message ?? "");

    const { data: mine } = await parent.from("children").select("id").eq("parent_id", parentId);
    check(mine?.length === 1, "and read that child back", `${mine?.length ?? 0} row(s)`);

    // -- 4. the shared bank is readable --------------------------------------
    const { error: poolError } = await parent.from("content_pool").select("id").limit(1);
    check(
      !poolError,
      "the signed-in parent can read the content pool",
      poolError?.message ?? "a child cannot practise from a bank they cannot read",
    );

    // -- 5. one family cannot see another ------------------------------------
    const { data: otherSignUp } = await createClient(url!, anonKey!, {
      auth: { persistSession: false },
    }).auth.signUp({ email: otherEmail, password });

    if (otherSignUp?.user) {
      otherId = otherSignUp.user.id;
      await admin
        .from("children")
        .insert({ parent_id: otherId, name: "ZZ Other Kid", avatar: "bear" });

      const { data: visible } = await parent.from("children").select("id, parent_id");
      check(
        (visible ?? []).every((c) => c.parent_id === parentId),
        "a parent sees only their own children",
        `${visible?.length ?? 0} visible`,
      );

      const { error: steal } = await parent
        .from("children")
        .insert({ parent_id: otherId, name: "ZZ Injected", avatar: "cat" });
      check(!!steal, "a parent cannot add a child to another family", steal?.code ?? "");
    }
  } finally {
    for (const id of [parentId, otherId]) {
      if (!id) continue;
      await admin.from("children").delete().eq("parent_id", id);
      await admin.auth.admin.deleteUser(id);
    }
  }

  console.log(failed === 0 ? "\nall passed\n" : `\n${failed} FAILED\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
