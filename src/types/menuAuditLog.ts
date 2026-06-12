export type MenuAuditLogEntry = {
  id: string;
  actionType: string;
  title: string;
  description?: string | null;
  entityType?: string | null;
  entityName?: string | null;
  userName?: string | null;
  createdAt: string;
  /** No reliable timestamp on source record */
  isUndated?: boolean;
};

export type MenuAuditLogsPayload = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  entries: MenuAuditLogEntry[];
};

export type FetchMenuActivityLogParams = {
  page?: number;
  limit?: number;
  q?: string;
};

export type ActivityLogLabels = {
  categoryCreated: (name: string) => string;
  categoryUpdated: (name: string) => string;
  itemCreated: (name: string) => string;
  itemUpdated: (name: string) => string;
  staffCreated: (name: string) => string;
  tableCreated: (number: string) => string;
  adCreated: (title: string) => string;
  adUpdated: (title: string) => string;
  settingsUpdated: string;
};
