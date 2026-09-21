import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-heading text-2xl font-bold">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-pop-sm">
          <Sparkles className="size-5" />
        </span>
        Shikhi Digital
      </Link>
      {children}
    </main>
  );
}
