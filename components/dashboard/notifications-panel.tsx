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
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Bell className="w-5 h-5 text-foreground" />
    }
  }

  if (isCompact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Notifications</CardTitle>
          <CardDescription>{visibleNotifications.length} new</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visibleNotifications.slice(0, 4).map((notif) => (
              <div key={notif.id} className="flex gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-screen bg-card flex flex-col border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <p className="text-xs text-muted-foreground mt-1">{visibleNotifications.length} unread</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {visibleNotifications.map((notif) => (
          <div key={notif.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex gap-3 mb-2">
              <div className="flex-shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{notif.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
              </div>
              <button
                onClick={() => toggleDismiss(notif.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{notif.time}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button className="w-full text-sm font-medium text-primary hover:text-accent transition-colors">
          View All Notifications
        </button>
      </div>
    </div>
  )
}
