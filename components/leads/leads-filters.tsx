"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import type { Lead } from "@/app/leads/page"

interface LeadsFiltersProps {
  leads: Lead[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterChange: (filteredLeads: Lead[]) => void
}

export default function LeadsFilters({ leads, searchQuery, onSearchChange, onFilterChange }: LeadsFiltersProps) {
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "All">("All")
  const [sourceFilter, setSourceFilter] = useState<Lead["source"] | "All">("All")
  const [counselorFilter, setCounselorFilter] = useState<string>("All")

  const counselors = ["All", ...new Set(leads.map((l) => l.assignedCounselor))]
  const sources = ["All", ...new Set(leads.map((l) => l.source))]
  const statuses: (Lead["status"] | "All")[] = ["All", "New", "In Progress", "Converted", "Lost"]

  const handleFilterChange = () => {
    let filtered = leads

    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    if (sourceFilter !== "All") {
      filtered = filtered.filter((lead) => lead.source === sourceFilter)
    }

    if (counselorFilter !== "All") {
      filtered = filtered.filter((lead) => lead.assignedCounselor === counselorFilter)
    }

    onFilterChange(filtered)
  }

  const handleStatusChange = (status: Lead["status"] | "All") => {
    setStatusFilter(status)
  }

  const handleSourceChange = (source: Lead["source"] | "All") => {
    setSourceFilter(source)
  }

  const handleCounselorChange = (counselor: string) => {
    setCounselorFilter(counselor)
  }

  const handleSearchChange = (query: string) => {
    onSearchChange(query)
  }

  // Apply filters whenever any filter changes
  useState(() => {
    handleFilterChange()
  }, [searchQuery, statusFilter, sourceFilter, counselorFilter])

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4 relative">
        <Search className="absolute left-3 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => {
            handleSearchChange(e.target.value)
            handleFilterChange()
          }}
          className="flex-1 pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            handleStatusChange(e.target.value as Lead["status"] | "All")
            handleFilterChange()
          }}
          className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              Status: {status}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => {
            handleSourceChange(e.target.value as Lead["source"] | "All")
            handleFilterChange()
          }}
          className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {sources.map((source) => (
            <option key={source} value={source}>
              Source: {source}
            </option>
          ))}
        </select>

        <select
          value={counselorFilter}
          onChange={(e) => {
            handleCounselorChange(e.target.value)
            handleFilterChange()
          }}
          className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {counselors.map((counselor) => (
            <option key={counselor} value={counselor}>
              Counselor: {counselor}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="text-xs text-muted-foreground mt-3">
        Showing <span className="font-semibold text-foreground">filtered results</span>
      </div>
    </div>
  )
}
