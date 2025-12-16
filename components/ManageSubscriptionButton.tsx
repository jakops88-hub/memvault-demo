"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ManageSubscriptionButtonProps {
  variant?: "default" | "outline";
  label?: string;
}

export function ManageSubscriptionButton({
  variant = "default",
  label = "Manage Subscription",
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);

      // Call your Koyeb backend instead of local API route
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-backend.koyeb.app").replace(/\/$/, '');
      
      const response = await fetch(`${backendUrl}/api/stripe/create-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication token if needed
          // "Authorization": `Bearer ${yourAuthToken}`,
        },
        credentials: "include", // Include cookies if using session-based auth
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe portal
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      className="w-full sm:w-auto"
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
