"use client";

import { useTranslations } from "next-intl";
import { MenuStaff } from "@/types/Menu";
import {
  getStaffInitials,
  isCashierRole,
  isWaiterRole,
} from "@/lib/staffDisplay";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoMailOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoTrashOutline,
} from "react-icons/io5";

interface StaffCardProps {
  staff: MenuStaff;
  locale: string;
  togglingId: number | null;
  onEdit: (staff: MenuStaff) => void;
  onToggleActive: (staff: MenuStaff) => void;
  onDelete: (staff: MenuStaff) => void;
}

const iconBtn =
  "inline-flex size-9 items-center justify-center rounded-xl border transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

export default function StaffCard({
  staff,
  locale,
  togglingId,
  onEdit,
  onToggleActive,
  onDelete,
}: StaffCardProps) {
  const t = useTranslations("Staff");
  const active = staff.isActive;
  const isToggling = togglingId === staff.id;
  const initials = getStaffInitials(staff.name);
  const email = staff.email?.trim() || t("emptyCell");

  const roleLabel = isCashierRole(staff.role)
    ? t("roleCashier")
    : isWaiterRole(staff.role)
      ? t("roleWaiter")
      : staff.role?.trim() || t("emptyCell");

  const roleBadgeClass = isCashierRole(staff.role)
    ? "bg-violet-50 text-violet-700 dark:bg-violet-900/25 dark:text-violet-300"
    : isWaiterRole(staff.role)
      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
      : "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300";

  return (
    <article
      className={`dashboard-staff-card group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_8px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] dark:bg-slate-800/95 dark:shadow-[0_1px_12px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_4px_24px_rgba(124,58,237,0.12)] ${
        active
          ? "border-slate-200/90 dark:border-slate-700/80"
          : "border-amber-200/70 bg-slate-50/40 dark:border-amber-900/35 dark:bg-amber-950/10"
      }`}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-primary/5 text-sm font-bold text-primary ring-1 ring-primary/15 dark:from-primary/25 dark:to-primary/10 dark:ring-primary/25"
            aria-hidden
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="truncate text-start text-base font-bold leading-tight text-slate-900 sm:text-[17px] dark:text-slate-50"
              dir={locale === "ar" ? "rtl" : "ltr"}
              title={staff.name}
            >
              {staff.name}
            </h3>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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
            </div>
          </div>
        </div>

        <div className="mb-4 flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700/80 dark:bg-slate-900/40">
          <IoMailOutline
            className="shrink-0 text-base text-slate-400 dark:text-slate-500"
            aria-hidden
          />
          <span
            className="min-w-0 truncate text-start text-xs font-medium text-slate-600 dark:text-slate-300"
            dir="ltr"
            title={email}
          >
            {email}
          </span>
        </div>

        <div className="mt-auto space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => onEdit(staff)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <IoCreateOutline className="text-base" aria-hidden />
            {t("edit")}
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={isToggling}
              onClick={() => onToggleActive(staff)}
              title={active ? t("disable") : t("enable")}
              aria-label={active ? t("disable") : t("enable")}
              className={`${iconBtn} gap-1.5 px-2 text-xs font-semibold ${
                active
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300"
              }`}
            >
              {isToggling ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : active ? (
                <IoPauseOutline className="text-[17px]" />
              ) : (
                <IoPlayOutline className="text-[17px]" />
              )}
              <span className="truncate">
                {active ? t("disable") : t("enable")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(staff)}
              title={t("delete")}
              aria-label={t("delete")}
              className={`${iconBtn} gap-1.5 border-red-200/80 bg-red-50 px-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50`}
            >
              <IoTrashOutline className="text-[17px]" />
              <span className="truncate">{t("delete")}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
