"use client"

import { Users, UserCheck, DollarSign, TrendingUp, UserCog, BookOpen, FileText, BarChart3, CreditCard } from "lucide-react"
import { DashboardAnalytics, UserRole } from "@/lib/types"

interface SummaryCardsProps {
  analytics: DashboardAnalytics
  userRole?: UserRole
}

export default function SummaryCards({ analytics, userRole }: SummaryCardsProps) {
  // Get student data if user is a student
  const studentData = userRole === "STUDENT" ? (analytics as any).studentData : null

  const summaryData =
    userRole === "STUDENT" && studentData
      ? [
          {
            icon: BookOpen,
            title: "Current CGPA",
            value: studentData.cgpa ? studentData.cgpa.toFixed(2) : "N/A",
            change: `${studentData.semester || "Current"} Semester`,
            changeType: "positive" as const,
          },
          {
            icon: Users,
            title: "Attendance",
            value: studentData.attendance ? `${studentData.attendance}%` : "N/A",
            change: "This semester",
            changeType: studentData.attendance && studentData.attendance >= 75 ? ("positive" as const) : ("negative" as const),
          },
          {
            icon: CreditCard,
            title: "Pending Fees",
            value: studentData.pendingFees ? `₹${studentData.pendingFees.toLocaleString()}` : "₹0",
            change: studentData.pendingFees ? "Payment due" : "All paid",
            changeType: studentData.pendingFees ? ("negative" as const) : ("positive" as const),
          },
          {
            icon: FileText,
            title: "Documents",
            value: studentData.documentsCount ? studentData.documentsCount.toString() : "0",
            change: "Uploaded",
            changeType: "positive" as const,
          },
        ]
      : userRole === "COUNSELOR"
        ? [
            {
              icon: Users,
              title: "My Leads",
              value: analytics.totalLeads.toString(),
              change: `+${analytics.newLeads} new`,
              changeType: "positive" as const,
            },
            {
              icon: UserCheck,
              title: "Converted",
              value: analytics.convertedLeads.toString(),
              change: `${analytics.conversionRate}% rate`,
              changeType: "positive" as const,
            },
            {
              icon: TrendingUp,
              title: "Conversion Rate",
              value: `${analytics.conversionRate}%`,
              change: `${analytics.convertedLeads} converted`,
              changeType: "positive" as const,
            },
            {
              icon: BarChart3,
              title: "Performance",
              value: "Good",
              change: "This month",
              changeType: "positive" as const,
            },
          ]
        : [
            {
              icon: Users,
              title: "Total Leads",
              value: analytics.totalLeads.toString(),
              change: `+${analytics.newLeads} new`,
              changeType: "positive" as const,
            },
            {
              icon: UserCheck,
              title: "Active Students",
              value: analytics.totalStudents.toString(),
              change: "+8.2%",
              changeType: "positive" as const,
            },
            {
              icon: DollarSign,
              title: "Conversion Rate",
              value: `${analytics.conversionRate}%`,
              change: `${analytics.convertedLeads} converted`,
              changeType: "positive" as const,
            },
            {
              icon: userRole === "SUPER_ADMIN" ? UserCog : TrendingUp,
              title: userRole === "SUPER_ADMIN" ? "Active Counselors" : "Monthly Admissions",
              value:
                userRole === "SUPER_ADMIN"
                  ? analytics.activeCounselors.toString()
                  : analytics.convertedLeads.toString(),
              change: userRole === "SUPER_ADMIN" ? "Active users" : "+15.8%",
              changeType: "positive" as const,
            },
          ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {summaryData.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-2 truncate">{item.title}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{item.value}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg flex-shrink-0 ml-3 transition-all duration-300 hover:bg-primary/20">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  item.changeType === "positive" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {item.change}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
