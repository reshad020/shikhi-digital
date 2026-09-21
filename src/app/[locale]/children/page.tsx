import { setRequestLocale, getTranslations } from "next-intl/server";
import { listChildren, getActiveChild } from "@/lib/data/children";
import { ChildPicker } from "./child-picker";

export default async function ChildrenPage({
  params,
  searchParams,
}: PageProps<"/[locale]/children">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("children");

  const [children, active] = await Promise.all([listChildren(), getActiveChild()]);
  const openAddForm = (await searchParams).add === "1" || children.length === 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 px-4 py-12">
      <header className="text-center">
        <h1 className="font-heading text-4xl font-extrabold text-balance">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {children.length === 0 ? t("empty") : t("subtitle")}
        </p>
      </header>

      <ChildPicker
        childProfiles={children}
        activeId={active?.id ?? null}
        defaultOpen={openAddForm}
        locale={locale}
      />
    </main>
  );
}
