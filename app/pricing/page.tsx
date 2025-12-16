"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Brain, Loader2 } from "lucide-react";

export default function PricingPage() {
  const [hobbyEmail, setHobbyEmail] = useState("");
  const [proEmail, setProEmail] = useState("");
  const [isLoadingHobby, setIsLoadingHobby] = useState(false);
  const [isLoadingPro, setIsLoadingPro] = useState(false);

  const handleCheckout = async (plan: 'hobby' | 'pro') => {
    const email = plan === 'hobby' ? hobbyEmail : proEmail;
    const priceId = plan === 'hobby' 
      ? process.env.NEXT_PUBLIC_STRIPE_HOBBY_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

    if (!email) {
      alert("Please enter your email");
      return;
    }

    if (!priceId) {
      alert(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is not configured yet`);
      return;
    }

    try {
      const setLoading = plan === 'hobby' ? setIsLoadingHobby : setIsLoadingPro;
      setLoading(true);
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/public/stripe/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            priceId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create checkout");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      const setLoading = plan === 'hobby' ? setIsLoadingHobby : setIsLoadingPro;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <nav className="container mx-auto px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold text-white">MemVault</span>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-12">
            Simple, Transparent Pricing
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Hobby Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Hobby</CardTitle>
                <div className="text-3xl font-bold">$29<span className="text-sm text-muted-foreground">/month</span></div>
                <p className="text-sm text-muted-foreground">Perfect for side projects</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    100,000 credits/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Semantic search
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    GraphRAG support
                  </li>
                </ul>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={hobbyEmail}
                    onChange={(e) => setHobbyEmail(e.target.value)}
                  />
                  <Button
                    onClick={() => handleCheckout('hobby')}
                    disabled={isLoadingHobby}
                    className="w-full"
                  >
                    {isLoadingHobby ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-blue-500 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Pro
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Popular</span>
                </CardTitle>
                <div className="text-3xl font-bold">$99<span className="text-sm text-muted-foreground">/month</span></div>
                <p className="text-sm text-muted-foreground">Pay-as-you-go after limit</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    1,000,000 credits/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited overage (pay per call)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced analytics
                  </li>
                </ul>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={proEmail}
                    onChange={(e) => setProEmail(e.target.value)}
                  />
                  <Button
                    onClick={() => handleCheckout('pro')}
                    disabled={isLoadingPro}
                    className="w-full"
                  >
                    {isLoadingPro ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
