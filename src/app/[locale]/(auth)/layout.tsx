import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * The auth screens sit on the same warm paper as the landing page.
 *
 * This is the first thing a parent sees *after* being convinced, and it used
 * to be a bare card on a flat background — nothing carried over from the page
 * that sold them, so the product appeared to change hands at the worst
 * possible moment.
 */
export default function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-7 px-4 py-12">
      <PaperGround />

      <Link
        href="/"
        className="flex items-center gap-2.5 font-heading text-2xl font-bold transition-transform hover:scale-[1.02]"
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-pop-sm">
          <Sparkles className="size-5.5" />
        </span>
        Shikhi Digital
      </Link>

      {children}
    </main>
  );
}

/** The landing page's ground, so the two screens read as one product. */
function PaperGround() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 22%, transparent) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 35%, transparent 100%)",
        }}
      />
      <div className="absolute -top-24 -left-24 size-[28rem] rounded-full bg-grape/12 blur-[110px]" />
      <div className="absolute -right-20 bottom-0 size-[24rem] rounded-full bg-sunny/18 blur-[110px]" />
    </div>
  );
}
