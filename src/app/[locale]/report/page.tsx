import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getActiveChild, listChildren } from "@/lib/data/children";

/**
 * "/report" with no child named — send them to whoever is currently learning on
 * this device, or to the chooser if that is ambiguous.
 */
export default async function ReportIndexPage({ params }: PageProps<"/[locale]/report">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const child = await getActiveChild();
  if (child) redirect(`/${locale}/report/${child.id}`);

  const children = await listChildren();
  redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
}
