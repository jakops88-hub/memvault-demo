"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Brain, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/SidebarNav";

function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xl">MemVault</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <SidebarNav />
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>Memory as a Service</p>
          <p className="mt-1">© 2025 MemVault</p>
        </div>
      </div>
    </div>
  );
}

function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar.png" alt="User" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Jacob Sandström</p>
            <p className="text-xs leading-none text-muted-foreground">
              jacob@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Logo for mobile */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">MemVault</span>
          </Link>

          {/* Spacer for desktop */}
          <div className="hidden lg:block" />

          {/* User Profile */}
          <UserNav />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
