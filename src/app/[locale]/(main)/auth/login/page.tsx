import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginPageView from "@/components/Auth/LoginPageView";
import { buildSeoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "auth/login",
    title: t("auth.loginTitle"),
    description: t("auth.loginDescription"),
    keywords: t("auth.loginKeywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  return <LoginPageView locale={locale} />;
}
