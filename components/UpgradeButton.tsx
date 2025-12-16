"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { billingApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface UpgradeButtonProps {
  currentTier: string;
  priceId: string; // Stripe Price ID from environment or props
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function UpgradeButton({ 
  currentTier, 
  priceId,
  label = "Upgrade to Pro",
  variant = "default" 
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const { url } = await billingApi.createCheckoutSession(priceId);
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show upgrade button if already on PRO tier
  if (currentTier === 'PRO') {
    return null;
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      variant={variant}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
