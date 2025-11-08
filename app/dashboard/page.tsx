"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SummaryCards from "@/components/dashboard/summary-cards"
import AdmissionsTrendChart from "@/components/dashboard/admissions-chart"
import RecentLeadsTable from "@/components/dashboard/recent-leads-table"
import NotificationsPanel from "@/components/dashboard/notifications-panel"
import ConversionFunnel from "@/components/dashboard/conversion-funnel"
import PerformanceHeatmap from "@/components/dashboard/performance-heatmap"
import { getCurrentUser, dummyAnalytics, getLeadsForCounselor, dummyLeads, setCurrentUser, getStudentById, getCounselors } from "@/lib/data/dummy-data"
import { User, Student } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [analytics, setAnalytics] = useState(dummyAnalytics)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    // Load role-based analytics
    if (user.role === "COUNSELOR") {
      // Counselor sees only their leads
      const counselorLeads = getLeadsForCounselor(user.id)
      const converted = counselorLeads.filter((l) => l.status === "Converted").length
      setAnalytics({
        ...dummyAnalytics,
        totalLeads: counselorLeads.length,
        newLeads: counselorLeads.filter((l) => l.status === "New").length,
        convertedLeads: converted,
        conversionRate: counselorLeads.length > 0 ? Math.round((converted / counselorLeads.length) * 100) : 0,
      })
    } else if (user.role === "STUDENT") {
      // Students see their own academic info
      const student = user as Student
      setAnalytics({
        ...dummyAnalytics,
        totalLeads: 0,
        newLeads: 0,
        convertedLeads: 0,
        totalStudents: 1,
        activeCounselors: 0,
        conversionRate: 0,
        leadsBySource: [],
        leadsByStatus: [],
        counselorPerformance: [],
        studentData: {
          cgpa: student.cgpa || 0,
          attendance: student.attendance || 0,
          semester: student.semester || "N/A",
          pendingFees: 250000, // Dummy pending fees
          documentsCount: 3, // Dummy document count
        },
      } as any)
      setCurrentUserState(student)
    } else {
      // Super Admin and Admin see all analytics
      setAnalytics(dummyAnalytics)
    }
  }, [router])

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Summary Cards */}
      <div className="transition-all duration-300 ease-in-out">
        <SummaryCards analytics={analytics} userRole={currentUser?.role} />
      </div>

      {/* Charts and Tables Section - Hide for students */}
      {currentUser?.role !== "STUDENT" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300 ease-in-out">
            <div className="lg:col-span-2 w-full">
              <div className="transition-all duration-300 ease-in-out hover:scale-[1.01]">
                <AdmissionsTrendChart analytics={analytics} />
              </div>
            </div>
            <div className="lg:col-span-1 w-full">
              <div className="transition-all duration-300 ease-in-out">
                <NotificationsPanel isCompact={true} />
              </div>
            </div>
          </div>

          {/* Conversion Funnel and Lead Source Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 transition-all duration-300 ease-in-out">
            <ConversionFunnel
              leads={
                currentUser?.role === "COUNSELOR"
                  ? getLeadsForCounselor(currentUser.id)
                  : dummyLeads
              }
            />
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>Lead Source Analytics</span>
              </h3>
              <div className="space-y-4">
                {analytics.leadsBySource.map((source, idx) => {
                  const percentage = analytics.totalLeads > 0 ? (source.count / analytics.totalLeads) * 100 : 0
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{source.source}</span>
                        <span className="text-sm font-bold text-primary">
                          {source.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Performance Heatmap - Only for Admin/Super Admin */}
          {(currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN") && (
            <div className="transition-all duration-300 ease-in-out">
              <PerformanceHeatmap leads={dummyLeads} counselors={getCounselors()} />
            </div>
          )}

          {/* Recent Leads Table */}
          <div className="transition-all duration-300 ease-in-out">
            <RecentLeadsTable userRole={currentUser?.role} />
          </div>
        </>
      )}

      {/* Student-specific content */}
      {currentUser?.role === "STUDENT" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="transition-all duration-300 ease-in-out">
            <NotificationsPanel isCompact={true} />
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/profile"
                className="block p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <span className="font-medium">View My Profile</span>
                <p className="text-sm text-muted-foreground mt-1">View your academic information and progress</p>
              </a>
              <a
                href="/payments"
                className="block p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <span className="font-medium">Pay Fees</span>
                <p className="text-sm text-muted-foreground mt-1">View and pay your pending fees</p>
              </a>
              <a
                href="/documents"
                className="block p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <span className="font-medium">My Documents</span>
                <p className="text-sm text-muted-foreground mt-1">View and upload your documents</p>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
