"use client"

import { Bell, LogOut } from "lucide-react"
import Image from "next/image"

interface DashboardHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  onSignOut: () => void
}

export default function DashboardHeader({
  sidebarOpen,
  setSidebarOpen,
  notificationsOpen,
  setNotificationsOpen,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <Image src="/tsm-logo.png" alt="TSM University" width={100} height={50} priority className="h-12 w-auto" />
          <div className="hidden sm:block border-l border-border pl-3">
            <h1 className="text-foreground font-semibold">TSM CRM</h1>
            <p className="text-muted-foreground text-xs">University Management</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications Button */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
