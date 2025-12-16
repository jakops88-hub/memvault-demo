"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { UpgradeButton } from "@/components/UpgradeButton";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  CreditCard,
  Calendar,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { userApi } from "@/lib/api";

export default function BillingPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await userApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load billing data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = {
    name: stats?.tier || "HOBBY",
    status: "Active",
    price: stats?.tier === "PRO" ? 99 : 29,
    interval: "month",
    nextBillingDate: "January 15, 2026",
  };

  const usage = {
    current: stats?.creditsUsed || 0,
    limit: stats?.creditsLimit || 100000,
    percentage: stats ? parseFloat(((stats.creditsUsed / stats.creditsLimit) * 100).toFixed(1)) : 0,
  };

  return (
    <>
    <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Current Plan</CardTitle>
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {currentPlan.status}
              </Badge>
            </div>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{currentPlan.name}</span>
              <span className="text-muted-foreground">Plan</span>
            </div>

            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Subscription Cost</p>
                  <p className="text-lg font-bold">
                    ${currentPlan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{currentPlan.interval}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Next Billing Date</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.nextBillingDate}
                  </p>
                </div>
              </div>
            </div>

            <ManageSubscriptionButton label="Manage Subscription" />
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Credit Usage</CardTitle>
            <CardDescription>Your monthly credit consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">
                  {usage.current.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {usage.limit.toLocaleString()} credits
                </span>
              </div>
              <Progress value={usage.percentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {usage.percentage}% of monthly credits used
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Usage Trend</p>
                  <p className="text-sm text-muted-foreground">
                    +12% compared to last month
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium">
                {currentPlan.name === "PRO" ? "Manage your subscription" : "Need more credits?"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentPlan.name === "PRO" 
                  ? "Update payment method, view invoices, or cancel subscription."
                  : "Upgrade your plan to get higher limits and additional features."}
              </p>
              {currentPlan.name === "PRO" ? (
                <ManageSubscriptionButton
                  label="Manage Subscription"
                  variant="outline"
                />
              ) : (
                <UpgradeButton
                  currentTier={currentPlan.name}
                  priceId={process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1ABC..."}
                  label="Upgrade to Pro - $99/mo"
                  variant="default"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                date: "December 15, 2025",
                amount: 49,
                status: "Paid",
                invoice: "INV-2025-12",
              },
              {
                date: "November 15, 2025",
                amount: 49,
                status: "Paid",
                invoice: "INV-2025-11",
              },
              {
                date: "October 15, 2025",
                amount: 49,
                status: "Paid",
                invoice: "INV-2025-10",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.invoice}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">${item.amount}</span>
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
