import type { ReactNode } from "react";

/**
 * One rhythm for every section on the page: a small coloured kicker, a large
 * heading, and at most one paragraph of lead.
 *
 * No hooks and no client directive, so section furniture is server-rendered
 * and the only JavaScript the landing page ships is the parts that actually
 * move.
 */
export function Section({
  id,
  kicker,
  heading,
  lead,
  children,
  tone = "text-grape",
  className = "",
}: {
  id?: string;
  kicker: string;
  heading: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`px-4 py-16 sm:py-24 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <p
            className={`font-heading text-sm font-extrabold tracking-[0.18em] uppercase ${tone}`}
          >
            {kicker}
          </p>
          <h2 className="mt-3 font-heading text-[2rem] leading-[1.05] font-extrabold text-balance sm:text-5xl">
            {heading}
          </h2>
          {lead && (
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed font-medium text-muted-foreground text-balance">
              {lead}
            </p>
          )}
        </header>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
