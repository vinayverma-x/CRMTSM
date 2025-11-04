"use client"

import { useState } from "react"
import DashboardHeader from "@/components/dashboard/header"
import LeadsTable from "@/components/leads/leads-table"
import LeadsFilters from "@/components/leads/leads-filters"
import AddLeadModal from "@/components/leads/add-lead-modal"
import SuccessNotification from "@/components/leads/success-notification"

export interface Lead {
  id: string
  name: string
  course: string
  source: "Website" | "Referral" | "Social Media" | "Email"
  status: "New" | "In Progress" | "Converted" | "Lost"
  assignedCounselor: string
  lastContact: string
  email?: string
  phone?: string
  notes?: string
}

export default function LeadsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "John Smith",
      course: "Computer Science",
      source: "Website",
      status: "New",
      assignedCounselor: "Sarah Johnson",
      lastContact: "2024-11-01",
      email: "john@example.com",
      phone: "+1-555-0101",
    },
    {
      id: "2",
      name: "Emily Davis",
      course: "Business Administration",
      source: "Referral",
      status: "In Progress",
      assignedCounselor: "Michael Chen",
      lastContact: "2024-10-28",
      email: "emily@example.com",
      phone: "+1-555-0102",
    },
    {
      id: "3",
      name: "Alex Thompson",
      course: "Engineering",
      source: "Social Media",
      status: "Converted",
      assignedCounselor: "Sarah Johnson",
      lastContact: "2024-10-15",
      email: "alex@example.com",
      phone: "+1-555-0103",
    },
    {
      id: "4",
      name: "Jessica Lee",
      course: "Medicine",
      source: "Email",
      status: "In Progress",
      assignedCounselor: "David Kumar",
      lastContact: "2024-10-20",
      email: "jessica@example.com",
      phone: "+1-555-0104",
    },
    {
      id: "5",
      name: "Robert Wilson",
      course: "Law",
      source: "Website",
      status: "Lost",
      assignedCounselor: "Michael Chen",
      lastContact: "2024-09-30",
      email: "robert@example.com",
      phone: "+1-555-0105",
    },
  ])

  const [filteredLeads, setFilteredLeads] = useState(leads)
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddLead = (newLead: Omit<Lead, "id">) => {
    const lead: Lead = {
      ...newLead,
      id: Math.random().toString(36).substr(2, 9),
    }
    setLeads([lead, ...leads])
    setFilteredLeads([lead, ...filteredLeads])
    setIsAddLeadOpen(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    const updatedLeads = leads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    setLeads(updatedLeads)
    setFilteredLeads(filteredLeads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        onSignOut={() => {}}
      />

      <main className="flex-1">
        <div className="p-4 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leads Management</h1>
              <p className="text-muted-foreground mt-1">Manage and track all your leads</p>
            </div>
            <AddLeadModal isOpen={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} onAddLead={handleAddLead} />
          </div>

          {/* Filters and Search */}
          <LeadsFilters
            leads={leads}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterChange={setFilteredLeads}
          />

          {/* Success Notification */}
          {showSuccess && <SuccessNotification message="Lead added successfully!" />}

          {/* Leads Table */}
          <LeadsTable leads={filteredLeads} onStatusChange={handleStatusChange} />
        </div>
      </main>
    </div>
  )
}
