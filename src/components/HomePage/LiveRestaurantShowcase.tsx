"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiCheckCircle,
  FiGrid,
  FiSmartphone,
} from "react-icons/fi";
import HeroProductThumb from "@/components/HomePage/HeroProductThumb";
import { cn } from "@/lib/cn";

export type LiveFeature = {
  id: string;
  title: string;
  description: string;
};

export type LiveProduct = {
  name: string;
  orders: string;
  image: string;
};

export type LiveOpsHighlight = {
  id: string;
  title: string;
  description: string;
  showStatusLegend?: boolean;
};

export type LiveOrder = {
  id: string;
  items: string;
  time: string;
  status: OrderStatus;
};

export type OrderStatus = "new" | "progress" | "done";

export type OrderStatusLabels = {
  new: string;
  progress: string;
  done: string;
};

export type LiveAlert = {
  id: string;
  title: string;
  subtitle: string;
  tone: "emerald" | "amber" | "purple";
};

export type MobileFeature = {
  id: string;
  title: string;
};

export type MockOrderLabels = {
  badge: string;
  tableLabel: string;
  tableNumber: string;
  itemsLabel: string;
};

export type LiveRestaurantShowcaseProps = {
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  mobileTitle: string;
  mobileSubtitle: string;
  mobileSteps: [string, string, string];
  mobileFeatures: MobileFeature[];
  mockOrderLabels: MockOrderLabels;
  features: LiveFeature[];
  restaurantName: string;
  liveLabel: string;
  popularTitle: string;
  opsTitle: string;
  liveOrdersTitle: string;
  opsHighlights: LiveOpsHighlight[];
  statusLabels: OrderStatusLabels;
  products: LiveProduct[];
  orders: LiveOrder[];
  alerts: LiveAlert[];
  trustTagline: string;
  mobileSwipeHint?: string;
};

const FEATURE_ICONS = {
  liveTracking: FiActivity,
  orderStatus: FiCheckCircle,
  kitchenAlerts: FiBell,
  tablesQr: FiGrid,
  liveStats: FiBarChart2,
} as const;

const MOBILE_FEATURE_ICONS = {
  liveUpdates: FiActivity,
  kitchenAlert: FiBell,
  statusControl: FiCheckCircle,
} as const;

const OPS_ICONS = {
  "1": FiActivity,
  "2": FiCheckCircle,
  "3": FiBell,
  "4": FiGrid,
  "5": FiBarChart2,
} as const;

const ORDER_STATUS_TONE = {
  new: "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300",
  progress:
    "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300",
  done: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
} as const;

const ALERT_TONE = {
  emerald:
    "border-emerald-400/40 bg-emerald-50/95 shadow-[0_8px_28px_-12px_rgba(16,185,129,0.3)] dark:border-emerald-500/30 dark:bg-emerald-500/10",
  amber:
    "border-amber-400/40 bg-amber-50/95 shadow-[0_8px_28px_-12px_rgba(245,158,11,0.28)] dark:border-amber-500/30 dark:bg-amber-500/10",
  purple:
    "border-purple-300/50 bg-white/95 shadow-[0_10px_32px_-14px_rgba(124,58,237,0.3)] dark:border-purple-500/35 dark:bg-purple-500/10",
} as const;

type ShowcaseSlice = Omit<
  LiveRestaurantShowcaseProps,
  | "badge"
  | "title"
  | "titleAccent"
  | "subtitle"
  | "mobileTitle"
  | "mobileSubtitle"
  | "trustTagline"
>;

function SectionHeader({
  badge,
  title,
  titleAccent,
  subtitle,
  mobile,
}: {
  badge: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  mobile?: boolean;
}) {
  return (
    <header
      className={cn(
        "mx-auto max-w-3xl text-center",
        mobile ? "mb-8 px-1" : "mb-9",
      )}
    >
      <span className="live-restaurant-badge mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/90 px-3.5 py-1 text-[11px] font-semibold text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-300">
        <span className="live-restaurant-live-dot h-1.5 w-1.5 rounded-full bg-purple-500" />
        {badge}
      </span>
      <h2
        className={cn(
          "font-bold leading-tight tracking-tight text-slate-900 dark:text-white",
          mobile ? "text-[1.35rem] leading-snug" : "text-[2rem] lg:text-[2.35rem]",
        )}
      >
        {mobile || !titleAccent ? (
          title
        ) : (
          <>
            {title}{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent rtl:bg-gradient-to-l dark:from-purple-400 dark:to-indigo-400">
              {titleAccent}
            </span>
          </>
        )}
      </h2>
      <p
        className={cn(
          "mx-auto mt-3 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400",
          mobile ? "text-[14px] leading-relaxed" : "text-base lg:text-[17px]",
        )}
      >
        {subtitle}
      </p>
    </header>
  );
}

function MobileStepFlow({ steps }: { steps: [string, string, string] }) {
  return (
    <ol className="grid grid-cols-3 gap-2.5">
      {steps.map((step, index) => (
        <li
          key={step}
          className="flex flex-col items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-2 py-3 text-center dark:border-white/8 dark:bg-white/[0.04]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[12px] font-bold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
            {index + 1}
          </span>
          <span className="text-[11px] font-semibold leading-snug text-slate-700 dark:text-slate-200">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

function MobileCompactFeature({
  feature,
  index,
  visible,
}: {
  feature: MobileFeature;
  index: number;
  visible: boolean;
}) {
  const Icon =
    MOBILE_FEATURE_ICONS[feature.id as keyof typeof MOBILE_FEATURE_ICONS] ??
    FiActivity;

  return (
    <li
      className={cn(
        "live-feature-card flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/90 px-3.5 py-3",
        "dark:border-white/10 dark:bg-white/[0.05]",
        visible && "live-feature-card--visible",
      )}
      style={{ transitionDelay: `${index * 70 + 120}ms` }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
        <Icon size={17} strokeWidth={2} />
      </span>
      <p className="min-w-0 flex-1 text-start text-[13px] font-semibold leading-snug text-slate-800 dark:text-white">
        {feature.title}
      </p>
    </li>
  );
}

function FeatureCard({
  feature,
  visible,
  index,
  variant,
}: {
  feature: LiveFeature;
  visible: boolean;
  index: number;
  variant: "mobile" | "desktop";
}) {
  const Icon = FEATURE_ICONS[feature.id as keyof typeof FEATURE_ICONS] ?? FiActivity;
  const isMobile = variant === "mobile";

  return (
    <div
      className={cn(
        "live-feature-card flex gap-3.5 rounded-2xl border backdrop-blur-sm",
        "border-slate-200/70 bg-white/90 shadow-[0_6px_24px_-14px_rgba(15,23,42,0.14)]",
        "dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_6px_28px_-14px_rgba(0,0,0,0.45)]",
        isMobile ? "live-feature-card--slide p-4" : "w-auto shrink-0 gap-3.5 p-3.5",
        visible && "live-feature-card--visible",
      )}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
          isMobile ? "h-11 w-11" : "h-9 w-9",
        )}
      >
        <Icon size={isMobile ? 20 : 17} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1 text-start">
        <p
          className={cn(
            "font-semibold text-slate-800 dark:text-white",
            isMobile ? "text-[15px]" : "text-[14px]",
          )}
        >
          {feature.title}
        </p>
        <p
          className={cn(
            "mt-1 leading-relaxed text-slate-500 dark:text-slate-400",
            isMobile ? "text-[13px]" : "text-[12px]",
          )}
        >
          {feature.description}
        </p>
      </div>
    </div>
  );
}

function OrderStatusBadge({
  status,
  labels,
  compact,
}: {
  status: OrderStatus;
  labels: OrderStatusLabels;
  compact?: boolean;
}) {
  const label =
    status === "new"
      ? labels.new
      : status === "progress"
        ? labels.progress
        : labels.done;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        ORDER_STATUS_TONE[status],
        compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[10px]",
      )}
    >
      {label}
    </span>
  );
}

function StatusLegend({ labels }: { labels: OrderStatusLabels }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <OrderStatusBadge status="new" labels={labels} compact />
      <OrderStatusBadge status="progress" labels={labels} compact />
      <OrderStatusBadge status="done" labels={labels} compact />
    </div>
  );
}

function OpsHighlightsPanel({
  title,
  highlights,
  statusLabels,
  compact,
}: {
  title: string;
  highlights: LiveOpsHighlight[];
  statusLabels: OrderStatusLabels;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/60 bg-slate-50/80 dark:border-white/8 dark:bg-white/[0.03]",
        compact ? "p-3" : "p-4",
      )}
    >
      <p
        className={cn(
          "text-start font-semibold text-slate-700 dark:text-slate-200",
          compact ? "mb-2.5 text-[11px]" : "mb-3 text-[14px]",
        )}
      >
        {title}
      </p>
      <ul className={cn(compact ? "space-y-2" : "space-y-2.5")}>
        {highlights.map((item) => {
          const Icon = OPS_ICONS[item.id as keyof typeof OPS_ICONS] ?? FiActivity;

          return (
            <li
              key={item.id}
              className={cn(
                "flex gap-2 text-start",
                compact
                  ? "rounded-lg border border-slate-200/50 bg-white px-2.5 py-2 dark:border-white/6 dark:bg-white/[0.02]"
                  : "rounded-xl border border-slate-200/60 bg-white px-3.5 py-3 dark:border-white/8 dark:bg-white/[0.04]",
              )}
            >
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
                  compact ? "h-6 w-6" : "h-8 w-8",
                )}
              >
                <Icon size={compact ? 12 : 14} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-semibold text-slate-800 dark:text-white",
                    compact ? "text-[10px]" : "text-[13px]",
                  )}
                >
                  {item.title}
                </p>
                {!compact ? (
                  <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                ) : null}
                {item.showStatusLegend ? (
                  <StatusLegend labels={statusLabels} />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FloatingAlert({
  alert,
  className,
  delay,
  mobile,
}: {
  alert: LiveAlert;
  className?: string;
  delay: string;
  mobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "live-floating-alert rounded-2xl border backdrop-blur-md",
        ALERT_TONE[alert.tone],
        mobile ? "px-4 py-3.5" : "pointer-events-none px-3 py-2.5",
        className,
      )}
      style={{ animationDelay: delay }}
    >
      <p
        className={cn(
          "font-semibold text-slate-800 dark:text-white",
          mobile ? "text-[14px]" : "text-[11px]",
        )}
      >
        {alert.title}
      </p>
      <p
        className={cn(
          "mt-1 text-slate-500 dark:text-slate-300",
          mobile ? "text-[13px] leading-snug" : "mt-0.5 text-[10px]",
        )}
      >
        {alert.subtitle}
      </p>
    </div>
  );
}

function MobileSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white/95 p-4",
        "shadow-[0_8px_32px_-16px_rgba(15,23,42,0.14)]",
        "dark:border-white/10 dark:bg-[#12151f]/95 dark:shadow-[0_12px_40px_-18px_rgba(124,58,237,0.2)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MobileOrderMockup({
  labels,
  order,
  statusLabels,
  liveLabel,
  visible,
}: {
  labels: MockOrderLabels;
  order: LiveOrder;
  statusLabels: OrderStatusLabels;
  liveLabel: string;
  visible: boolean;
}) {
  return (
    <MobileSurface className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 bg-slate-50/60 px-3.5 py-2.5 dark:border-white/8 dark:bg-white/[0.03]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <FiSmartphone size={15} strokeWidth={2} />
          </span>
          <p className="truncate text-start text-[13px] font-semibold text-slate-800 dark:text-white">
            {labels.badge}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="live-restaurant-live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {liveLabel}
        </span>
      </div>

      <div
        className={cn(
          "space-y-3 px-3.5 py-3.5 text-start",
          visible && "live-order-row--visible",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {labels.tableLabel}
          </p>
          <p className="text-[13px] font-bold text-purple-600 dark:text-purple-400">
            {labels.tableNumber}
          </p>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {labels.itemsLabel}
          </p>
          <p className="text-[13px] leading-snug text-slate-700 dark:text-slate-200">
            {order.items}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 pt-3 dark:border-white/8">
          <p className="text-[11px] text-slate-400">{order.time}</p>
          <OrderStatusBadge status={order.status} labels={statusLabels} />
        </div>
      </div>
    </MobileSurface>
  );
}

function MobileShowcase({
  visible,
  ...props
}: ShowcaseSlice & { visible: boolean }) {
  const {
    mobileSteps,
    mobileFeatures,
    mockOrderLabels,
    statusLabels,
    orders,
    liveLabel,
  } = props;

  const primaryOrder = orders[0];

  return (
    <div className="live-restaurant-mobile flex flex-col gap-7 pb-2">
      <MobileStepFlow steps={mobileSteps} />

      {primaryOrder ? (
        <MobileOrderMockup
          labels={mockOrderLabels}
          order={primaryOrder}
          statusLabels={statusLabels}
          liveLabel={liveLabel}
          visible={visible}
        />
      ) : null}

      <ul className="grid gap-2.5">
        {mobileFeatures.map((feature, index) => (
          <MobileCompactFeature
            key={feature.id}
            feature={feature}
            index={index}
            visible={visible}
          />
        ))}
      </ul>
    </div>
  );
}

function DesktopShowcase({
  visible,
  ...props
}: ShowcaseSlice & { visible: boolean }) {
  const {
    features,
    restaurantName,
    liveLabel,
    popularTitle,
    opsTitle,
    liveOrdersTitle,
    opsHighlights,
    statusLabels,
    products,
    orders,
    alerts,
  } = props;

  return (
    <div className="flex items-start gap-7 xl:gap-9">
      <div className="flex w-[17rem] shrink-0 flex-col gap-3 xl:w-[19rem]">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            visible={visible}
            index={index}
            variant="desktop"
          />
        ))}
      </div>

      <div className="live-dashboard-shell relative min-w-0 flex-1">
        <div
          aria-hidden
          className="live-dashboard-glow pointer-events-none absolute -inset-4 rounded-[1.75rem] opacity-60 dark:opacity-100"
        />

        <FloatingAlert
          alert={alerts[0]}
          delay="0.2s"
          className="absolute -bottom-3 z-20 max-w-[11.5rem] lg:-start-4 lg:bottom-6"
        />
        <FloatingAlert
          alert={alerts[1]}
          delay="0.6s"
          className="absolute -bottom-2 end-0 z-20 max-w-[11.5rem] lg:-end-6 lg:bottom-10"
        />
        <FloatingAlert
          alert={alerts[2]}
          delay="1s"
          className="absolute top-[38%] z-20 max-w-[12rem] lg:-end-8"
        />

        <div
          className={cn(
            "live-dashboard relative overflow-hidden rounded-[1.35rem] border",
            "border-slate-200/70 bg-white/95 shadow-[0_8px_40px_-20px_rgba(15,23,42,0.12)]",
            "dark:border-white/10 dark:bg-[#0f1219]/95 dark:shadow-[0_12px_48px_-20px_rgba(124,58,237,0.18)]",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-3 dark:border-white/8">
            <p className="min-w-0 truncate text-start text-sm font-semibold text-slate-800 dark:text-white">
              {restaurantName}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="live-restaurant-live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {liveLabel}
              </span>
              <span className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <FiBell size={14} />
                <span className="absolute -top-0.5 -end-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
                  3
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4">
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-3 dark:border-white/8 dark:bg-white/[0.03]">
              <p className="mb-2.5 text-start text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                {liveOrdersTitle}
              </p>
              <ul className="space-y-2">
                {orders.map((order, i) => (
                  <li
                    key={order.id}
                    className={cn(
                      "live-order-row rounded-lg border border-slate-200/50 bg-white px-2.5 py-2 text-start dark:border-white/6 dark:bg-white/[0.02]",
                      visible && "live-order-row--visible",
                    )}
                    style={{ transitionDelay: `${i * 120 + 200}ms` }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        {order.id}
                      </p>
                      <OrderStatusBadge
                        status={order.status}
                        labels={statusLabels}
                        compact
                      />
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                      {order.items}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-400">{order.time}</p>
                  </li>
                ))}
              </ul>
            </div>

            <OpsHighlightsPanel
              title={opsTitle}
              highlights={opsHighlights}
              statusLabels={statusLabels}
              compact
            />

            <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-3 dark:border-white/8 dark:bg-white/[0.03]">
              <p className="mb-2.5 text-start text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                {popularTitle}
              </p>
              <ul className="space-y-2">
                {products.map((product) => (
                  <li
                    key={product.name}
                    className="flex items-center gap-2.5 text-start"
                  >
                    <HeroProductThumb src={product.image} alt={product.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-slate-800 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {product.orders}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveRestaurantShowcase(props: LiveRestaurantShowcaseProps) {
  const {
    badge,
    title,
    titleAccent,
    subtitle,
    mobileTitle,
    mobileSubtitle,
    trustTagline,
    ...slice
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", visible && "live-restaurant-visible")}>
      <div className="lg:hidden">
        <SectionHeader
          badge={badge}
          title={mobileTitle}
          subtitle={mobileSubtitle}
          mobile
        />
        <MobileShowcase visible={visible} {...slice} />
      </div>

      <div className="hidden lg:block">
        <SectionHeader
          badge={badge}
          title={title}
          titleAccent={titleAccent}
          subtitle={subtitle}
        />
        <DesktopShowcase visible={visible} {...slice} />
      </div>

      <p className="live-social-proof mx-auto mt-7 max-w-xl px-1 text-center text-[12px] font-medium leading-relaxed text-slate-500 lg:mt-10 lg:text-[13px] dark:text-slate-400">
        {trustTagline}
      </p>
    </div>
  );
}
