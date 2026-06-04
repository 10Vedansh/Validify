import { api } from "@/lib/api";
import type { User } from "@/types/user";

export const userService = {
  async update(patch: Partial<Pick<User, "name" | "avatarUrl">>): Promise<User> {
    const { data } = await api.patch<User>("/me", patch);
    return data;
  },
};
