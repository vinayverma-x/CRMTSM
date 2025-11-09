"use client"

import { useState } from "react"
import { CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, Sparkles } from "lucide-react"
import type { Lead } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { getAIRecommendations } from "@/lib/data/dummy-data"
import LeadStatusTimeline from "./lead-status-timeline"
import DuplicateDetection from "./duplicate-detection"

interface LeadsTableProps {
  leads: Lead[]
  allLeads?: Lead[] // All leads for duplicate detection
  onStatusChange: (leadId: string, newStatus: Lead["status"]) => void
}

const statusConfig = {
  New: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", label: "New" },
  "In Progress": { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "In Progress" },
  Converted: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Converted" },
  Lost: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Lost" },
}

export default function LeadsTable({ leads, allLeads = leads, onStatusChange }: LeadsTableProps) {
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null)

  const toggleStatus = (lead: Lead) => {
    const statusOrder: Lead["status"][] = ["New", "In Progress", "Converted", "Lost"]
    const currentIndex = statusOrder.indexOf(lead.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    onStatusChange(lead.id, nextStatus)
  }

  if (leads.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">No leads found</p>
        <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Course</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Lead Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Source</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Assigned Counselor</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Last Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead) => {
              const StatusIcon = statusConfig[lead.status].icon
              return (
                <tr
                  key={lead.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{lead.course}</td>
                  <td className="px-6 py-4">
                    {lead.leadScore !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            lead.leadScore >= 80
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : lead.leadScore >= 60
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {lead.leadScore}
                        </Badge>
                        {lead.engagementLevel && (
                          <span className="text-xs text-muted-foreground">({lead.engagementLevel})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <span className="px-2 py-1 bg-muted rounded text-xs font-medium">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStatus(lead)
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${statusConfig[lead.status].bg} ${statusConfig[lead.status].color} hover:opacity-80`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig[lead.status].label}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{lead.assignedCounselor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{lead.lastContact}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)
                      }}
                      className="text-primary hover:text-accent font-medium"
                    >
                      {expandedLeadId === lead.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded Row Details */}
      {expandedLeadId && (
        <div className="bg-muted/30 border-t border-border p-6 animate-in slide-in-from-top-2">
          {(() => {
            const lead = leads.find((l) => l.id === expandedLeadId)
            if (!lead) return null
            const recommendations = getAIRecommendations(lead.id)
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Email</span>
                    <p className="text-foreground font-medium">{lead.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Phone</span>
                    <p className="text-foreground font-medium">{lead.phone}</p>
                  </div>
                  {lead.region && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Region</span>
                      <p className="text-foreground font-medium">{lead.region}</p>
                    </div>
                  )}
                  {lead.department && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Department</span>
                      <p className="text-foreground font-medium">{lead.department}</p>
                    </div>
                  )}
                  {lead.predictedConversionRate !== undefined && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Predicted Conversion</span>
                      <p className="text-foreground font-medium">{lead.predictedConversionRate}%</p>
                    </div>
                  )}
                  {lead.totalInteractions && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Total Interactions</span>
                      <p className="text-foreground font-medium">{lead.totalInteractions}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Notes</span>
                    <p className="text-foreground">{lead.notes || "No notes added"}</p>
                  </div>
                </div>

                {/* AI Recommendations */}
                {recommendations.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">AI Recommendations</span>
                    </div>
                    <div className="space-y-2">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="bg-card border border-border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium text-primary">{rec.type.replace("_", " ").toUpperCase()}</span>
                            <Badge variant="secondary" className="text-xs">
                              {rec.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{rec.recommendation}</p>
                          {rec.reasoning && (
                            <p className="text-xs text-muted-foreground mt-1">{rec.reasoning}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Courses */}
                {lead.recommendedCourses && lead.recommendedCourses.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Recommended Courses</span>
                    <div className="flex flex-wrap gap-2">
                      {lead.recommendedCourses.map((course, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duplicate Detection */}
                {lead.duplicateCheck !== false && (
                  <div className="border-t border-border pt-4">
                    <DuplicateDetection lead={lead} allLeads={allLeads} />
                  </div>
                )}

                {/* Lead Status Timeline */}
                <div className="border-t border-border pt-4">
                  <LeadStatusTimeline lead={lead} statusHistory={lead.statusHistory} />
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
