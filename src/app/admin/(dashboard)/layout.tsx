import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, LogOut, Plus, ScanEye, ShieldAlert, Swords, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  // A signed-in non-admin gets a 404 rather than a "forbidden": there is no
  // reason to tell an ordinary parent that an admin area exists at all.
  const profile = await getProfile();
  if (profile?.role !== "admin") notFound();

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-heading text-lg font-bold">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            Shikhi Digital Admin
          </Link>
          <nav className="ms-4 hidden items-center gap-1 text-sm font-semibold text-muted-foreground sm:flex">
            <Link className="rounded-full px-3 py-2 hover:bg-muted" href="/admin">Lessons</Link>
            <Link className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-muted" href="/admin/daily">
              <CalendarDays className="size-4" />
              Daily
            </Link>
            <Link className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-muted" href="/admin/tricks">
              <ScanEye className="size-4" />
              Tricks
            </Link>
            <Link className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-muted" href="/admin/steelman">
              <Swords className="size-4" />
              Steelman
            </Link>
            <Link className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-muted" href="/admin/flagged">
              <ShieldAlert className="size-4" />
              Flagged
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="rounded-full font-bold" render={<Link href="/admin/new" />}>
              <Plus className="size-4" />
              New lesson
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon" className="rounded-full" aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
