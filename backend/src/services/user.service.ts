import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { User } from "@prisma/client";
import type { UpdateUserInput } from "@/schemas/user.schema";

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
}

function serializeUser(user: User): UserResponse {
  const planMap = { FREE: "free" as const, PRO: "pro" as const, ENTERPRISE: "enterprise" as const };
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin,
    plan: planMap[user.plan],
    createdAt: user.createdAt.toISOString(),
  };
}

export const userService = {
  async update(userId: string, input: UpdateUserInput): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundError("User");

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl || null;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return serializeUser(updated);
  },

  async me(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundError("User");
    return serializeUser(user);
  },
};
