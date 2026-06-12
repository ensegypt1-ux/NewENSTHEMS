import { getTranslations } from "next-intl/server";
import ForwardArrow from "@/components/Global/ForwardArrow";
import { DemoVideoTrigger } from "@/components/HomePage/DemoVideoModal";
import { buildHeroChatTurns } from "@/lib/mockDemoProducts";
import HeroBackground from "@/components/HomePage/HeroBackground";
import HeroPhoneMockup from "@/components/HomePage/HeroPhoneMockup";
import {
  MarketingAccent,
  MarketingBadge,
  MarketingButtonLink,
  MarketingButtonRow,
  MarketingHeading,
  MarketingPill,
  MarketingPillRow,
  MarketingSection,
  MarketingSplit,
  MarketingSplitContent,
  MarketingSplitVisual,
  MarketingText,
} from "@/components/marketing";

type HeroContentProps = {
  locale: string;
};

export default async function HeroContent({ locale }: HeroContentProps) {
  const t = await getTranslations({ locale, namespace: "heroSection" });

  const pills = [t("pill1"), t("pill2"), t("pill3"), t("pill4")];

  const chatTurns = buildHeroChatTurns(
    {
      item1: t("mockItem1"),
      item2: t("mockItem2"),
      item3: t("mockItem3"),
      item4: t("mockItem4"),
    },
    {
      user1: t("mockChat.user1"),
      lina1: t("mockChat.lina1"),
      user2: t("mockChat.user2"),
      lina2: t("mockChat.lina2"),
    },
  );

  return (
    <MarketingSection
      id="hero"
      variant="hero"
      className="relative !pb-12 lg:!pb-14"
    >
      <HeroBackground />

      <div className="container relative z-10">
        <MarketingSplit>
          <MarketingSplitContent>
            <MarketingBadge className="mb-6">{t("badge")}</MarketingBadge>

            <MarketingHeading as="h1" level="display" className="mb-5">
              {t("title1")}{" "}
              <MarketingAccent>{t("title2")}</MarketingAccent>
            </MarketingHeading>

            <MarketingText variant="subtitle" className="mb-8">
              {t("description")}
            </MarketingText>

            <MarketingButtonRow className="mb-6">
              <MarketingButtonLink href="/auth/register" prefetch={false}>
                {t("cta")}
                <ForwardArrow />
              </MarketingButtonLink>
              <DemoVideoTrigger variant="hero">{t("secondaryCta")}</DemoVideoTrigger>
            </MarketingButtonRow>

            <MarketingPillRow className="mb-5">
              {pills.map((pill) => (
                <MarketingPill key={pill}>{pill}</MarketingPill>
              ))}
            </MarketingPillRow>

            <MarketingText variant="caption">{t("trustLine")}</MarketingText>
          </MarketingSplitContent>

          <MarketingSplitVisual className="mx-auto hidden h-[440px] w-[320px] shrink-0 sm:h-[480px] sm:w-[350px] lg:mx-0 lg:block lg:max-w-[380px]">
            <HeroPhoneMockup
              businessName={t("businessName")}
              turns={chatTurns}
            />
          </MarketingSplitVisual>
        </MarketingSplit>
      </div>
    </MarketingSection>
  );
}
