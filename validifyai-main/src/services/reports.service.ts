import { api } from "@/lib/api";
import type { Report } from "@/types/report";

export const reportsService = {
  async list(): Promise<Report[]> {
    const { data } = await api.get<Report[]>("/reports");
    return data;
  },
  async get(id: string): Promise<Report | null> {
    const { data } = await api.get<Report>(`/reports/${id}`);
    return data;
  },
  async exportPdf(id: string): Promise<Blob> {
    const { data } = await api.get(`/reports/${id}/export.pdf`, { responseType: "blob" });
    return data;
  },
};
