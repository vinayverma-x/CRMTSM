"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, AlertCircle, User } from "lucide-react"
import { Lead, LeadStatusHistory } from "@/lib/types"

interface LeadStatusTimelineProps {
  lead: Lead
  statusHistory?: LeadStatusHistory[]
}

export default function LeadStatusTimeline({ lead, statusHistory = [] }: LeadStatusTimelineProps) {
  // Create timeline from status history or generate from current status
  const timeline = statusHistory.length > 0
    ? statusHistory
    : [
        {
          id: "1",
          leadId: lead.id,
          status: lead.status,
          changedBy: "System",
          changedById: "system",
          changedAt: lead.createdAt || new Date().toISOString(),
          notes: "Lead created",
        },
      ]

  const statusConfig = {
    New: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", label: "New" },
    "In Progress": { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "In Progress" },
    Converted: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Converted" },
    Lost: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Lost" },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Lead Status Timeline
        </CardTitle>
        <CardDescription>Visualize the journey from inquiry to enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline Items */}
          <div className="space-y-6">
            {timeline.map((item, index) => {
              const StatusIcon = statusConfig[item.status as keyof typeof statusConfig]?.icon || AlertCircle
              const statusColor = statusConfig[item.status as keyof typeof statusConfig]?.color || "text-gray-600"
              const statusBg = statusConfig[item.status as keyof typeof statusConfig]?.bg || "bg-gray-50"
              const isLast = index === timeline.length - 1

              return (
                <div key={item.id} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background ${statusBg} ${statusColor}`}
                  >
                    <StatusIcon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <Badge className={`${statusBg} ${statusColor} border-0`}>
                          {statusConfig[item.status as keyof typeof statusConfig]?.label || item.status}
                        </Badge>
                        <p className="text-sm font-medium text-foreground mt-2">{item.notes || "Status changed"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.changedAt).toLocaleDateString()} {new Date(item.changedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Changed by: {item.changedBy}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Status Summary */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Current Status</span>
            <Badge
              className={`${
                statusConfig[lead.status as keyof typeof statusConfig]?.bg
              } ${statusConfig[lead.status as keyof typeof statusConfig]?.color} border-0`}
            >
              {statusConfig[lead.status as keyof typeof statusConfig]?.label || lead.status}
            </Badge>
          </div>
          {lead.lastContact && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Last Contact</span>
              <span className="text-sm text-foreground">{lead.lastContact}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

