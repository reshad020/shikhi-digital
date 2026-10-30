"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  BookOpen,
  CalendarDays,
  Calculator,
  Ear,
  Globe,
  GraduationCap,
  LogOut,
  Menu,
  Moon,
  NotebookPen,
  ScanSearch,
  Sparkles,
  Sun,
  Swords,
  Target,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ChildAvatar } from "@/components/child-avatar";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { directionOf, locales, type Locale } from "@/i18n/routing";
import { setMuted } from "@/lib/sound";
import { useProgress } from "@/stores/progress";

/**
 * The header, and the only navigation in the product.
 *
 * Three things here were broken in ways that do not show up on a desktop
 * screen, which is the only place anyone had looked:
 *
 * - **Below 640px there was no navigation at all.** The link row was
 *   `hidden sm:flex` and nothing replaced it, so on a phone a signed-in child
 *   could reach a section only from the shortcut grid on `/learn` — and only
 *   while standing on `/learn`. From a lesson, from `/maths`, from anywhere
 *   else, the sole way out was the logo. Children use phones.
 * - **Desktop and mobile could drift**, because each would have listed its
 *   own links. The destinations now live in one array that both read, so a
 *   new section cannot appear in one and not the other.
 * - **Nothing showed where you were.** Ten links, none marked. Highlighting
 *   the current section is the cheapest orientation there is.
 *
 * The language switcher moved into the menu on small screens for the same
 * reason: six chips, an avatar and three icon buttons do not fit across a
 * 360px phone, and they were pushing each other out of the bar.
 */

type NavItem = {
  href:
    | "/learn"
    | "/maths"
    | "/yle"
    | "/yle/progress"
    | "/daily"
    | "/listening"
    | "/tricks"
    | "/steelman"
    | "/thinking"
    | "/progress"
    | "/parent"
    | "/children";
  label: string;
  icon: React.ReactNode;
  /** Hidden from a signed-out visitor. */
  private?: boolean;
  /** Which menu heading it sits under. */
  group: "learn" | "daily" | "you";
};

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
  const tl = useTranslations("listening");
  const tk = useTranslations("tricks");
  const ty = useTranslations("yle");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // The Sheet takes physical sides only, so the logical one is worked out
  // here: in Arabic the menu must come in from the right like everything else.
  const menuSide = directionOf(locale) === "rtl" ? "right" : "left";

  const soundOn = useProgress((s) => s.soundOn);
  const toggleSound = useProgress((s) => s.toggleSound);

  function switchLocale(next: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  /** The single list. Both the bar and the menu render from this. */
  const items: NavItem[] = [
    { href: "/learn", label: t("lessons"), icon: <BookOpen className="size-5" />, group: "learn", private: true },
    { href: "/maths", label: t("maths"), icon: <Calculator className="size-5" />, group: "learn" },
    { href: "/yle", label: t("yle"), icon: <GraduationCap className="size-5" />, group: "learn" },
    { href: "/listening", label: tl("title"), icon: <Ear className="size-5" />, group: "learn", private: true },
    { href: "/yle/progress", label: ty("yleProgressLink"), icon: <Target className="size-5" />, group: "you", private: true },

    { href: "/daily", label: td("title"), icon: <CalendarDays className="size-5" />, group: "daily", private: true },
    { href: "/tricks", label: tk("title"), icon: <ScanSearch className="size-5" />, group: "daily", private: true },
    { href: "/steelman", label: ts("title"), icon: <Swords className="size-5" />, group: "daily", private: true },

    { href: "/thinking", label: t("thinking"), icon: <NotebookPen className="size-5" />, group: "you", private: true },
    { href: "/progress", label: t("progress"), icon: <TrendingUp className="size-5" />, group: "you", private: true },
    { href: "/parent", label: t("parent"), icon: <Users className="size-5" />, group: "you", private: true },
  ];

  const visible = items.filter((i) => signedIn || !i.private);

  /** `/maths/fractions` should light up "Maths", so this matches the section. */
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const groups: { key: NavItem["group"]; label: string }[] = [
    { key: "learn", label: t("groupLearn") },
    { key: "daily", label: t("groupDaily") },
    { key: "you", label: t("groupYou") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        {/* The menu sits first on small screens, where it is the navigation. */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-full lg:hidden"
                aria-label={t("openMenu")}
              >
                <Menu className="size-6" />
              </Button>
            }
          />
          <SheetContent side={menuSide} className="w-[20rem] max-w-[85vw] overflow-y-auto p-0">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle className="font-heading text-lg font-extrabold">
                {t("menuTitle")}
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-5 px-3 py-4">
              {groups.map((group) => {
                const inGroup = visible.filter((i) => i.group === group.key);
                if (inGroup.length === 0) return null;

                return (
                  <div key={group.key}>
                    <p className="px-2 pb-1 font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                      {group.label}
                    </p>
                    <div className="flex flex-col">
                      {inGroup.map((item) => (
                        <SheetClose
                          key={item.href}
                          render={
                            <Link
                              href={item.href}
                              aria-current={isCurrent(item.href) ? "page" : undefined}
                              // Tall rows: a child aiming with a thumb needs a
                              // target, not a line of text.
                              className={`flex items-center gap-3 rounded-2xl px-3 py-3 font-heading font-bold transition-colors ${
                                isCurrent(item.href)
                                  ? "bg-primary/12 text-primary"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <span className="shrink-0" aria-hidden>
                                {item.icon}
                              </span>
                              {item.label}
                            </Link>
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Language lives here below lg, where it does not fit in the bar. */}
              <div className="border-t border-border pt-4">
                <p className="px-2 pb-2 font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                  {t("groupLanguage")}
                </p>
                <div className="grid grid-cols-3 gap-2 px-2">
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      disabled={isPending}
                      onClick={() => switchLocale(l.code)}
                      aria-current={l.code === locale ? "true" : undefined}
                      className={`rounded-xl border-2 px-2 py-2 text-sm font-bold transition-colors ${
                        l.code === locale
                          ? "border-primary bg-primary/12 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              {signedIn && (
                <div className="border-t border-border px-2 pt-4">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 font-heading font-bold text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <LogOut className="size-5" aria-hidden />
                      {ta("signOut")}
                    </button>
                  </form>
                </div>
              )}

              {!signedIn && (
                <div className="flex flex-col gap-2 border-t border-border px-2 pt-4">
                  <SheetClose
                    render={
                      <Link
                        href="/signup"
                        className="btn-pop grid h-12 place-items-center rounded-full bg-primary font-heading font-extrabold text-primary-foreground"
                      >
                        {ta("signUp")}
                      </Link>
                    }
                  />
                  <SheetClose
                    render={
                      <Link
                        href="/signin"
                        className="grid h-11 place-items-center rounded-full border-2 border-border font-heading font-bold"
                      >
                        {ta("signIn")}
                      </Link>
                    }
                  />
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-pop-sm">
            <Sparkles className="size-5" />
          </span>
          {/* The wordmark is the widest thing in the bar on a phone, and the
              icon already identifies the site once you are inside it. */}
          <span className="hidden sm:inline">Shikhi Digital</span>
        </Link>

        {/* Ten links do not fit a tablet either, so the bar starts at lg and
            the menu covers everything below it. */}
        <nav className="ms-1 hidden items-center gap-0.5 text-sm font-semibold text-muted-foreground lg:flex">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={`rounded-full px-3 py-2 transition-colors ${
                isCurrent(item.href)
                  ? "bg-primary/12 font-bold text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          {child && (
            <Link
              href="/children"
              title={tc("switch")}
              className="flex items-center gap-2 rounded-full border border-border bg-card py-1 ps-1 pe-1 font-bold hover:bg-muted sm:pe-3"
            >
              <ChildAvatar avatar={child.avatar} className="size-7" />
              <span className="hidden max-w-24 truncate text-sm sm:inline">{child.name}</span>
            </Link>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full sm:size-9"
                  aria-label={soundOn ? t("soundOff") : t("soundOn")}
                  onClick={() => {
                    toggleSound();
                    setMuted(soundOn);
                  }}
                >
                  {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                </Button>
              }
            />
            <TooltipContent>{soundOn ? t("soundOff") : t("soundOn")}</TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full sm:size-9"
            aria-label={t("toggleTheme")}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-5 dark:hidden" />
            <Moon className="hidden size-5 dark:block" />
          </Button>

          {!signedIn && (
            <>
              <Link
                href="/signin"
                className="hidden rounded-full px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted sm:block"
              >
                {ta("signIn")}
              </Link>
              <Link
                href="/signup"
                className="btn-pop rounded-full bg-primary px-4 py-2 font-heading text-sm font-extrabold text-primary-foreground"
              >
                {ta("signUp")}
              </Link>
            </>
          )}

          {signedIn && (
            <form action={signOut} className="hidden sm:block">
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

          <div className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 lg:flex">
            <Globe className="ms-1 size-4 text-muted-foreground" aria-hidden />
            {locales.map((l) => (
              <button
                key={l.code}
                type="button"
                disabled={isPending}
                onClick={() => switchLocale(l.code)}
                aria-current={l.code === locale ? "true" : undefined}
                title={l.label}
                className={`min-w-8 rounded-full px-2 py-1 text-sm leading-none font-bold transition-colors ${
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
