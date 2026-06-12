"use client";

import { useEffect, useMemo, useState } from "react";
import { MenuStaff } from "@/types/Menu";
import StaffCard from "./StaffCard";
import StaffEmptyState from "./StaffEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";

const PAGE_SIZE = 12;

function StaffCardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="dashboard-mobile-shimmer size-12 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-700/60" />
        <div className="flex flex-1 flex-col gap-2 py-0.5">
          <div className="dashboard-mobile-shimmer h-5 w-3/4 rounded-md bg-slate-100 dark:bg-slate-700/60" />
          <div className="dashboard-mobile-shimmer h-4 w-1/2 rounded-full bg-slate-100 dark:bg-slate-700/60" />
        </div>
      </div>
      <div className="dashboard-mobile-shimmer mb-4 h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-700/60" />
      <div className="dashboard-mobile-shimmer mb-2 h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-700/60" />
      <div className="grid grid-cols-2 gap-1.5">
        <div className="dashboard-mobile-shimmer h-9 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
        <div className="dashboard-mobile-shimmer h-9 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
      </div>
    </div>
  );
}

interface StaffCardGridProps {
  staffList: MenuStaff[];
  loading: boolean;
  locale: string;
  togglingId: number | null;
  onEdit: (staff: MenuStaff) => void;
  onToggleActive: (staff: MenuStaff) => void;
  onDelete: (staff: MenuStaff) => void;
  onAdd: () => void;
}

export default function StaffCardGrid({
  staffList,
  loading,
  locale,
  togglingId,
  onEdit,
  onToggleActive,
  onDelete,
  onAdd,
}: StaffCardGridProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [staffList.length]);

  const totalPages = Math.max(1, Math.ceil(staffList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageStaff = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return staffList.slice(start, start + PAGE_SIZE);
  }, [staffList, safePage]);

  if (loading) {
    return (
      <div className="dashboard-staff-grid grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StaffCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (staffList.length === 0) {
    return <StaffEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="dashboard-staff-grid-wrap min-w-0">
      <div className="dashboard-staff-grid grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
        {pageStaff.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            locale={locale}
            togglingId={togglingId}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <MobileListPagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          locale={locale}
        />
      )}
    </div>
  );
}
