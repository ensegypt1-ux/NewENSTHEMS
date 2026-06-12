export type CallItem = {
  name: string;
  menuItemId: number;
  quantity: number;
  price: number;
  total: number;
};

/** Shape returned by the list endpoint */
export type ActionDetail = {
  waiterName: string;
  time: string;
  status: string;
};

export type CallEntry = {
  id: string;
  orderId: string;
  lastAction: string;
  actionDetails: ActionDetail[];
  customerName?: string | null;
  tableNumber?: string | null;
  items: CallItem[];
  totalPrice: number;
};

/** Shape returned by the single-entry endpoint (GET /activity-logs/:id) */
export type EntryAction = {
  action: string;
  status: string;
  waiterName: string;
  waiterRole: string;
  actorRole: string;
  actorStaffJobRole: string | null;
  time: string;
  summaryAr: string | null;
  summaryEn: string | null;
  detail: {
    status: string;
    order?: {
      tableNumber?: string;
      customerName?: string;
      items?: CallItem[];
      orderTotal?: number;
      status?: string;
    };
  } | null;
};

export type EntryOrder = {
  tableNumber?: string;
  customerName?: string;
  items?: CallItem[];
  orderTotal?: number;
  status?: string;
};

export type CallEntryDetail = {
  id: string;
  orderId: string;
  lastAction: string;
  actions: EntryAction[];
  order?: EntryOrder;
  items?: CallItem[];
  totalPrice?: number;
  updatedAt?: string;
};

export type ActivityCallsPayload = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  entries: CallEntry[];
  calls: CallEntry[];
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "prepared"
  | "delivered"
  | "cancelled";

export type OrderActionType =
  | "TABLE_CALL_CONFIRMED"
  | "TABLE_CALL_CANCELLED"
  | "TABLE_CALL_PREPARED"
  | "TABLE_CALL_DELIVERED";
