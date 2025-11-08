"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
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
  UserCog,
  Bell,
  Shield,
  User,
  FileText,
  FileSearch,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/data/dummy-data"
import { UserRole } from "@/lib/types"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface MenuItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge: string | null
  roles: UserRole[] // Which roles can see this menu item
}

const allMenuItems: MenuItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"],
  },
  {
    href: "/leads",
    icon: Users,
    label: "Leads",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"],
  },
  {
    href: "/auto-assignment",
    icon: Target,
    label: "Auto Assignment",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/students",
    icon: BookOpen,
    label: "Students",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"],
  },
  {
    href: "/profile",
    icon: User,
    label: "My Profile",
    badge: null,
    roles: ["STUDENT"],
  },
  {
    href: "/payments",
    icon: CreditCard,
    label: "Payments",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"],
  },
  {
    href: "/documents",
    icon: FileText,
    label: "Documents",
    badge: null,
    roles: ["STUDENT"],
  },
  {
    href: "/tasks",
    icon: CheckSquare,
    label: "Tasks",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"],
  },
  {
    href: "/notices",
    icon: Bell,
    label: "Notice Board",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"],
  },
  {
    href: "/chat",
    icon: MessageSquare,
    label: "Internal Chat",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"],
  },
  {
    href: "/chatbot",
    icon: MessageSquare,
    label: "Chatbot",
    badge: null,
    roles: ["STUDENT"],
  },
  {
    href: "/reports",
    icon: BarChart3,
    label: "Reports",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/activity-logs",
    icon: FileSearch,
    label: "Activity Logs",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/users",
    icon: UserCog,
    label: "User Management",
    badge: null,
    roles: ["SUPER_ADMIN"],
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    badge: null,
    roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"],
  },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<{ role: UserRole } | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    if (!currentUser) return false
    return item.roles.includes(currentUser.role)
  })

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
          // Base styles
          "fixed left-0 top-16 h-[calc(100vh-64px)] w-72 border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-40 shadow-lg",
          // Mobile: show/hide based on open state
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop (lg+): always visible, relative positioning
          "lg:translate-x-0 lg:relative lg:top-0 lg:h-[calc(100vh-64px)] lg:shadow-none",
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
            {currentUser && (
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center gap-2 px-2">
                  <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    {currentUser.role.replace("_", " ")}
                  </span>
                </div>
              </div>
            )}
            <div className="px-3 py-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary">TSM CRM</p>
                  <p className="text-xs text-sidebar-foreground/70 mt-1">University Management System</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
