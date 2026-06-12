"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Advertisement } from "@/types/Menu";
import { adRowMetrics } from "@/lib/adMetrics";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoTrashOutline,
} from "react-icons/io5";

interface AdCardProps {
  ad: Advertisement;
  locale: string;
  title: string;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
}

export default function AdCard({
  ad,
  locale,
  title,
  onEdit,
  onDelete,
}: AdCardProps) {
  const t = useTranslations("Advertisements.page");
  const metrics = adRowMetrics(ad);
  const imageSrc = ad.imageUrl ?? (ad as { image?: string }).image ?? "";
  const showStatus = ad.isActive !== undefined;
  const active = ad.isActive !== false;

  return (
    <article className="dashboard-ad-card overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_8px_rgba(15,23,42,0.06)] dark:border-slate-700/80 dark:bg-slate-800/95 dark:shadow-[0_1px_12px_rgba(0,0,0,0.25)]">
      <div className="aspect-[16/9] w-full overflow-hidden border-b border-slate-100 bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60">
        {imageSrc ? (
          <LoadImage
            src={imageSrc}
            alt={title}
            className="size-full object-cover"
            width={400}
            height={225}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-400 dark:text-slate-500">
            —
          </div>
        )}
      </div>

      <div className="p-3.5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3
            className="min-w-0 flex-1 truncate text-start text-[15px] font-bold leading-tight text-slate-900 dark:text-slate-50"
            dir={locale === "ar" ? "rtl" : "ltr"}
            title={title}
          >
            {title || "—"}
          </h3>
          {showStatus && (
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                active
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
              }`}
            >
              <IoEllipseSharp
                className={`text-[5px] ${active ? "text-emerald-500" : "text-amber-500"}`}
                aria-hidden
              />
              {active ? t("active") : t("inactive")}
            </span>
          )}
        </div>

        <div className="mb-3 grid grid-cols-3 gap-1.5">
          <div className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-2 py-2 text-center dark:border-sky-800/40 dark:bg-sky-950/25">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {t("columns.impressions")}
            </p>
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {metrics.impressionCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/80 px-2 py-2 text-center dark:border-amber-800/40 dark:bg-amber-950/25">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {t("columns.clicks")}
            </p>
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {metrics.clickCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-2 py-2 text-center dark:border-emerald-800/40 dark:bg-emerald-950/25">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {t("columns.ctr")}
            </p>
            <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {metrics.ctr}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEdit(ad)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <IoCreateOutline className="text-base" aria-hidden />
            {t("edit")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(ad)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.98] dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
          >
            <IoTrashOutline className="text-base" aria-hidden />
            {t("delete")}
          </button>
        </div>
      </div>
    </article>
  );
}
