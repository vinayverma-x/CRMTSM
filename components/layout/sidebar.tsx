"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const menuItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    badge: null,
  },
  { href: "/leads", icon: Users, label: "Leads", badge: "12" },
  { href: "/students", icon: BookOpen, label: "Students", badge: null },
  { href: "/payments", icon: CreditCard, label: "Payments", badge: "5" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks", badge: "3" },
  { href: "/chatbot", icon: MessageSquare, label: "Chatbot", badge: null },
  { href: "/reports", icon: BarChart3, label: "Reports", badge: null },
  { href: "/settings", icon: Settings, label: "Settings", badge: null },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-64px)] w-72 border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-40 shadow-lg",
          "lg:translate-x-0 lg:relative lg:top-0 lg:h-[calc(100vh-64px)] lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="h-full overflow-y-auto p-4 space-y-2 flex flex-col">
          <div className="px-2 py-3 mb-2 hidden lg:block">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</p>
          </div>

          <div className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary/90 to-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform duration-300",
                        isActive ? "group-hover:scale-110" : "group-hover:scale-105",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2 relative z-10">
                    {item.badge && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="border-t border-sidebar-border pt-4 mt-auto">
            <div className="px-3 py-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary">Pro Version</p>
                  <p className="text-xs text-sidebar-foreground/70 mt-1">Unlock advanced features</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
