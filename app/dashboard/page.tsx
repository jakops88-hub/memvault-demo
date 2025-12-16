"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Database, Zap, TrendingUp, Loader2, Key, Calendar } from "lucide-react";
import { userApi } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('memvault_api_key') : null;
  const maskedKey = apiKey ? `${apiKey.slice(0, 12)}...${apiKey.slice(-4)}` : 'No key found';

  return (
    <>
    <div className="space-y-6">
        {/* Page Header with API Key Display */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Monitor your API usage and memory service metrics
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="font-mono text-xs px-3 py-1">
              <Key className="w-3 h-3 mr-2" />
              {maskedKey}
            </Badge>
            <span className="text-xs text-muted-foreground">API Key</span>
          </div>
        </div>

        {/* API Usage Overview Card */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">API Usage</CardTitle>
                <CardDescription>Your current monthly consumption</CardDescription>
              </div>
              <Badge className="bg-blue-600">
                {stats?.tier || 'HOBBY'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-blue-600">
                  {stats?.creditsUsed.toLocaleString() || '0'}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {stats?.creditsLimit.toLocaleString() || '0'} credits
                </span>
              </div>
              <Progress 
                value={stats ? (stats.creditsUsed / stats.creditsLimit) * 100 : 0} 
                className="h-3"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {usagePercentage}% used
                </span>
                <span className="text-muted-foreground">
                  Resets: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Database className="w-3 h-3" />
                  <span>Memories</span>
                </div>
                <p className="text-2xl font-bold">{stats?.totalMemories.toLocaleString() || '0'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>Storage</span>
                </div>
                <p className="text-2xl font-bold">{((stats?.storageUsed || 0) / 1024).toFixed(1)} KB</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>This Month</span>
                </div>
                <p className="text-2xl font-bold">{stats?.creditsUsed.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Playground</CardTitle>
              <CardDescription className="text-xs">
                Test your API in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/playground">
                <Button className="w-full">
                  Open Playground
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription className="text-xs">
                Manage your authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/api-keys">
                <Button variant="outline" className="w-full">
                  View Keys
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Billing</CardTitle>
              <CardDescription className="text-xs">
                Manage subscription & invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full">
                  View Billing
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Grid */}
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
