"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { axiosGet } from "@/shared/axiosCall";
import DataTable from "@/components/Custom/DataTable";
import LoadImage from "@/components/ImageLoad";
import { Advertisement } from "@/types/Menu";
import { IoAddCircleOutline, IoCreateOutline, IoTrashOutline } from "react-icons/io5";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import DeleteAdvertisementConfirm from "@/components/Dashboard/DeleteAdvertisementConfirm";
import AdsStatsSection from "@/components/Dashboard/advertisements/AdsStatsSection";
import AdsMobileList from "@/components/Dashboard/advertisements/AdsMobileList";
import AdsEmptyState from "@/components/Dashboard/advertisements/AdsEmptyState";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import LinkTo from "@/components/Global/LinkTo";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import { fetchMenuAnalytics } from "@/lib/fetchMenuAnalytics";
import { adRowMetrics } from "@/lib/adMetrics";

export default function AdvertisementsPage() {
  const locale = useLocale();
  const t = useTranslations("Advertisements.page");
  const tAds = useTranslations("Advertisements");
  const tMenus = useTranslations("Menus");
  const params = useParams();
  const menuParam = (params as Record<string, string | string[] | undefined>)
    .menu;
  const menuId =
    typeof menuParam === "string"
      ? menuParam
      : Array.isArray(menuParam)
        ? menuParam[0] ?? ""
        : "";

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);
  const [refreshing, setRefreshing] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [adAnalyticsDemo, setAdAnalyticsDemo] = useState(false);

  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = !userData || isFreePlanUser(userData);

  const fetchAds = useCallback(async () => {
    if (!menuId || isFreePlan) return;
    try {
      setLoading(true);
      const result = await axiosGet<{
        success?: boolean;
        data?: {
          ads?: Advertisement[];
          pagination?: { totalPages?: number };
        };
      }>(`/menus/${menuId}/ads?page=${page}&limit=10`, locale);

      if (result.status && result.data) {
        const wrapper = result.data;
        const list = wrapper.data?.ads ?? [];
        setAds(list);

        const pages = wrapper.data?.pagination?.totalPages ?? 0;
        setTotalPages(pages);
      } else {
        setAds([]);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, page, isFreePlan]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds, refreshing]);

  useEffect(() => {
    if (!menuId || isFreePlan) return;
    void fetchMenuAnalytics(menuId, locale, "30d").then((data) => {
      setAdAnalyticsDemo(Boolean(data._isDemoData));
    });
  }, [menuId, locale, isFreePlan]);

  const adSummaryMetrics = useMemo(() => {
    const totalImpressions = ads.reduce(
      (s, ad) => s + Number(ad.impressionCount ?? 0),
      0,
    );
    const totalClicks = ads.reduce(
      (s, ad) => s + Number(ad.clickCount ?? 0),
      0,
    );
    const ctr =
      totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 1000) / 10
        : 0;
    return [
      {
        id: "imp",
        label: t("metrics.impressions"),
        value: totalImpressions.toLocaleString(),
        tone: "sky" as const,
      },
      {
        id: "clk",
        label: t("metrics.clicks"),
        value: totalClicks.toLocaleString(),
        tone: "amber" as const,
      },
      {
        id: "ctr",
        label: t("metrics.ctr"),
        value: `${ctr}%`,
        tone: "emerald" as const,
      },
    ];
  }, [ads, t]);

  const refreshList = useCallback(() => setRefreshing((v) => v + 1), []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingAd(null);
  }, []);

  const handleAddClick = useCallback(() => {
    setEditingAd(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((ad: Advertisement) => {
    setEditingAd(ad);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((ad: Advertisement) => {
    setDeletingAd(ad);
  }, []);

  const getTitle = useCallback(
    (ad: Advertisement) => {
      if (locale === "ar") return ad.titleAr || ad.title || "";
      return ad.title || ad.titleAr || "";
    },
    [locale],
  );

  const getContent = useCallback(
    (ad: Advertisement) => {
      const full =
        locale === "ar"
          ? ad.contentAr || ad.content
          : ad.content || ad.contentAr;

      if (!full) return "—";
      return full.length > 80 ? `${full.slice(0, 77)}...` : full;
    },
    [locale],
  );

  const columnDefs = useMemo<ColDef<Advertisement>[]>(
    () => [
      {
        headerName: t("columns.image"),
        field: "imageUrl",
        width: 72,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          const src = ad.imageUrl ?? (ad as { image?: string }).image ?? "";
          return (
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
              {src ? (
                <LoadImage
                  src={src}
                  alt={getTitle(ad)}
                  className="size-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  —
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: t("columns.title"),
        field: "title",
        flex: 1,
        minWidth: 140,
        maxWidth: 220,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          return (
            <span
              className="block truncate font-semibold text-slate-800 dark:text-slate-100"
              dir={locale === "ar" ? "rtl" : "ltr"}
              title={getTitle(ad)}
            >
              {getTitle(ad) || "—"}
            </span>
          );
        },
      },
      {
        headerName: t("columns.content"),
        field: "content",
        flex: 1.5,
        minWidth: 160,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          return (
            <span
              className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400"
              dir={locale === "ar" ? "rtl" : "ltr"}
              title={getContent(ad)}
            >
              {getContent(ad)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.link"),
        field: "linkUrl",
        width: 120,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          const link = ad?.linkUrl;
          if (!link) {
            return (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                —
              </span>
            );
          }
          const label = link.length > 24 ? `${link.slice(0, 21)}...` : link;
          return (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-xs text-primary hover:underline"
              dir="ltr"
              title={link}
            >
              {label}
            </a>
          );
        },
      },
      {
        headerName: t("columns.impressions"),
        field: "impressionCount",
        width: 88,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          const metrics = adRowMetrics(ad);
          return (
            <span className="tabular-nums text-sm text-slate-700 dark:text-slate-300">
              {metrics.impressionCount.toLocaleString()}
            </span>
          );
        },
      },
      {
        headerName: t("columns.clicks"),
        field: "clickCount",
        width: 76,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          const metrics = adRowMetrics(ad);
          return (
            <span className="tabular-nums text-sm text-slate-700 dark:text-slate-300">
              {metrics.clickCount.toLocaleString()}
            </span>
          );
        },
      },
      {
        headerName: t("columns.ctr"),
        width: 68,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          const metrics = adRowMetrics(ad);
          return (
            <span className="tabular-nums text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {metrics.ctr}%
            </span>
          );
        },
      },
      {
        headerName: t("columns.actions"),
        width: 92,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          return (
            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 divide-x divide-slate-200 dark:border-slate-600 dark:divide-slate-600">
              <button
                type="button"
                title={t("edit")}
                aria-label={t("edit")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(ad);
                }}
                className="inline-flex size-8 items-center justify-center text-slate-600 transition-colors hover:bg-primary/5 hover:text-primary dark:text-slate-300 dark:hover:bg-primary/10"
              >
                <IoCreateOutline className="text-base" />
              </button>
              <button
                type="button"
                title={t("delete")}
                aria-label={t("delete")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(ad);
                }}
                className="inline-flex size-8 items-center justify-center text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-300"
              >
                <IoTrashOutline className="text-base" />
              </button>
            </div>
          );
        },
      },
    ],
    [locale, getTitle, getContent, t, handleEdit, handleDelete],
  );

  if (isFreePlan) {
    return (
      <div
        id="onboarding-ads-upgrade"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[60vh] md:gap-4"
      >
        <PageTitleWithHelp className="justify-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
            {tAds("freePlanTitle")}
          </h1>
        </PageTitleWithHelp>
        <p className="max-w-md text-sm text-slate-500 md:text-base dark:text-slate-400">
          {tAds("freePlanDescription")}
        </p>
        <LinkTo
          href={`/dashboard/${menuId}/subscription`}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] md:mt-4 md:px-8"
        >
          {tMenus("upgradePlan")}
        </LinkTo>
      </div>
    );
  }

  if (!menuId) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        <p>{t("noMenuId")}</p>
      </div>
    );
  }

  const textDir = locale === "ar" ? "rtl" : "ltr";
  const showEmpty = !loading && ads.length === 0;

  return (
    <>
      <div
        id="onboarding-advertisements-header"
        className="dashboard-ads-header mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 md:mb-6"
        dir={textDir}
      >
        <div className="min-w-0">
          <PageTitleWithHelp>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="mt-0.5 text-sm text-slate-500 md:mt-1 dark:text-slate-400">
            {t("description")}
          </p>
        </div>
        <button
          id="onboarding-advertisements-actions"
          type="button"
          onClick={handleAddClick}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:px-5"
        >
          <IoAddCircleOutline className="text-lg" aria-hidden />
          {t("addButton")}
        </button>
      </div>

      {adAnalyticsDemo && (
        <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
      )}

      {showEmpty ? (
        <AdsEmptyState onAdd={handleAddClick} />
      ) : (
        <>
          {ads.length > 0 && (
            <AdsStatsSection items={adSummaryMetrics} dir={textDir} />
          )}

          <div id="onboarding-advertisements-table" className="dashboard-ads-page min-w-0">
            <div className="hidden md:block">
              <DataTable<Advertisement>
                rowData={ads}
                columnDefs={columnDefs}
                loading={loading}
                locale={locale}
                showRowNumbers
                pagination
                paginationPageSize={10}
                fitContent
                rowHeight={56}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="dashboard-ads-datatable"
                defaultColDef={{
                  autoHeight: false,
                  wrapText: false,
                  cellStyle: {
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </div>

            <AdsMobileList
              ads={ads}
              loading={loading}
              locale={locale}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              getTitle={getTitle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAddClick}
            />
          </div>
        </>
      )}

      {(showModal || editingAd) && menuId && (
        <AddAdvertisementModal
          menuId={menuId}
          ad={editingAd}
          onClose={closeModal}
          onRefresh={refreshList}
        />
      )}

      {deletingAd && (
        <DeleteAdvertisementConfirm
          ad={deletingAd}
          localeTitle={getTitle(deletingAd)}
          onClose={() => setDeletingAd(null)}
          onDeleted={refreshList}
        />
      )}
    </>
  );
}
