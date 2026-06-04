import { prisma } from "@/lib/prisma";

export interface AdminUserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  plan: "free" | "pro" | "enterprise";
  emailVerified: boolean;
  createdAt: string;
  _count: {
    ideas: number;
    reports: number;
    validations: number;
    chatThreads: number;
  };
}

export interface AdminAnalyticsResponse {
  users: {
    total: number;
    byPlan: { free: number; pro: number; enterprise: number };
    newThisMonth: number;
    activeToday: number;
  };
  reports: {
    total: number;
    byIndustry: { industry: string; count: number }[];
    averageScores: {
      overall: number;
      market: number;
      team: number;
      moat: number;
      monetization: number;
      traction: number;
      risk: number;
    };
    generatedThisMonth: number;
  };
  usage: {
    total: number;
    byAction: { action: string; count: number }[];
    dailyTrend: { date: string; count: number }[];
  };
  api: {
    totalCalls: number;
    averageLatencyMs: number;
    errorRate: number;
    topEndpoints: { path: string; count: number; avgDuration: number }[];
  };
  revenue: {
    total: number;
    byPlan: { plan: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    pendingInvoices: number;
  };
}

export const adminService = {
  async listUsers(): Promise<AdminUserResponse[]> {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            ideas: true,
            reports: true,
            validations: true,
            chatThreads: true,
          },
        },
      },
    });

    const planMap = { FREE: "free" as const, PRO: "pro" as const, ENTERPRISE: "enterprise" as const };

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      isAdmin: u.isAdmin,
      plan: planMap[u.plan],
      emailVerified: u.emailVerified,
      createdAt: u.createdAt.toISOString(),
      _count: u._count,
    }));
  },

  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      usersByPlan,
      newUsersThisMonth,
      totalReports,
      reportsThisMonth,
      reportsByIndustry,
      avgScores,
      totalUsage,
      usageByAction,
      dailyUsage,
      totalApiCalls,
      apiStats,
      apiTopEndpoints,
      totalRevenue,
      revenueByPlan,
      revenueMonthly,
      pendingPayments,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.groupBy({ by: ["plan"], where: { deletedAt: null }, _count: true }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: firstOfMonth } } }),
      prisma.report.count(),
      prisma.report.count({ where: { createdAt: { gte: firstOfMonth } } }),
      prisma.report.groupBy({ by: ["industry"], _count: true, orderBy: { _count: { industry: "desc" } } }),
      prisma.report.aggregate({
        _avg: { overallScore: true, marketScore: true, teamScore: true, moatScore: true, monetizationScore: true, tractionScore: true, riskScore: true },
      }),
      prisma.usage.count(),
      prisma.usage.groupBy({ by: ["action"], _count: true, orderBy: { _count: { action: "desc" } } }),
      prisma.usage.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.apiLog.count(),
      prisma.apiLog.aggregate({ _avg: { durationMs: true } }),
      prisma.apiLog.groupBy({ by: ["path"], _count: true, _avg: { durationMs: true }, orderBy: { _count: { path: "desc" } }, take: 10 }),
      prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
      prisma.payment.groupBy({ by: ["description"], where: { status: "SUCCEEDED" }, _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } } }),
      prisma.payment.findMany({
        where: { status: "SUCCEEDED" },
        select: { amount: true, paidAt: true },
        orderBy: { paidAt: "asc" },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
    ]);

    const byPlanMap = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
    for (const row of usersByPlan) {
      byPlanMap[row.plan] = row._count;
    }

    const totalApiErrorCalls = await prisma.apiLog.count({
      where: { statusCode: { gte: 500 } },
    });

    const dailyMap = new Map<string, number>();
    for (const u of dailyUsage) {
      const key = u.createdAt.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const revenueMonthlyMap = new Map<string, number>();
    for (const p of revenueMonthly) {
      if (p.paidAt) {
        const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, "0")}`;
        revenueMonthlyMap.set(key, (revenueMonthlyMap.get(key) ?? 0) + p.amount);
      }
    }
    const monthlyRevenue = Array.from(revenueMonthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const planMap: Record<string, string> = { "Validify Pro": "pro", "Validify Enterprise": "enterprise" };

    return {
      users: {
        total: totalUsers,
        byPlan: { free: byPlanMap.FREE, pro: byPlanMap.PRO, enterprise: byPlanMap.ENTERPRISE },
        newThisMonth: newUsersThisMonth,
        activeToday: 0,
      },
      reports: {
        total: totalReports,
        byIndustry: reportsByIndustry.map((r) => ({ industry: r.industry, count: r._count })),
        averageScores: {
          overall: Math.round(avgScores._avg.overallScore ?? 0),
          market: Math.round(avgScores._avg.marketScore ?? 0),
          team: Math.round(avgScores._avg.teamScore ?? 0),
          moat: Math.round(avgScores._avg.moatScore ?? 0),
          monetization: Math.round(avgScores._avg.monetizationScore ?? 0),
          traction: Math.round(avgScores._avg.tractionScore ?? 0),
          risk: Math.round(avgScores._avg.riskScore ?? 0),
        },
        generatedThisMonth: reportsThisMonth,
      },
      usage: {
        total: totalUsage,
        byAction: usageByAction.map((u) => ({ action: u.action, count: u._count })),
        dailyTrend,
      },
      api: {
        totalCalls: totalApiCalls,
        averageLatencyMs: Math.round(apiStats._avg.durationMs ?? 0),
        errorRate: totalApiCalls > 0 ? Math.round((totalApiErrorCalls / totalApiCalls) * 100) : 0,
        topEndpoints: apiTopEndpoints.map((e) => ({
          path: e.path,
          count: e._count,
          avgDuration: Math.round(e._avg.durationMs ?? 0),
        })),
      },
      revenue: {
        total: totalRevenue._sum.amount ?? 0,
        byPlan: revenueByPlan.map((r) => {
          const label = Object.keys(planMap).find((k) => r.description?.includes(k)) ?? "other";
          return { plan: planMap[label] ?? label, amount: r._sum.amount ?? 0 };
        }),
        monthly: monthlyRevenue,
        pendingInvoices: pendingPayments,
      },
    };
  },
};
