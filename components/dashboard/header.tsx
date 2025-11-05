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
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm transition-all duration-300 ease-in-out">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative h-10 w-10 sm:h-12 sm:w-auto flex-shrink-0">
            <Image 
              src="/tsm-logo.png" 
              alt="TSM University" 
              width={100} 
              height={50} 
              priority 
              className="h-full w-auto object-contain" 
            />
          </div>
          <div className="hidden sm:block border-l border-border pl-3">
            <h1 className="text-foreground font-semibold text-sm sm:text-base">TSM CRM</h1>
            <p className="text-muted-foreground text-xs">University Management</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Notifications Button */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 sm:p-2.5 hover:bg-muted rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all duration-200 ease-in-out text-xs sm:text-sm font-medium hover:scale-105 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
