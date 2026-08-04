"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminDashboardResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatMoney } from "@/lib/format";

export default function AdminDashboardPage() {
  const { session } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    adminApi
      .dashboard(session.accessToken)
      .then(setDashboard)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard."));
  }, [session]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!dashboard) return <p className="text-sm text-zinc-500">Loading…</p>;

  const stats: [string, string][] = [
    ["Total users", String(dashboard.totalUsers)],
    ["Total websites", String(dashboard.totalWebsites)],
    ["Active subscriptions", String(dashboard.activeSubscriptions)],
    ["Pending payments", String(dashboard.pendingPayments)],
    ["Expiring soon", String(dashboard.subscriptionsExpiringSoon)],
    ["Total revenue", formatMoney(dashboard.totalRevenue)],
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Platform dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
