import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "../auth-form";

export default async function SignInPage({ params }: PageProps<"/[locale]/signin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthForm mode="signin" />;
}
