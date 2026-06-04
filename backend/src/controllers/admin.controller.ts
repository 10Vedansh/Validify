import type { Context } from "hono";
import { adminService } from "@/services/admin.service";

export const adminController = {
  async listUsers(c: Context) {
    const users = await adminService.listUsers();
    return c.json(users);
  },

  async getAnalytics(c: Context) {
    const analytics = await adminService.getAnalytics();
    return c.json(analytics);
  },
};
