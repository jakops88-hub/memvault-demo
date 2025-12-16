"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey || !apiKey.startsWith("sk_")) {
      alert("Please enter a valid API key (starts with sk_)");
      return;
    }

    try {
      setIsLoading(true);

      // TEMPORARY: For testing, allow any sk_ key and use demo data
      // TODO: Remove this and uncomment real API call when backend is ready
      if (apiKey.startsWith("sk_test_") || apiKey.startsWith("sk_demo_")) {
        // Demo login for testing
        setUser({
          id: "demo-user-001",
          email: "demo@memvault.com",
          apiKey: apiKey,
          tier: "PRO",
        });
        router.push("/dashboard");
        return;
      }

      // Real API verification (when backend is ready)
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/user/me`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Invalid API key");
      }

      const userData = await response.json();

      // Save to auth context (which saves to localStorage)
      setUser({
        id: userData.id,
        email: userData.email,
        apiKey: apiKey,
        tier: userData.tier,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid API key. Please check your key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center gap-2 justify-center mb-4">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">MemVault</span>
          </Link>
          <CardTitle>Login with API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                placeholder="sk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Check your email for your API key
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/pricing" className="text-blue-500 hover:underline">
                Get started
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
