"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, CheckCircle, XCircle } from "lucide-react"
import { Lead } from "@/lib/types"

interface ConversionFunnelProps {
  leads: Lead[]
}

export default function ConversionFunnel({ leads }: ConversionFunnelProps) {
  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.status === "New").length
  const inProgressLeads = leads.filter((l) => l.status === "In Progress").length
  const convertedLeads = leads.filter((l) => l.status === "Converted").length
  const lostLeads = leads.filter((l) => l.status === "Lost").length

  const newPercentage = totalLeads > 0 ? (newLeads / totalLeads) * 100 : 0
  const inProgressPercentage = totalLeads > 0 ? (inProgressLeads / totalLeads) * 100 : 0
  const convertedPercentage = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
  const lostPercentage = totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0

  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Conversion Funnel
        </CardTitle>
        <CardDescription>Visualize the lead conversion journey from inquiry to enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Leads */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Total Leads</span>
              <span className="text-sm font-bold text-primary">{totalLeads}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-8">
              <div className="bg-primary rounded-full h-8 flex items-center justify-center text-white text-sm font-medium" style={{ width: "100%" }}>
                {totalLeads} Leads
              </div>
            </div>
          </div>

          {/* New Leads */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                New Leads
              </span>
              <span className="text-sm font-bold text-blue-600">{newLeads} ({newPercentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-8">
              <div
                className="bg-blue-500 rounded-full h-8 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${newPercentage}%` }}
              >
                {newLeads > 0 && newLeads}
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                In Progress
              </span>
              <span className="text-sm font-bold text-amber-600">
                {inProgressLeads} ({inProgressPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-8">
              <div
                className="bg-amber-500 rounded-full h-8 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${inProgressPercentage}%` }}
              >
                {inProgressLeads > 0 && inProgressLeads}
              </div>
            </div>
          </div>

          {/* Converted */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Converted
              </span>
              <span className="text-sm font-bold text-green-600">
                {convertedLeads} ({convertedPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-8">
              <div
                className="bg-green-500 rounded-full h-8 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${convertedPercentage}%` }}
              >
                {convertedLeads > 0 && convertedLeads}
              </div>
            </div>
          </div>

          {/* Lost */}
          {lostLeads > 0 && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Lost
                </span>
                <span className="text-sm font-bold text-red-600">
                  {lostLeads} ({lostPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-8">
                <div
                  className="bg-red-500 rounded-full h-8 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${lostPercentage}%` }}
                >
                  {lostLeads > 0 && lostLeads}
                </div>
              </div>
            </div>
          )}

          {/* Conversion Rate Summary */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overall Conversion Rate</span>
              <span className="text-2xl font-bold text-primary">{conversionRate.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {convertedLeads} out of {totalLeads} leads converted to students
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

