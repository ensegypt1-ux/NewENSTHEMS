import { getTranslations } from "next-intl/server";
import { mockDemoProductImages } from "@/lib/mockDemoProducts";
import LiveRestaurantShowcase, {
  type OrderStatus,
} from "@/components/HomePage/LiveRestaurantShowcase";

type LiveRestaurantSectionProps = {
  locale: string;
};

export default async function LiveRestaurantSection({
  locale,
}: LiveRestaurantSectionProps) {
  const t = await getTranslations({ locale, namespace: "liveRestaurantSection" });

  const featureIds = [
    "liveTracking",
    "orderStatus",
    "kitchenAlerts",
    "tablesQr",
    "liveStats",
  ] as const;

  const features = featureIds.map((id) => ({
    id,
    title: t(`features.${id}.title`),
    description: t(`features.${id}.description`),
  }));

  const demoImages = [
    mockDemoProductImages.grilledChicken,
    mockDemoProductImages.orangeJuice,
    mockDemoProductImages.cheesecake,
  ] as const;

  const products = [1, 2, 3].map((n) => ({
    name: t(`dashboard.products.${n}.name`),
    orders: t(`dashboard.products.${n}.orders`),
    image: demoImages[n - 1],
  }));

  const opsHighlights = [1, 2, 3, 4, 5].map((n) => ({
    id: String(n),
    title: t(`dashboard.ops.${n}.title`),
    description: t(`dashboard.ops.${n}.description`),
    showStatusLegend: n === 2,
  }));

  const statusLabels = {
    new: t("dashboard.statusNew"),
    progress: t("dashboard.statusProgress"),
    done: t("dashboard.statusDone"),
  };

  const orders = [1, 2, 3].map((n) => ({
    id: t(`dashboard.orders.${n}.id`),
    items: t(`dashboard.orders.${n}.items`),
    time: t(`dashboard.orders.${n}.time`),
    status: t(`dashboard.orders.${n}.status`) as OrderStatus,
  }));

  const alertIds = ["qrScan", "kitchen", "newOrder"] as const;
  const alertTones = {
    qrScan: "emerald",
    kitchen: "amber",
    newOrder: "purple",
  } as const;

  const alerts = alertIds.map((id) => ({
    id,
    title: t(`alerts.${id}.title`),
    subtitle: t(`alerts.${id}.subtitle`),
    tone: alertTones[id] as "emerald" | "amber" | "purple",
  }));

  return (
    <section
      id="live-restaurant"
      className="live-restaurant-section relative border-t border-slate-100 dark:border-slate-800/80"
    >
      <div className="home-section-shell relative z-[1] py-10 sm:py-12 lg:py-20">
        <LiveRestaurantShowcase
          badge={t("badge")}
          title={t("title")}
          titleAccent={t("titleAccent")}
          subtitle={t("subtitle")}
          features={features}
          restaurantName={t("dashboard.restaurantName")}
          liveLabel={t("dashboard.live")}
          popularTitle={t("dashboard.popularTitle")}
          opsTitle={t("dashboard.opsTitle")}
          liveOrdersTitle={t("dashboard.liveOrdersTitle")}
          opsHighlights={opsHighlights}
          statusLabels={statusLabels}
          products={products}
          orders={orders}
          alerts={alerts}
          trustTagline={t("trustTagline")}
          mobileSwipeHint={t("mobileSwipeHint")}
        />
      </div>

      <div className="home-cta-transition-bridge" aria-hidden />
    </section>
  );
}
