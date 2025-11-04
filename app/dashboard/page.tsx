"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/header"
import SummaryCards from "@/components/dashboard/summary-cards"
import AdmissionsTrendChart from "@/components/dashboard/admissions-chart"
import RecentLeadsTable from "@/components/dashboard/recent-leads-table"
import NotificationsPanel from "@/components/dashboard/notifications-panel"

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleSignOut = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        onSignOut={handleSignOut}
      />

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1">
          <div className="p-4 md:p-8">
            {/* Summary Cards */}
            <SummaryCards />

            {/* Charts and Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2">
                <AdmissionsTrendChart />
              </div>
              <div className="lg:col-span-1">{!notificationsOpen && <NotificationsPanel isCompact={true} />}</div>
            </div>

            {/* Recent Leads Table */}
            <div className="mt-8">
              <RecentLeadsTable />
            </div>
          </div>
        </main>

        {/* Notifications Sidebar */}
        {notificationsOpen && (
          <div className="hidden lg:block w-80 border-l border-border bg-card">
            <NotificationsPanel isCompact={false} />
          </div>
        )}
      </div>
    </div>
  )
}
