import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Plus, Trash2 } from "lucide-react";

export default function ApiKeysPage() {
  // Mock data - replace with real data from your backend
  const apiKeys = [
    {
      id: "1",
      name: "Production Key",
      key: "mk_prod_••••••••••••••••",
      created: "2025-12-01",
      lastUsed: "2 hours ago",
    },
    {
      id: "2",
      name: "Development Key",
      key: "mk_dev_••••••••••••••••",
      created: "2025-11-15",
      lastUsed: "1 day ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your API keys for accessing MemVault services
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Key
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Keep your API keys secure
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Never share your API keys publicly or commit them to version control.
                Store them securely in environment variables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                  <CardDescription>
                    Created on {apiKey.created} • Last used {apiKey.lastUsed}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-3 font-mono text-sm">
                {apiKey.key}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">12,458</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">99.8%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-2xl font-bold">127ms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
