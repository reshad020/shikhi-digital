"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Globe, LogOut, Moon, Sparkles, Sun, Volume2, VolumeX } from "lucide-react";
import { ChildAvatar } from "@/components/child-avatar";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { setMuted } from "@/lib/sound";
import { useProgress } from "@/stores/progress";

export function SiteHeader({
  child,
  signedIn = false,
}: {
  child?: { id: string; name: string; avatar: string } | null;
  signedIn?: boolean;
} = {}) {
  const t = useTranslations("nav");
  const tc = useTranslations("children");
  const td = useTranslations("daily");
  const ta = useTranslations("auth");
  const ts = useTranslations("steelman");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme, setTheme } = useTheme();

  const soundOn = useProgress((s) => s.soundOn);
  const toggleSound = useProgress((s) => s.toggleSound);

  function switchLocale(next: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-pop-sm">
            <Sparkles className="size-5" />
          </span>
          Shikhi Digital
        </Link>

        <nav className="ms-2 hidden items-center gap-1 text-sm font-semibold text-muted-foreground sm:flex">
          <Link
            className="rounded-full px-3 py-2 hover:bg-muted"
            href={signedIn ? "/learn" : "/"}
          >
            {t("lessons")}
          </Link>
          {signedIn && (
            <Link className="rounded-full px-3 py-2 hover:bg-muted" href="/daily">
              {td("title")}
            </Link>
          )}
          {signedIn && (
            <Link className="rounded-full px-3 py-2 hover:bg-muted" href="/tricks">
              Spot the Trick
            </Link>
          )}
          {signedIn && (
            <Link className="rounded-full px-3 py-2 hover:bg-muted" href="/steelman">
              {ts("title")}
            </Link>
          )}
          {signedIn && (
            <Link className="rounded-full px-3 py-2 hover:bg-muted" href="/progress">
              {t("progress")}
            </Link>
          )}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          {child && (
            <Link
              href="/children"
              title={tc("switch")}
              className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pe-3 ps-1 font-bold hover:bg-muted"
            >
              <ChildAvatar avatar={child.avatar} className="size-7" />
              <span className="max-w-24 truncate text-sm">{child.name}</span>
            </Link>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Toggle sound"
                  onClick={() => {
                    toggleSound();
                    setMuted(soundOn);
                  }}
                >
                  {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                </Button>
              }
            />
            <TooltipContent>{soundOn ? "Sound on" : "Sound off"}</TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-5 dark:hidden" />
            <Moon className="hidden size-5 dark:block" />
          </Button>

          {signedIn && (
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={ta("signOut")}
              >
                <LogOut className="size-5" />
              </Button>
            </form>
          )}

          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <Globe className="ms-1 size-4 text-muted-foreground" aria-hidden />
            {locales.map((l) => (
              <button
                key={l.code}
                type="button"
                disabled={isPending}
                onClick={() => switchLocale(l.code)}
                aria-current={l.code === locale ? "true" : undefined}
                title={l.label}
                className={`min-w-8 rounded-full px-2 py-1 text-sm font-bold leading-none transition-colors ${
                  l.code === locale
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span aria-hidden>{l.short}</span>
                <span className="sr-only">{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
