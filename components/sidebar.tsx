"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Wrench,
  Settings,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/leases", label: "Leases", icon: FileText },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    console.log("[v0] Toggling theme from", resolvedTheme, "to", newTheme);
    setTheme(newTheme);
  };

  // Only use theme after mounting to avoid hydration mismatch (resolvedTheme differs on server vs client)
  const isDark = mounted && resolvedTheme === "dark";
  const themeAriaLabel = mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme";
  const themeTitle = mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme";

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-sidebar-foreground">REMS</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-sidebar-foreground"
            aria-label={themeAriaLabel}
          >
            {mounted ? (isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Mobile Nav */}
      <nav
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 transform border-r border-sidebar-border bg-sidebar p-4 transition-transform duration-200 ease-in-out md:hidden",
          collapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setCollapsed(true)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
            <Building2 className="h-6 w-6 text-primary" />
            {!collapsed && (
              <span className="font-semibold text-sidebar-foreground">REMS</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-sidebar-foreground", collapsed && "hidden")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {collapsed && (
          <div className="p-2 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="w-full text-sidebar-foreground"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">PM</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    Property Manager
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    admin@rems.com
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-sidebar-foreground shrink-0"
                title={themeTitle}
              >
                {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <div className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="p-2 border-t border-sidebar-border flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-full text-sidebar-foreground"
              title={themeTitle}
            >
              {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <div className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
