"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users } from "lucide-react"
import { Lead } from "@/lib/types"

interface PerformanceHeatmapProps {
  leads: Lead[]
  counselors: { id: string; name: string }[]
}

export default function PerformanceHeatmap({ leads, counselors }: PerformanceHeatmapProps) {
  // Calculate performance metrics for each counselor
  const counselorPerformance = counselors.map((counselor) => {
    const counselorLeads = leads.filter((lead) => lead.assignedCounselorId === counselor.id)
    const converted = counselorLeads.filter((l) => l.status === "Converted").length
    const total = counselorLeads.length
    const conversionRate = total > 0 ? (converted / total) * 100 : 0
    const avgLeadScore =
      counselorLeads.length > 0
        ? counselorLeads.reduce((sum, lead) => sum + (lead.leadScore || 0), 0) / counselorLeads.length
        : 0

    return {
      ...counselor,
      totalLeads: total,
      converted,
      conversionRate,
      avgLeadScore,
      performanceScore: (conversionRate * 0.6 + (avgLeadScore / 100) * 40).toFixed(1), // Weighted score
    }
  })

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Average"
    return "Needs Improvement"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Counselor Performance Heatmap
        </CardTitle>
        <CardDescription>Visual performance overview of all counselors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {counselorPerformance.map((counselor) => {
            const performanceScore = parseFloat(counselor.performanceScore)
            return (
              <div key={counselor.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{counselor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {counselor.totalLeads} leads • {counselor.converted} converted
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{performanceScore.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{getPerformanceLabel(performanceScore)}</p>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Performance Score</span>
                    <span className="font-medium">{performanceScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${getPerformanceColor(performanceScore)} transition-all duration-500`}
                      style={{ width: `${Math.min(performanceScore, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Conversion Rate</p>
                    <p className="text-lg font-bold text-foreground">{counselor.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Lead Score</p>
                    <p className="text-lg font-bold text-foreground">{counselor.avgLeadScore.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Leads</p>
                    <p className="text-lg font-bold text-foreground">{counselor.totalLeads}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {counselorPerformance.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No counselor performance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

