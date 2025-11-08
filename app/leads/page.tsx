"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LeadsTable from "@/components/leads/leads-table"
import LeadsFilters from "@/components/leads/leads-filters"
import AddLeadModal from "@/components/leads/add-lead-modal"
import SuccessNotification from "@/components/leads/success-notification"
import { getCurrentUser, dummyLeads, getLeadsForCounselor, setCurrentUser } from "@/lib/data/dummy-data"
import { User, Lead } from "@/lib/types"

export default function LeadsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    // Load leads based on user role
    let userLeads: Lead[] = []
    if (user.role === "COUNSELOR") {
      // Counselors only see their assigned leads
      userLeads = getLeadsForCounselor(user.id)
    } else {
      // Super Admin and Admin see all leads
      userLeads = dummyLeads
    }
    setAllLeads(userLeads)
    setLeads(userLeads)
    setFilteredLeads(userLeads)
  }, [router])

  const handleAddLead = (newLead: any) => {
    if (!currentUser) return

    const lead: Lead = {
      ...newLead,
      id: Math.random().toString(36).substr(2, 9),
      assignedCounselorId: newLead.assignedCounselorId || newLead.assignedCounselor || "",
      createdById: currentUser.id,
      createdAt: new Date().toISOString().split("T")[0],
    }
    const updatedLeads = [lead, ...allLeads]
    setAllLeads(updatedLeads)
    setLeads(updatedLeads)
    setFilteredLeads(updatedLeads)
    setIsAddLeadOpen(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    const updatedLeads = allLeads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    setAllLeads(updatedLeads)
    setLeads(leads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)))
    setFilteredLeads(filteredLeads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)))
  }

  const canAddLead = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN"

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads Management</h1>
          <p className="text-muted-foreground mt-1">
            {currentUser?.role === "COUNSELOR"
              ? "View and manage your assigned leads"
              : "Manage and track all leads"}
          </p>
        </div>
        {canAddLead && (
          <AddLeadModal isOpen={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} onAddLead={handleAddLead} />
        )}
      </div>

      {/* Filters and Search */}
      <LeadsFilters
        leads={allLeads}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilteredLeads}
      />

      {/* Success Notification */}
      {showSuccess && <SuccessNotification message="Lead added successfully!" />}

      {/* Leads Table */}
      <LeadsTable leads={filteredLeads} allLeads={allLeads} onStatusChange={handleStatusChange} />
    </>
  )
}
