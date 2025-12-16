"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Terminal, Key, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Playground",
    href: "/playground",
    icon: Terminal,
  },
  {
    title: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
