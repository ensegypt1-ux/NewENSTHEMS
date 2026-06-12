import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import HeroContent from "@/components/HomePage/HeroContent";
import HomeCTASection from "@/components/HomePage/HomeCTASection";
import LiveRestaurantSection from "@/components/HomePage/LiveRestaurantSection";
import TransformShowcaseSection from "@/components/HomePage/TransformShowcaseSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "",
    title: t("home.title"),
    description: t("home.description"),
    keywords: t("home.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

async function Page({ params }: Props) {
  const { locale } = await params;

  return (
    <>
      <HeroContent locale={locale} />
      <TransformShowcaseSection locale={locale} />
      <LiveRestaurantSection locale={locale} />
      <HomeCTASection locale={locale} />
    </>
  );
}

export default Page;
