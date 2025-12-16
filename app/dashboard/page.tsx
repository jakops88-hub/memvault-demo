import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
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
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">
              of 100,000 credits
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: "45.2%" }}
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
            <div className="text-2xl font-bold">Hobby</div>
            <p className="text-xs text-muted-foreground">
              $29/month
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
            <div className="text-2xl font-bold">1,284</div>
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
            <div className="text-2xl font-bold">2.4 GB</div>
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
  );
}
