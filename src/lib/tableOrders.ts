import type {
  ActionDetail,
  CallEntry,
  EntryAction,
  EntryOrder,
  OrderStatus,
} from "@/types/tableOrders";

const TERMINAL_STATUSES = new Set<OrderStatus>([
  "confirmed",
  "cancelled",
  "prepared",
  "delivered",
]);

/** Latest lifecycle status (not the first TABLE_CALL_CREATED row). */
export function resolveLatestOrderStatus(
  actions?: Array<{ status?: string }>,
  order?: { status?: string } | null,
): OrderStatus {
  const orderStatus = order?.status?.trim().toLowerCase() as OrderStatus | "";
  if (orderStatus && TERMINAL_STATUSES.has(orderStatus)) {
    return orderStatus;
  }
  if (!actions?.length) return "pending";
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const s = String(actions[i]?.status ?? "")
      .trim()
      .toLowerCase() as OrderStatus;
    if (TERMINAL_STATUSES.has(s)) return s;
  }
  return String(actions[actions.length - 1]?.status ?? "pending")
    .trim()
    .toLowerCase() as OrderStatus;
}

export function resolveListEntryStatus(entry: CallEntry): OrderStatus {
  return resolveLatestOrderStatus(entry.actionDetails);
}

export function isPendingOrder(entry: CallEntry): boolean {
  return resolveListEntryStatus(entry) === "pending";
}

export function countPendingOrders(entries: CallEntry[]): number {
  return entries.filter(isPendingOrder).length;
}

export function dashboardSocketOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL ?? "").trim();
  if (!raw) {
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }
  try {
    const u = new URL(raw);
    const path = u.pathname.replace(/\/+$/, "");
    if (path === "/api" || path.endsWith("/api")) {
      u.pathname = "";
      return u.origin;
    }
    return u.origin;
  } catch {
    return raw.replace(/\/?api\/?$/i, "");
  }
}

export const ORDER_ACTION_LABEL: Record<string, { en: string; ar: string }> = {
  TABLE_CALL_CREATED: { en: "Order Created", ar: "تم إنشاء الطلب" },
  TABLE_CALL_CONFIRMED: { en: "Order Confirmed", ar: "تم تأكيد الطلب" },
  TABLE_CALL_CANCELLED: { en: "Order Cancelled", ar: "تم إلغاء الطلب" },
  TABLE_CALL_ITEMS_UPDATED: { en: "Items Updated", ar: "تم تحديث الأصناف" },
  TABLE_CALL_PREPARED: { en: "Order Prepared", ar: "تم تحضير الطلب" },
  TABLE_CALL_DELIVERED: { en: "Order Delivered", ar: "تم تسليم الطلب" },
};

export function orderActionLabel(action: string, locale: string): string {
  const entry = ORDER_ACTION_LABEL[action];
  if (!entry) return action;
  return locale === "ar" ? entry.ar : entry.en;
}

export function isGuestOrderAction(act: EntryAction): boolean {
  return (
    act.action === "TABLE_CALL_CREATED" ||
    String(act.actorRole ?? "").toLowerCase() === "guest"
  );
}

export function actionActorName(
  act: EntryAction,
  order?: EntryOrder | null,
): string {
  if (isGuestOrderAction(act)) {
    const fromOrder =
      order?.customerName ?? act.detail?.order?.customerName ?? null;
    if (fromOrder != null && String(fromOrder).trim() !== "") {
      return String(fromOrder).trim();
    }
  }
  return act.waiterName?.trim() ?? "";
}

export function lastStaffWaiterName(actions: EntryAction[]): string | null {
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const act = actions[i];
    if (isGuestOrderAction(act)) continue;
    const name = act.waiterName?.trim();
    if (name) return name;
  }
  return null;
}

export function resolveEntryTime(details?: ActionDetail[]): string | undefined {
  if (!details?.length) return undefined;
  return details[details.length - 1]?.time;
}

export function orderStatusTone(status: OrderStatus): {
  pill: string;
  dot: string;
} {
  switch (status) {
    case "confirmed":
      return {
        pill: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        dot: "text-green-500",
      };
    case "prepared":
      return {
        pill: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
        dot: "text-sky-500",
      };
    case "delivered":
      return {
        pill: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
        dot: "text-violet-500",
      };
    case "cancelled":
      return {
        pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        dot: "text-red-500",
      };
    default:
      return {
        pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        dot: "text-amber-500",
      };
  }
}
