"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { userApi } from "@/lib/api";

interface UserStats {
  creditsUsed: number;
  creditsLimit: number;
  tier: string;
  totalMemories: number;
  storageUsed: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const data = await userApi.getStats();
        setStats({
          creditsUsed: data.creditsUsed,
          creditsLimit: data.creditsLimit,
          tier: data.tier,
          totalMemories: data.totalMemories,
          storageUsed: data.storageUsed,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  const usagePercentage = stats 
    ? ((stats.creditsUsed / stats.creditsLimit) * 100).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{error || 'Failed to load data'}</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here's your memory service dashboard.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Credits Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.creditsUsed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.creditsLimit.toLocaleString()} credits
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tier}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tier === 'PRO' ? '$99/month' : stats.tier === 'HOBBY' ? '$29/month' : 'Free'}
              </p>
            </CardContent>
          </Card>

          {/* Total Memories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMemories.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>

          {/* Storage Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.storageUsed} GB</div>
              <p className="text-xs text-muted-foreground">
                of 10 GB available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest memory operations and API calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Memory stored: User preferences
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2 minutes ago
                  </p>
                </div>
                <div className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Success
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Memory retrieved: Chat history
                  </p>
                  <p className="text-sm text-muted-foreground">
                    15 minutes ago
                  </p>
                </div>
                <div className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Success
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    API key created: Production Key
                  </p>
                  <p className="text-sm text-muted-foreground">
                    1 hour ago
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  New
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
