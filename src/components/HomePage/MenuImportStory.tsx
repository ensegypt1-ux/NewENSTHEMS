"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FiBell,
  FiCheck,
  FiClock,
  FiDownload,
  FiImage,
  FiUpload,
  FiZap,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import HeroProductThumb from "@/components/HomePage/HeroProductThumb";
import type { MenuImportItem } from "@/components/HomePage/menuImportTypes";
import { cn } from "@/lib/cn";

export type MenuImportStep = {
  title: string;
  caption: string;
};

export type MenuImportHighlight = {
  text: string;
  icon: "clock" | "ai" | "photos" | "rocket";
};

type MenuImportStoryProps = {
  steps: MenuImportStep[];
  items: MenuImportItem[];
  uploadProgressLabel: string;
  uploadCompleteLabel: string;
  processingLabel: string;
  processingCompleteLabel: string;
  extractProgressLabel: string;
  extractCompleteLabel: string;
  qrDownloadLabel: string;
  liveBadgeLabel: string;
  newOrderLabel: string;
  scanToOrderLabel: string;
  notificationLabel?: string;
  highlights?: MenuImportHighlight[];
  showHighlights?: boolean;
};

const HIGHLIGHT_ICONS = {
  clock: FiClock,
  ai: HiOutlineSparkles,
  photos: FiImage,
  rocket: FiZap,
} as const;

const MenuImportActiveStepContext = createContext(1);

function useMenuImportActiveStep() {
  return useContext(MenuImportActiveStepContext);
}

/** Prevent scroll jumps when step/progress layout updates (scroll anchoring). */
function usePreserveScrollPosition(...deps: unknown[]) {
  const scrollYRef = useRef(0);

  useLayoutEffect(() => {
    scrollYRef.current = window.scrollY;

    const restore = () => {
      const y = scrollYRef.current;
      if (Math.abs(window.scrollY - y) > 1) {
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      }
    };

    restore();
    const raf1 = requestAnimationFrame(restore);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(restore));

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit scroll-lock triggers
  }, deps);
}

function QrSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={cn("text-slate-900", className)}
      aria-hidden
    >
      <rect width="80" height="80" fill="white" />
      <rect x="6" y="6" width="22" height="22" fill="currentColor" />
      <rect x="52" y="6" width="22" height="22" fill="currentColor" />
      <rect x="6" y="52" width="22" height="22" fill="currentColor" />
      <rect x="34" y="34" width="6" height="6" fill="currentColor" />
      <rect x="46" y="34" width="6" height="6" fill="currentColor" />
      <rect x="58" y="46" width="10" height="10" fill="currentColor" />
      <rect x="10" y="10" width="14" height="14" fill="white" />
      <rect x="56" y="10" width="14" height="14" fill="white" />
      <rect x="10" y="56" width="14" height="14" fill="white" />
    </svg>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

const SYNCED_PROGRESS_TARGET = 100;
const SYNCED_PROGRESS_DURATION_MS = 2600;
const MENU_IMPORT_STEP_INTERVAL_MS = 3000;

function useSyncedPercent(current: boolean, passed: boolean) {
  const [value, setValue] = useState(passed ? SYNCED_PROGRESS_TARGET : 0);
  const [display, setDisplay] = useState(passed ? SYNCED_PROGRESS_TARGET : 0);
  const [done, setDone] = useState(passed);

  useEffect(() => {
    if (passed) {
      setValue(SYNCED_PROGRESS_TARGET);
      setDisplay(SYNCED_PROGRESS_TARGET);
      setDone(true);
      return;
    }

    if (!current) {
      if (!passed) {
        setValue(0);
        setDisplay(0);
        setDone(false);
      }
      return;
    }

    setDone(false);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setValue(SYNCED_PROGRESS_TARGET);
      setDisplay(SYNCED_PROGRESS_TARGET);
      setDone(true);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SYNCED_PROGRESS_DURATION_MS);
      const next = easeInOutCubic(t) * SYNCED_PROGRESS_TARGET;
      setValue(next);
      setDisplay((prev) => {
        const blended = prev + (next - prev) * 0.28;
        return Math.min(SYNCED_PROGRESS_TARGET, blended);
      });
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(SYNCED_PROGRESS_TARGET);
        setDisplay(SYNCED_PROGRESS_TARGET);
        setDone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current, passed]);

  return {
    value,
    display: Math.min(SYNCED_PROGRESS_TARGET, Math.round(display)),
    complete: passed || done,
  };
}

function useSmoothTarget(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setValue(target);
      return;
    }

    let raf = 0;

    const tick = () => {
      setValue((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.25) return target;
        return prev + diff * 0.14;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

function LoadingDots() {
  return (
    <span className="menu-import-loading-dots ms-1 inline-flex items-center gap-0.5" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

function AnimatedStatusLabel({
  label,
  complete,
  active,
  centered,
}: {
  label: string;
  complete: boolean;
  active: boolean;
  centered?: boolean;
}) {
  return (
    <p
      className={cn(
        "menu-import-status-label font-medium transition-colors duration-500",
        centered
          ? "mt-2 w-full text-center text-[10px] leading-snug sm:text-[11px]"
          : "mt-1.5 truncate text-[10px] sm:text-[11px]",
        complete
          ? "menu-import-status-label--complete font-semibold text-emerald-600 dark:text-emerald-400"
          : "text-purple-600 dark:text-purple-400",
        active || complete ? "opacity-100" : "opacity-45",
      )}
    >
      {label}
      {active && !complete ? <LoadingDots /> : null}
    </p>
  );
}

function SyncedProgressBlock({
  current,
  passed,
  label,
  completeLabel,
  align = "row",
  shimmer = false,
  glow = false,
  leadingIcon,
}: {
  current: boolean;
  passed: boolean;
  label: string;
  completeLabel: string;
  align?: "row" | "center" | "stack";
  shimmer?: boolean;
  glow?: boolean;
  leadingIcon?: ReactNode;
}) {
  const { value, display, complete } = useSyncedPercent(current, passed);
  const statusLabel = complete ? completeLabel : label;
  const processing = current && !complete;

  const track = (
    <SyncedProgressTrack
      value={value}
      shimmer={shimmer && processing}
      glow={glow && processing}
      active={processing}
      className={complete ? "opacity-100" : undefined}
    />
  );

  const percentOrCheck = complete ? (
    <span className="menu-import-check-reveal flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
      <FiCheck size={11} strokeWidth={3} aria-hidden />
    </span>
  ) : (
    <span className="shrink-0 text-[11px] font-bold tabular-nums text-purple-600 dark:text-purple-400">
      {display}%
    </span>
  );

  if (align === "center" || align === "stack") {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        {align === "stack" && leadingIcon ? (
          <span
            className={cn(
              processing && "menu-import-icon-active",
              complete && "menu-import-icon-complete",
            )}
          >
            {leadingIcon}
          </span>
        ) : null}
        <div className="w-full">{track}</div>
        <AnimatedStatusLabel
          label={statusLabel}
          complete={complete}
          active={processing}
          centered
        />
        <div className="flex justify-center">{percentOrCheck}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          processing && "menu-import-icon-active",
          complete && "menu-import-icon-complete",
        )}
      >
        {leadingIcon}
      </span>
      <div className="min-w-0 flex-1">
        {track}
        <AnimatedStatusLabel
          label={statusLabel}
          complete={complete}
          active={processing}
        />
      </div>
      {percentOrCheck}
    </div>
  );
}

function SyncedProgressTrack({
  value,
  shimmer = false,
  glow = false,
  active = false,
  className,
}: {
  value: number;
  shimmer?: boolean;
  glow?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        active && "menu-import-progress-track--active",
        className,
      )}
    >
      {glow && value > 0 && (
        <span
          aria-hidden
          className="menu-import-progress-glow pointer-events-none absolute inset-0 rounded-full"
        />
      )}
      <div
        className={cn(
          "menu-import-progress-fill relative h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-400 rtl:bg-gradient-to-l",
          shimmer && value > 0 && "menu-import-progress-shimmer",
        )}
        style={{ width: `${value}%` }}
      >
        {shimmer && value > 0 && (
          <span
            aria-hidden
            className="menu-import-progress-sheen pointer-events-none absolute inset-0 rounded-full"
          />
        )}
      </div>
    </div>
  );
}

function StepConnector({
  active,
  flowing,
  variant = "line",
}: {
  active: boolean;
  flowing?: boolean;
  variant?: "line" | "arrow";
}) {
  if (variant === "arrow") {
    return (
      <div
        className="menu-import-step-connector flex w-6 shrink-0 items-center justify-center self-center sm:w-7"
        aria-hidden
      >
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-500 rtl:rotate-180",
            active ? "text-purple-500" : "text-slate-300 dark:text-slate-600",
            flowing && "menu-import-connector-arrow-pulse",
          )}
        >
          →
        </span>
      </div>
    );
  }

  return (
    <div
      className="menu-import-step-connector hidden w-4 shrink-0 self-start pt-[1.15rem] xl:w-6 lg:block"
      aria-hidden
    >
      <div className="relative h-px w-full overflow-visible rounded-full bg-slate-200/60 dark:bg-slate-700/70">
        {active && (
          <span className="menu-import-connector-glow pointer-events-none absolute -inset-y-2 inset-x-0 rounded-full" />
        )}
        <div
          className={cn(
            "absolute inset-y-0 start-0 h-px rounded-full bg-gradient-to-r from-purple-400/75 to-violet-500/85 transition-all duration-[850ms] ease-[cubic-bezier(0.4,0,0.2,1)] rtl:bg-gradient-to-l",
            active ? "w-full opacity-100" : "w-0 opacity-0",
          )}
        />
        {flowing && (
          <>
            <span className="menu-import-connector-dot absolute start-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
            <span className="menu-import-connector-trail absolute start-0 top-1/2 h-px w-4 -translate-y-1/2 bg-gradient-to-r from-purple-400/0 via-purple-400/50 to-purple-400/0 rtl:bg-gradient-to-l" />
          </>
        )}
      </div>
    </div>
  );
}

function StepUploadVisual({
  items,
  label,
  completeLabel,
}: {
  items: MenuImportItem[];
  label: string;
  completeLabel: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const stepIndex = 0;
  const current = activeStep === stepIndex + 1;
  const passed = activeStep > stepIndex + 1;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700/50 dark:bg-slate-800/40">
        <p className="mb-2 text-center text-[11px] font-bold tracking-widest text-slate-400">
          MENU
        </p>
        <ul className="space-y-1.5">
          {items.slice(0, 3).map((item) => (
            <li
              key={item.name}
              className="flex items-baseline justify-between gap-2 text-[10px] text-slate-600 dark:text-slate-300 sm:text-[11px]"
            >
              <span className="truncate font-medium">{item.name}</span>
              <span className="shrink-0 tabular-nums text-slate-400">
                {item.price}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <SyncedProgressBlock
        current={current}
        passed={passed}
        label={label}
        completeLabel={completeLabel}
        align="stack"
        leadingIcon={
          <span className="menu-import-step-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <FiUpload size={14} strokeWidth={2.5} />
          </span>
        }
      />
    </div>
  );
}

function StepAiVisual({
  label,
  completeLabel,
}: {
  label: string;
  completeLabel: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const stepIndex = 1;
  const current = activeStep === stepIndex + 1;
  const passed = activeStep > stepIndex + 1;
  const active = activeStep >= stepIndex + 1;

  return (
    <div className="flex w-full flex-col items-center gap-3.5">
      <div className="menu-import-ai-stage relative mx-auto flex h-[4.75rem] w-[4.75rem] items-center justify-center">
        {active && (
          <>
            <span
              aria-hidden
              className="menu-import-ai-ring pointer-events-none absolute inset-0 rounded-2xl border border-purple-300/35"
            />
            <span
              aria-hidden
              className="menu-import-ai-orbit pointer-events-none absolute inset-[-4px] rounded-[1.15rem] border border-purple-300/20"
            />
          </>
        )}
        <HiOutlineSparkles
          className={cn(
            "pointer-events-none absolute -start-3 -top-1 text-purple-400/70",
            active && "menu-import-sparkle",
          )}
          size={15}
        />
        <HiOutlineSparkles
          className={cn(
            "pointer-events-none absolute -end-3 top-0 text-violet-300/80",
            active && "menu-import-sparkle menu-import-sparkle--delay",
          )}
          size={12}
        />
        <HiOutlineSparkles
          className={cn(
            "pointer-events-none absolute -bottom-1 start-1/2 -translate-x-1/2 text-purple-300/60",
            active && "menu-import-sparkle menu-import-sparkle--delay-2",
          )}
          size={11}
        />
        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-purple-200/90 bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 dark:border-purple-500/30 dark:from-purple-500/15 dark:to-violet-500/10 dark:text-purple-300",
            active && "menu-import-step-glow",
            current && "menu-import-ai-core--active",
          )}
        >
          {active && (
            <>
              <span
                aria-hidden
                className="menu-import-ai-grid pointer-events-none absolute inset-0 opacity-[0.35]"
              />
              <span
                aria-hidden
                className="menu-import-ai-laser pointer-events-none absolute inset-x-1 h-[2px] rounded-full bg-purple-400/70"
              />
              <span
                aria-hidden
                className="menu-import-ai-scan pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-400/12 via-transparent to-violet-500/10"
              />
            </>
          )}
          <span className="relative text-xs font-bold tracking-wide">AI</span>
        </div>
      </div>
      <SyncedProgressBlock
        current={current}
        passed={passed}
        label={label}
        completeLabel={completeLabel}
        align="center"
        shimmer
        glow
      />
    </div>
  );
}

function StepPhotosVisual({
  items,
  label,
  completeLabel,
}: {
  items: MenuImportItem[];
  label: string;
  completeLabel: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const stepIndex = 2;
  const current = activeStep === stepIndex + 1;
  const passed = activeStep > stepIndex + 1;
  const active = activeStep >= stepIndex + 1;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ul className="w-full space-y-2.5">
        {items.map((item, i) => (
          <li
            key={item.name}
            className={cn(
              "flex items-center gap-2.5 transition-all duration-500",
              active && "menu-import-photo-row",
            )}
            style={active ? { animationDelay: `${i * 120}ms` } : undefined}
          >
            <HeroProductThumb src={item.image} alt={item.name} />
            <div className="min-w-0 flex-1 text-start">
              <p className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-100 sm:text-xs">
                {item.name}
              </p>
              <p className="text-[10px] font-semibold tabular-nums text-slate-500 sm:text-[11px]">
                {item.price}
              </p>
            </div>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 transition-transform duration-300 dark:bg-emerald-500/10",
                active && "menu-import-check-pop",
              )}
              style={active ? { animationDelay: `${i * 120 + 80}ms` } : undefined}
            >
              <FiCheck size={12} strokeWidth={3} />
            </span>
          </li>
        ))}
      </ul>
      <SyncedProgressBlock
        current={current}
        passed={passed}
        label={label}
        completeLabel={completeLabel}
        align="stack"
        leadingIcon={
          <span className="menu-import-step-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <FiImage size={14} strokeWidth={2.5} />
          </span>
        }
      />
    </div>
  );
}

function StepQrVisual({ downloadLabel }: { downloadLabel: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative p-1">
        <span className="absolute start-0 top-0 h-4 w-4 rounded-ss-md border-s-2 border-t-2 border-purple-500" />
        <span className="absolute end-0 top-0 h-4 w-4 rounded-se-md border-e-2 border-t-2 border-purple-500" />
        <span className="absolute bottom-0 start-0 h-4 w-4 rounded-es-md border-b-2 border-s-2 border-purple-500" />
        <span className="absolute bottom-0 end-0 h-4 w-4 rounded-ee-md border-b-2 border-e-2 border-purple-500" />
        <QrSvg className="h-[5.25rem] w-[5.25rem] sm:h-[5.75rem] sm:w-[5.75rem]" />
      </div>
      <button
        type="button"
        className="menu-import-qr-btn inline-flex items-center gap-1.5 rounded-lg border border-purple-500/80 bg-white px-3 py-1.5 text-[10px] font-semibold text-purple-600 transition-all dark:border-purple-400/60 dark:bg-transparent dark:text-purple-400 sm:text-[11px]"
      >
        <FiDownload size={13} strokeWidth={2.5} />
        {downloadLabel}
      </button>
    </div>
  );
}

function StepScanVisual({ scanToOrderLabel }: { scanToOrderLabel: string }) {
  const activeStep = useMenuImportActiveStep();
  const active = activeStep >= 5;

  return (
    <div className="relative mx-auto w-full max-w-[180px]">
      <div
        className={cn(
          "menu-import-table-scene relative overflow-hidden rounded-xl p-3",
          "bg-gradient-to-b from-amber-100/90 via-amber-50/55 to-amber-200/30",
          "dark:from-amber-950/35 dark:via-amber-900/15 dark:to-amber-950/25",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="menu-import-scan-beam pointer-events-none absolute bottom-[2.5rem] start-[42%] z-10 h-px w-[30%] origin-start rotate-[-16deg] bg-gradient-to-r from-purple-400/0 via-purple-400/50 to-purple-400/0 rtl:origin-end rtl:rotate-[16deg]"
          />
        )}
        <div className="flex items-end justify-center gap-2">
          <div
            className="flex flex-col items-center"
            style={{ perspective: "320px" }}
          >
            <div
              className={cn(
                "w-[5.5rem] origin-bottom sm:w-[6rem]",
                active && "menu-import-stand-float",
              )}
              style={{ transform: "rotateX(8deg)" }}
            >
              <div className="relative rounded-t-lg border border-white/90 bg-gradient-to-b from-white to-slate-50 px-2 pb-3 pt-2 text-center shadow-[0_10px_28px_-12px_rgba(15,23,42,0.2)]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-2 top-0 h-3 rounded-b-sm bg-white/60"
                />
                <p className="relative text-[7px] font-bold tracking-[0.15em] text-purple-600">
                  ENSMENU
                </p>
                <QrSvg className="relative mx-auto mt-1 h-11 w-11 sm:h-12 sm:w-12" />
                <p className="relative mt-0.5 text-[6.5px] font-medium text-slate-400">
                  {scanToOrderLabel}
                </p>
              </div>
              <div className="h-3 w-full bg-gradient-to-b from-slate-200/90 to-slate-400/80 dark:from-slate-600 dark:to-slate-800" />
            </div>
          </div>

          <div
            className={cn(
              "relative mb-1 w-[3.6rem] shrink-0 overflow-hidden rounded-[0.85rem] border border-slate-200/80 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900",
              active && "menu-import-phone-glow",
            )}
          >
            <div className="bg-purple-50/85 px-1.5 py-1 dark:bg-purple-500/10">
              <p className="text-[6px] font-semibold text-purple-600 dark:text-purple-400">
                {scanToOrderLabel}
              </p>
            </div>
            <div className="relative space-y-1 p-1.5">
              {active && (
                <span
                  aria-hidden
                  className="menu-import-scan-line pointer-events-none absolute inset-x-1 top-1 h-3 rounded-sm bg-purple-400/25"
                />
              )}
              <div className="h-4 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-2.5 w-[80%] rounded bg-slate-100/80 dark:bg-slate-800/80" />
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="menu-import-wood-surface mx-auto mt-2.5 h-2 w-[90%] rounded-full"
        />
      </div>
    </div>
  );
}

function StepLiveVisual({
  liveBadgeLabel,
  newOrderLabel,
  notificationLabel,
}: {
  liveBadgeLabel: string;
  newOrderLabel: string;
  notificationLabel: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const live = activeStep >= 6;

  return (
    <div className="relative mx-auto w-full max-w-[190px]">
      {live && (
        <span className="menu-import-live-badge absolute -top-1 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200/80 bg-emerald-50/95 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="menu-import-live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {liveBadgeLabel}
        </span>
      )}
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-purple-100/80 bg-purple-50/30 p-3 dark:border-purple-500/20 dark:bg-purple-500/5",
          live && "menu-import-finale-ambient",
        )}
      >
        <div className="relative">
          <FiBell
            className={cn(
              "text-purple-600 transition-transform duration-500 dark:text-purple-400",
              live && "menu-import-bell-ring",
            )}
            size={26}
            strokeWidth={1.75}
          />
          {live && (
            <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
              1
            </span>
          )}
        </div>
        <p className="text-center text-[10px] font-medium leading-snug text-purple-700 dark:text-purple-300">
          {notificationLabel}
        </p>
        {live && (
          <div className="menu-import-order-toast w-full rounded-lg border border-white/80 bg-white/95 px-2 py-1.5 text-start shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
            <p className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400">
              {newOrderLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryStep({
  step,
  index,
  active,
  current,
  isFinale,
  layout,
  stepRef,
  children,
}: {
  step: MenuImportStep;
  index: number;
  active: boolean;
  current: boolean;
  isFinale: boolean;
  layout: "timeline" | "grid" | "focus";
  stepRef?: (node: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <article
      ref={stepRef}
      className={cn(
        "menu-import-step flex flex-col transition-[transform,opacity] duration-[680ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        layout === "timeline" &&
          "w-[var(--menu-import-step-w)] max-w-[var(--menu-import-step-w)] shrink-0 snap-center snap-always",
        layout === "focus" &&
          "mx-auto h-full w-full max-w-[18rem] items-center",
        layout === "grid" && "min-w-0",
        current && "menu-import-step--current z-[1]",
        layout === "grid" && current && "lg:scale-[1.012]",
        active && !current && "opacity-100",
        !active && "opacity-[0.72]",
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="mb-3.5 flex w-full flex-col items-center gap-2 text-center sm:mb-4">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-500",
            active
              ? "bg-purple-600 text-white shadow-[0_4px_14px_-4px_rgba(124,58,237,0.45)]"
              : "border border-slate-200/90 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900",
            current && "menu-import-step-badge--current",
          )}
        >
          {index + 1}
        </span>
        <h3
          className={cn(
            "w-full text-center text-[12px] font-semibold leading-snug sm:text-[13px]",
            active
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400",
            isFinale && active && "text-purple-700 dark:text-purple-300",
          )}
        >
          {step.title}
        </h3>
      </div>

      <div
        className={cn(
          "menu-import-step-card flex w-full min-h-[172px] flex-1 flex-col items-center justify-center rounded-2xl border bg-white p-3 sm:min-h-[186px] sm:p-3.5",
          isFinale
            ? "border-purple-200/70 shadow-[0_10px_36px_-14px_rgba(124,58,237,0.28)] dark:border-purple-500/30"
            : "border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.06)] dark:border-slate-700/45 dark:bg-slate-900/30",
          isFinale && active && "menu-import-step-card--finale",
          current && !isFinale && "menu-import-step-card--current border-purple-100/85",
          current && "menu-import-step-card--pulse",
        )}
      >
        {children}
      </div>

      <p
        className={cn(
          "mx-auto mt-3 w-full max-w-[16.5rem] text-center text-[10px] leading-relaxed sm:text-[11px]",
          isFinale && active
            ? "font-medium text-slate-600 dark:text-slate-300"
            : "text-slate-500 dark:text-slate-400",
        )}
      >
        {step.caption}
      </p>
    </article>
  );
}

export default function MenuImportStory({
  steps,
  items,
  uploadProgressLabel,
  uploadCompleteLabel,
  processingLabel,
  processingCompleteLabel,
  extractProgressLabel,
  extractCompleteLabel,
  qrDownloadLabel,
  liveBadgeLabel,
  newOrderLabel,
  scanToOrderLabel,
  notificationLabel = "",
  highlights = [],
  showHighlights = false,
}: MenuImportStoryProps) {
  const stepCount = steps.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const globalProgressTarget = (activeStep / stepCount) * 100;
  const globalProgressWidth = useSmoothTarget(globalProgressTarget);
  const isProcessingStep = activeStep >= 1 && activeStep <= 3;

  usePreserveScrollPosition(activeStep, visible);

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
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let step = 1;
    setActiveStep(1);

    const interval = window.setInterval(() => {
      step += 1;
      if (step > stepCount) {
        window.clearInterval(interval);
        setActiveStep(stepCount);
        return;
      }
      setActiveStep(step);
    }, MENU_IMPORT_STEP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [visible, stepCount]);

  const stepVisuals = useMemo(
    () =>
      [
        <StepUploadVisual
          key="upload"
          items={items}
          label={uploadProgressLabel}
          completeLabel={uploadCompleteLabel}
        />,
        <StepAiVisual
          key="ai"
          label={processingLabel}
          completeLabel={processingCompleteLabel}
        />,
        <StepPhotosVisual
          key="photos"
          items={items}
          label={extractProgressLabel}
          completeLabel={extractCompleteLabel}
        />,
        <StepQrVisual key="qr" downloadLabel={qrDownloadLabel} />,
        <StepScanVisual key="scan" scanToOrderLabel={scanToOrderLabel} />,
        <StepLiveVisual
          key="live"
          liveBadgeLabel={liveBadgeLabel}
          newOrderLabel={newOrderLabel}
          notificationLabel={notificationLabel}
        />,
      ].slice(0, stepCount),
    [
      items,
      uploadProgressLabel,
      uploadCompleteLabel,
      processingLabel,
      processingCompleteLabel,
      extractProgressLabel,
      extractCompleteLabel,
      qrDownloadLabel,
      scanToOrderLabel,
      liveBadgeLabel,
      newOrderLabel,
      notificationLabel,
      stepCount,
    ],
  );

  const renderStep = (
    step: MenuImportStep,
    index: number,
    layout: "focus" | "grid",
  ) => (
    <StoryStep
      key={`${layout}-${step.title}`}
      step={step}
      index={index}
      active={activeStep >= index + 1}
      current={activeStep === index + 1}
      isFinale={index === stepCount - 1}
      layout={layout === "focus" ? "focus" : "grid"}
    >
      {stepVisuals[index]}
    </StoryStep>
  );

  return (
    <MenuImportActiveStepContext.Provider value={activeStep}>
    <div
      ref={rootRef}
      className={cn("w-full", visible && "menu-import-story-visible")}
    >
      <div
        className={cn(
          "menu-import-story-panel relative rounded-[1.25rem] border border-slate-200/55 bg-white px-4 py-4 sm:rounded-[1.4rem] sm:px-6 sm:py-5 lg:overflow-hidden lg:px-7 lg:py-6",
          "shadow-[0_2px_20px_-6px_rgba(15,23,42,0.06),0_16px_48px_-20px_rgba(124,58,237,0.11)]",
          "dark:border-slate-800/60 dark:bg-[#0d1117]/95",
        )}
      >
        <div
          aria-hidden
          className="menu-import-energy-wave pointer-events-none absolute inset-x-6 top-[40%] hidden h-16 lg:block"
          style={{
            opacity: 0.35 + activeStep * 0.1,
            transition: "opacity 0.8s ease",
          }}
        />

        <div
          aria-hidden
          className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100 lg:mb-4 lg:h-px dark:bg-slate-800/80"
        >
          <div
            className={cn(
              "menu-import-global-progress relative h-full rounded-full bg-gradient-to-r from-purple-400/80 via-violet-500/90 to-purple-400/80 rtl:bg-gradient-to-l lg:h-px",
              isProcessingStep && "menu-import-global-progress--active",
            )}
            style={{ width: `${globalProgressWidth}%` }}
          >
            {isProcessingStep && (
              <span
                aria-hidden
                className="menu-import-progress-sheen pointer-events-none absolute inset-0 rounded-full"
              />
            )}
          </div>
        </div>

        <div
          aria-hidden
          className="mb-2.5 flex items-center justify-center gap-1.5 lg:hidden"
        >
          {steps.map((step, index) => (
            <span
              key={step.title}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                activeStep === index + 1
                  ? "w-5 bg-purple-500"
                  : activeStep > index + 1
                    ? "w-2 bg-purple-300 dark:bg-purple-500/50"
                    : "w-2 bg-slate-200 dark:bg-slate-700",
              )}
            />
          ))}
        </div>

        <div className="menu-import-mobile-focus relative mx-auto w-full lg:hidden">
          <div className="menu-import-focus-stage relative mx-auto h-[302px] w-full max-w-[18rem] sm:h-[318px]">
            {steps.map((step, index) => {
              const isCurrent = activeStep === index + 1;

              return (
                <div
                  key={`focus-${step.title}`}
                  className={cn(
                    "menu-import-focus-step absolute inset-0 flex justify-center transition-opacity duration-500 ease-out",
                    isCurrent
                      ? "z-[1] opacity-100"
                      : "pointer-events-none z-0 opacity-0",
                  )}
                  aria-hidden={!isCurrent}
                >
                  {renderStep(step, index, "focus")}
                </div>
              );
            })}
          </div>
        </div>

        <div className="menu-import-steps-grid hidden lg:grid lg:grid-cols-6 lg:items-stretch lg:gap-2.5">
          {steps.map((step, index) => renderStep(step, index, "grid"))}
        </div>
      </div>

      {showHighlights && highlights.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3 lg:mt-5 lg:grid-cols-4">
          {highlights.map((item, i) => {
            const Icon = HIGHLIGHT_ICONS[item.icon];
            return (
              <div
                key={item.text}
                className="menu-import-highlight flex items-center gap-2.5 rounded-xl border border-slate-200/50 bg-white/90 px-3 py-2.5 text-start shadow-[0_1px_8px_-4px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200/70 hover:bg-purple-50/25 hover:shadow-[0_6px_20px_-10px_rgba(124,58,237,0.14)] dark:border-slate-800/55 dark:bg-slate-900/20 dark:hover:border-purple-500/20 dark:hover:bg-purple-500/5 sm:px-3.5 sm:py-3"
                style={{ animationDelay: `${i * 90 + 350}ms` }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50/90 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <Icon size={17} strokeWidth={2} />
                </span>
                <p className="text-[11px] font-medium leading-snug text-slate-700 dark:text-slate-300 sm:text-xs">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </MenuImportActiveStepContext.Provider>
  );
}
