import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/seo/config";

/**
 * The privacy policy.
 *
 * Deliberately written in English for every locale. A privacy policy is the
 * document a parent is asked to rely on and a regulator would read, and a
 * machine translation of one creates six subtly different promises about a
 * child's data. One authoritative version is worth more than six approximate
 * ones; if this is ever translated it should be by a person, and each version
 * dated separately.
 *
 * Kept as prose in the page rather than in `messages/*.json` for the same
 * reason -- it is a document, not interface copy, and it changes on its own
 * schedule.
 *
 * It is public (see PUBLIC_PATHS in src/proxy.ts): Google will not let an
 * OAuth app out of testing without a privacy policy reachable without a login,
 * and more to the point a parent must be able to read it BEFORE handing over
 * their child's work.
 */

const UPDATED = "30 October 2026";

/**
 * The one thing on this page that is a promise not yet kept: this mailbox has
 * to exist and be read before the policy is true.
 */
const CONTACT = "privacy@shikhi.digital";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy",
    description: `How ${SITE.name} handles your family's information.`,
    alternates: { canonical: `${SITE.url}/${locale}/privacy` },
  };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">Privacy</h1>
          <p className="mt-2 text-muted-foreground">Last updated {UPDATED}.</p>
        </header>

        <div className="rounded-[1.75rem] border-2 border-mint/50 bg-mint/10 p-6">
          <h2 className="font-heading text-lg font-extrabold">The short version</h2>
          <ul className="mt-3 flex flex-col gap-2 text-[0.95rem] leading-relaxed">
            <Tick>We ask for as little as we can: your email, a first name for each child.</Tick>
            <Tick>
              Speaking recordings never leave your device. We do not receive them and cannot store
              them.
            </Tick>
            <Tick>
              What a child writes is sent to Google&rsquo;s AI service so it can be given feedback.
            </Tick>
            <Tick>No advertising, no trackers, no analytics, and nothing is ever sold.</Tick>
            <Tick>Ask us to delete your family&rsquo;s account and we delete all of it.</Tick>
          </ul>
        </div>

        <Section title="Who this is for">
          <P>
            {SITE.name} is used by children, normally between eight and thirteen, with a parent or
            guardian&rsquo;s involvement. The account belongs to the adult. Children do not have
            their own login, and we never ask a child for an email address, a phone number or a
            photograph.
          </P>
          <P>
            When you create an account you confirm that you are the parent or guardian and that you
            agree to us storing what your children write. We record the moment you did that. That
            record is the basis on which we hold anything about your child at all.
          </P>
        </Section>

        <Section title="What we hold">
          <P>Your account:</P>
          <Ul>
            <Li>
              Your email address and the name on your Google account, which Google gives us when
              you sign in.
            </Li>
            <Li>The date and time you gave the consent described above.</Li>
            <Li>Whether you want the weekly email.</Li>
          </Ul>

          <P className="mt-5">Each child profile you create:</P>
          <Ul>
            <Li>
              A first name or nickname &mdash; whatever you type. It is shown back to your child and
              used in your weekly email. It does not have to be their real name.
            </Li>
            <Li>Optionally a year of birth, used only to pitch the material.</Li>
            <Li>
              A chosen avatar. These are drawings we ship with the app, picked from a list. There is
              no way to upload a picture, so we never hold one.
            </Li>
          </Ul>

          <P className="mt-5">What your child does here:</P>
          <Ul>
            <Li>
              Their answers, and the sentences they write when a task asks them to explain their
              thinking.
            </Li>
            <Li>The feedback our AI wrote back to them.</Li>
            <Li>
              Which exercises they have already seen and how they did, so we do not repeat material
              and can show you progress.
            </Li>
          </Ul>
        </Section>

        <Section title="Speaking practice stays on your device">
          <P>
            When your child records themselves answering a speaking card, the recording is held by
            the browser on that device and played back from there. It is not uploaded, it does not
            reach our servers, and we have no copy of it. Closing the page discards it.
          </P>
          <P>
            This is a deliberate limit rather than an oversight. It means a child can practise out
            loud as often as they like without a recording of their voice existing anywhere but
            their own device. It also means we cannot grade speaking yet. We think that is the right
            way round for now, and if it ever changes we will ask you first.
          </P>
        </Section>

        <Section title="How we use artificial intelligence">
          <P>
            We use Google&rsquo;s Gemini service for two things: writing the practice material, and
            reading what your child wrote in order to respond to it.
          </P>
          <P>
            The second one matters, so plainly: <strong>when your child writes an answer, the text
            they wrote is sent to Google</strong> so that a reply can be generated. It is sent
            without your name, your email or your child&rsquo;s name attached. We use the paid
            Gemini API, under terms in which Google states that it does not use the content to train
            its models.
          </P>
          <P>
            Practice material generated this way is kept and reused for other families. It contains
            no child&rsquo;s work &mdash; it is questions and reading passages, generated from a
            topic, never from anything your child wrote.
          </P>
        </Section>

        <Section title="Who else is involved">
          <P>
            We keep the number of companies touching your family&rsquo;s data as small as we can
            manage. Today it is four, and each does one job:
          </P>
          <Ul>
            <Li>
              <strong>Supabase</strong> &mdash; stores the database and handles sign-in. Our data is
              held in Singapore.
            </Li>
            <Li>
              <strong>Vercel</strong> &mdash; serves the website.
            </Li>
            <Li>
              <strong>Google</strong> &mdash; sign-in, and the AI described above.
            </Li>
            <Li>
              <strong>Resend</strong> &mdash; delivers the weekly email, if you asked for it.
            </Li>
          </Ul>
          <P>
            There is no advertising on this site, no analytics product, and no third-party tracking
            script of any kind. We have never sold data and will not. If that changed it would
            require your consent, not a quiet edit to this page.
          </P>
        </Section>

        <Section title="What you can do">
          <Ul>
            <Li>
              <strong>Read everything.</strong> The parent area shows you every piece of writing
              your child has produced here, exactly as they wrote it.
            </Li>
            <Li>
              <strong>Stop the email.</strong> Every weekly email has a one-click unsubscribe, and
              you can switch it off in the parent area.
            </Li>
            <Li>
              <strong>Remove a child.</strong> Deleting a child profile deletes their work with it.
            </Li>
            <Li>
              <strong>Take it all back.</strong> Write to us and we will send you a copy of
              everything we hold about your family, or delete the account entirely. Deletion is
              permanent and takes the children&rsquo;s work with it.
            </Li>
          </Ul>
          <P>
            Depending on where you live you may have further rights over this information &mdash; to
            correct it, to object to how it is used, or to complain to a regulator. We will not make
            you quote a law to exercise any of them.
          </P>
        </Section>

        <Section title="How long we keep things">
          <P>
            Your child&rsquo;s work is kept while the account is open, because being able to look
            back at what they wrote six months ago is much of the point. When you delete the
            account, it goes. We keep no shadow copy, and backups holding it age out within thirty
            days.
          </P>
        </Section>

        <Section title="Security">
          <P>
            Every family&rsquo;s data is separated at the database itself rather than only in the
            app, so one account cannot read another&rsquo;s even if a page had a bug. Traffic is
            encrypted in transit. No system is perfect, and we would rather say so than imply
            otherwise.
          </P>
        </Section>

        <Section title="Changes">
          <P>
            If we change this policy we will change the date at the top. If a change actually
            affects what happens to your child&rsquo;s information &mdash; rather than fixing a
            clumsy sentence &mdash; we will tell you directly, and ask again where consent is
            needed.
          </P>
        </Section>

        <Section title="Contact">
          <P>
            Questions, corrections, or a request to see or delete your data:{" "}
            <a
              href={`mailto:${CONTACT}`}
              className="font-bold text-primary underline underline-offset-4"
            >
              {CONTACT}
            </a>
            . A person reads it.
          </P>
        </Section>

        <p className="mt-10 border-t-2 border-border pt-6 text-sm text-muted-foreground">
          This policy is maintained in English. The rest of {SITE.name} is available in several
          languages; we would rather give you one version we are sure of than six we are not.
        </p>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="font-heading text-xl font-extrabold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`leading-relaxed ${className}`}>{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-2">{children}</ul>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 leading-relaxed">
      <span aria-hidden className="text-primary">
        &bull;
      </span>
      <span>{children}</span>
    </li>
  );
}

function Tick({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden className="font-bold text-mint">
        &#10003;
      </span>
      <span>{children}</span>
    </li>
  );
}
