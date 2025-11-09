"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Menu, X, LogOut, Settings, User, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { getCurrentUser, clearAuth } from "@/lib/data/dummy-data"
import { User as UserType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface NavbarProps {
  onSidebarToggle: () => void
  sidebarOpen: boolean
}

export function Navbar({ onSidebarToggle, sidebarOpen }: NavbarProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const [currentUser, setCurrentUserState] = useState<UserType | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)
  }, [])

  const handleLogout = async () => {
    // Clear auth tokens
    clearAuth()
    // Optionally call logout API
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
    // Redirect to login
    router.push("/")
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "COUNSELOR":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "STUDENT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchValue)
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card shadow-sm backdrop-blur-sm bg-card/95">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo and Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onSidebarToggle}
            className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary transition-all duration-200 group"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>

          <Link href="/dashboard" className="flex items-center flex-shrink-0 group">
            <div className="relative h-10 sm:h-12 w-auto">
              <Image 
                src="/tsm-logo.png" 
                alt="TSM University" 
                width={140} 
                height={70} 
                priority
                className="h-full w-auto object-contain" 
              />
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex mx-4 flex-1 max-w-md lg:max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search leads, students, payments..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-4 bg-secondary border-border input-focus h-10 text-sm"
            />
          </div>
        </form>

        {/* Right: Actions and Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="hidden sm:flex relative p-2 rounded-lg hover:bg-secondary transition-colors duration-200 group">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors duration-200 cursor-pointer group">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-200">
                  <span className="text-xs font-bold text-primary">
                    {currentUser?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U"}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-foreground leading-none">
                    {currentUser?.name || "User"}
                  </span>
                  {currentUser && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getRoleBadgeColor(currentUser.role)} border-0 px-1.5 py-0`}
                    >
                      {currentUser.role.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 animate-fade-in">
              <div className="px-3 py-3 bg-secondary rounded-t-lg">
                <p className="text-sm font-semibold text-foreground">{currentUser?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email || ""}</p>
                {currentUser && (
                  <Badge
                    variant="secondary"
                    className={`text-xs mt-1 ${getRoleBadgeColor(currentUser.role)} border-0`}
                  >
                    {currentUser.role.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-3 cursor-pointer py-2.5 px-3">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-3 cursor-pointer py-2.5 px-3">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-3 cursor-pointer py-2.5 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
