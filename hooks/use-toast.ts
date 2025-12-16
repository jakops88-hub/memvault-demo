import { useState } from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toast = ({ title, description, variant }: ToastProps) => {
    // Simple alert implementation - can be replaced with a proper toast library later
    const message = description ? `${title}\n${description}` : title;
    if (variant === "destructive") {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  return { toast };
};
