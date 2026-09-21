"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Marked, Struck } from "./ink";

/**
 * The hero states the wedge as a correction, not a boast.
 *
 * "Every other app grades the answer" is the sentence a parent already half
 * believes; crossing out `answer` and writing `thinking` over the top of it is
 * the whole product in one gesture. The two lines are sized against each other
 * on purpose — the claim being rejected is set small and grey, the claim being
 * made is enormous.
 *
 * The entrance is CSS keyframes rather than the GSAP timeline used elsewhere
 * in the app, and that is deliberate: this is the one screen where the text
 * must never be waiting on a JavaScript library. A `gsap.from()` sets opacity
 * to 0 the instant the timeline is built, so any hitch between that and the
 * first frame leaves the most important sentence on the site invisible. CSS
 * animations cannot fail that way.
 */
export function Hero() {
  const t = useTranslations("landing.hero");
  const reduced = useReducedMotion();

  const payoff = t("payoff").split(" ");
  const keyword = t("payoffKeyword");

  return (
    <section className="relative px-4 pt-14 pb-6 sm:pt-20">
      <PaperGround />

      <div className="mx-auto max-w-4xl text-center">
        <span
          className="rise inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-1.5 font-heading text-sm font-bold text-muted-foreground shadow-pop-sm"
          style={{ animationDelay: "40ms" }}
        >
          <span className="size-2 rounded-full bg-mint" aria-hidden />
          {t("eyebrow")}
        </span>

        <h1 className="mt-7">
          {/* The rejected premise. Deliberately small — a parent should feel
              they are reading something they already suspected. */}
          <span
            className="rise block font-heading text-xl font-bold text-muted-foreground sm:text-2xl"
            style={{ animationDelay: "180ms" }}
          >
            {t("oldLead")} <Struck>{t("oldKeyword")}</Struck>
            {t("oldTail")}
          </span>

          <span className="mt-3 block font-heading text-[2.75rem] leading-[0.98] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-[5.25rem]">
            {payoff.map((word, i) => {
              const bare = word.replace(/[.,!?]/g, "");
              return (
                <span
                  key={`${word}-${i}`}
                  className="rise-lg inline-block"
                  style={{ animationDelay: `${330 + i * 70}ms` }}
                >
                  {bare === keyword ? <Marked delay={0.95}>{word}</Marked> : word}
                  {i < payoff.length - 1 ? " " : ""}
                </span>
              );
            })}
          </span>
        </h1>

        <p
          className="rise mx-auto mt-8 max-w-2xl text-lg leading-relaxed font-medium text-muted-foreground text-balance sm:text-xl"
          style={{ animationDelay: "640ms" }}
        >
          {t("sub")}
        </p>

        <div
          className="rise mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "760ms" }}
        >
          <motion.div
            whileHover={reduced ? undefined : { scale: 1.03 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
          >
            <Button
              size="lg"
              nativeButton={false}
              className="btn-pop h-14 rounded-full px-9 text-base font-bold"
              render={<Link href="/signup" />}
            >
              {t("cta")}
              <ArrowRight className="size-5 rtl:rotate-180" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={reduced ? undefined : { scale: 1.03 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
          >
            {/* A same-page anchor rather than a route: the report is the thing
                a sceptical parent came to evaluate, and making them sign up to
                see it is exactly the wrong order. */}
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-14 rounded-full border-2 bg-card px-8 text-base font-bold"
              render={<a href="#report" />}
            >
              {t("secondary")}
            </Button>
          </motion.div>
        </div>

        <p
          className="rise mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
          style={{ animationDelay: "880ms" }}
        >
          <ShieldCheck className="size-4 text-mint" aria-hidden />
          {t("trust")}
        </p>
      </div>
    </section>
  );
}

/**
 * The ground the whole page sits on: warm paper, a faint dot grid, and three
 * slow colour washes. Washes rather than the usual hard blobs, because the
 * page carries a lot of high-contrast ink and a busy background fights every
 * stroke.
 */
function PaperGround() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 22%, transparent) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%)",
        }}
      />
      <div className="absolute -top-24 -left-24 size-[32rem] rounded-full bg-grape/12 blur-[110px]" />
      <div className="absolute -top-16 -right-16 size-[26rem] rounded-full bg-sunny/20 blur-[110px]" />
      <div className="absolute top-[20rem] left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-mint/12 blur-[120px]" />
    </div>
  );
}
