"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Circled } from "./ink";

/**
 * The close, inverted.
 *
 * The page has run on warm paper the whole way down; dropping to deep grape
 * here is the full stop. The headline is a question rather than a pitch,
 * because the honest reason a parent signs up for this is that they do not
 * actually know the answer to it.
 */
export function ClosingCta() {
  const t = useTranslations("landing.close");
  const reduced = useReducedMotion();

  return (
    <section className="px-4 pb-20">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] bg-grape px-6 py-16 text-center sm:px-12 sm:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--primary-foreground) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 100%)",
          }}
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-heading text-[2.1rem] leading-[1.08] font-extrabold text-balance text-primary-foreground sm:text-5xl">
            {t("lead")} <Circled className="text-sunny">{t("keyword")}</Circled> {t("tail")}
          </h2>

          <p className="mx-auto mt-6 max-w-lg leading-relaxed font-medium text-primary-foreground/75">
            {t("sub")}
          </p>

          <motion.div
            className="mt-9 inline-block"
            whileHover={reduced ? undefined : { scale: 1.03 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
          >
            <Button
              size="lg"
              className="btn-pop h-14 rounded-full bg-sunny px-9 text-base font-extrabold text-[oklch(0.3_0.09_70)] hover:bg-sunny/90"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              {t("cta")}
              <ArrowRight className="size-5 rtl:rotate-180" />
            </Button>
          </motion.div>

          <p className="mt-5 text-sm font-semibold text-primary-foreground/65">{t("note")}</p>
        </div>
      </motion.div>
    </section>
  );
}
