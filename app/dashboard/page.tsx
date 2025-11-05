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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            {/* Summary Cards */}
            <div className="transition-all duration-300 ease-in-out">
              <SummaryCards />
            </div>

            {/* Charts and Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300 ease-in-out">
              <div className="lg:col-span-2 w-full">
                <div className="transition-all duration-300 ease-in-out hover:scale-[1.01]">
                  <AdmissionsTrendChart />
                </div>
              </div>
              <div className="lg:col-span-1 w-full">
                {!notificationsOpen && (
                  <div className="transition-all duration-300 ease-in-out">
                    <NotificationsPanel isCompact={true} />
                  </div>
                )}
              </div>
            </div>

            {/* Recent Leads Table */}
            <div className="transition-all duration-300 ease-in-out">
              <RecentLeadsTable />
            </div>
          </div>
        </main>

        {/* Notifications Sidebar */}
        {notificationsOpen && (
          <div className="hidden lg:block w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card transition-all duration-300 ease-in-out">
            <NotificationsPanel isCompact={false} />
          </div>
        )}
      </div>
    </div>
  )
}
