"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LeadsTable from "@/components/leads/leads-table"
import LeadsFilters from "@/components/leads/leads-filters"
import AddLeadModal from "@/components/leads/add-lead-modal"
import SuccessNotification from "@/components/leads/success-notification"
import { getCurrentUser, dummyLeads, getLeadsForCounselor, setCurrentUser } from "@/lib/data/dummy-data"
import { User, Lead } from "@/lib/types"
import { toast } from "sonner"

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

    // Fetch leads from API
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          router.push("/")
          return
        }

        const response = await fetch("/api/leads", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setAllLeads(data)
          setLeads(data)
          setFilteredLeads(data)
        } else {
          // Fallback to dummy data if API fails
          let userLeads: Lead[] = []
          if (user.role === "COUNSELOR") {
            userLeads = getLeadsForCounselor(user.id)
          } else {
            userLeads = dummyLeads
          }
          setAllLeads(userLeads)
          setLeads(userLeads)
          setFilteredLeads(userLeads)
        }
      } catch (error) {
        console.error("Error fetching leads:", error)
        // Fallback to dummy data
        let userLeads: Lead[] = []
        if (user.role === "COUNSELOR") {
          userLeads = getLeadsForCounselor(user.id)
        } else {
          userLeads = dummyLeads
        }
        setAllLeads(userLeads)
        setLeads(userLeads)
        setFilteredLeads(userLeads)
      }
    }

    fetchLeads()
  }, [router])

  const handleAddLead = async (newLead: any) => {
    if (!currentUser) return

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error("Please login again")
        return
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLead),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to create lead")
        return
      }

      const createdLead = await response.json()
      const updatedLeads = [createdLead, ...allLeads]
      setAllLeads(updatedLeads)
      setLeads(updatedLeads)
      setFilteredLeads(updatedLeads)
      setIsAddLeadOpen(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      toast.success("Lead created successfully")
    } catch (error) {
      console.error("Error creating lead:", error)
      toast.error("Failed to create lead")
    }
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
