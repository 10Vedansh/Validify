export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};
