"use client"

import { Bell, AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Notification {
  id: number
  type: "info" | "warning" | "success"
  title: string
  message: string
  time: string
}

const notifications: Notification[] = [
  {
    id: 1,
    type: "success",
    title: "New Admission",
    message: "Priya Kumari has enrolled in Data Science program",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "warning",
    title: "Fee Pending",
    message: "Rajeev Singh has pending fee for Spring semester",
    time: "4 hours ago",
  },
  {
    id: 3,
    type: "info",
    title: "Counselor Assignment",
    message: "Dr. Anjali Verma assigned to 5 new leads",
    time: "6 hours ago",
  },
  {
    id: 4,
    type: "success",
    title: "Document Verified",
    message: "Neha Patel's documents have been verified",
    time: "1 day ago",
  },
  {
    id: 5,
    type: "info",
    title: "Follow-up Required",
    message: "15 leads need counselor follow-up",
    time: "1 day ago",
  },
]

interface NotificationsPanelProps {
  isCompact?: boolean
}

export default function NotificationsPanel({ isCompact = false }: NotificationsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<number[]>([])

  const toggleDismiss = (id: number) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const visibleNotifications = notifications.filter((notif) => !dismissedIds.includes(notif.id))

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
      case "warning":
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
      case "info":
        return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
    }
  }

  if (isCompact) {
    return (
      <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Notifications</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{visibleNotifications.length} new</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 sm:space-y-3">
            {visibleNotifications.slice(0, 4).map((notif) => (
              <div 
                key={notif.id} 
                className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted rounded-lg hover:bg-muted/80 transition-all duration-200 ease-in-out hover:scale-[1.02]"
              >
                <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{notif.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full bg-card flex flex-col border-l border-border transition-all duration-300 ease-in-out">
      <div className="p-4 sm:p-6 border-b border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Notifications</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{visibleNotifications.length} unread</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {visibleNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className="p-3 sm:p-4 hover:bg-muted/50 transition-all duration-200 ease-in-out"
          >
            <div className="flex gap-2 sm:gap-3 mb-2">
              <div className="flex-shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-xs sm:text-sm">{notif.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
              </div>
              <button
                onClick={() => toggleDismiss(notif.id)}
                className="text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 flex-shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground pl-7 sm:pl-8">{notif.time}</p>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-6 border-t border-border">
        <button className="w-full text-xs sm:text-sm font-medium text-primary hover:text-accent transition-all duration-200 ease-in-out py-2 rounded-lg hover:bg-primary/10">
          View All Notifications
        </button>
      </div>
    </div>
  )
}
