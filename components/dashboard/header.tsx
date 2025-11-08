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
    <>
      {/* ✅ MOBILE HEADER (only visible on small screens) */}
      <header
        className={`md:hidden ${
          sidebarOpen ? "block" : "hidden"
        } border-b border-border bg-card/95 backdrop-blur-sm z-50 shadow-sm`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="h-12 flex-shrink-0">
            <Image
              src="/tsm-logo.png"
              alt="TSM University"
              width={160}
              height={80}
              priority
              className="h-full w-auto object-contain"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notification Button */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-muted rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
            </button>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-2.5 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all duration-200 ease-in-out text-sm font-medium hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ✅ DESKTOP HEADER (always visible from md and up) */}
      <header className="hidden md:block border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm transition-all duration-300 ease-in-out">
        <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Left - Logo Only */}
          <div className="flex items-center">
            <div className="relative h-14 w-auto flex-shrink-0">
              <Image
                src="/tsm-logo.png"
                alt="TSM University"
                width={180}
                height={90}
                priority
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-muted rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
            </button>

            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all duration-200 ease-in-out text-sm font-medium hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
