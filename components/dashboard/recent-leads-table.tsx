"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, dummyLeads, getLeadsForCounselor } from "@/lib/data/dummy-data"
import { Lead, UserRole } from "@/lib/types"

interface RecentLeadsTableProps {
  userRole?: UserRole
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Converted":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "New":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "Lost":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export default function RecentLeadsTable({ userRole }: RecentLeadsTableProps) {
  const [leadsData, setLeadsData] = useState<Lead[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      if (user.role === "COUNSELOR") {
        setLeadsData(getLeadsForCounselor(user.id).slice(0, 5))
      } else {
        setLeadsData(dummyLeads.slice(0, 5))
      }
    }
  }, [])
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Recent Leads</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Latest leads and their enrollment status</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-xs sm:text-sm font-semibold text-foreground">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold text-foreground hidden sm:table-cell">Course</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold text-foreground">Status</TableHead>
                  {userRole !== "COUNSELOR" && (
                    <TableHead className="text-xs sm:text-sm font-semibold text-foreground hidden md:table-cell">
                      Counselor
                    </TableHead>
                  )}
                  <TableHead className="text-xs sm:text-sm font-semibold text-foreground hidden lg:table-cell">Last Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={userRole === "COUNSELOR" ? 4 : 5} className="text-center py-8 text-muted-foreground">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  leadsData.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="hover:bg-muted/50 transition-colors duration-200 border-b border-border/50"
                    >
                      <TableCell className="font-medium text-sm sm:text-base py-3 sm:py-4">
                        <div className="flex flex-col">
                          <span>{lead.name}</span>
                          <span className="text-xs text-muted-foreground sm:hidden mt-1">{lead.course}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm sm:text-base py-3 sm:py-4 hidden sm:table-cell">
                        {lead.course}
                      </TableCell>
                    <TableCell className="py-3 sm:py-4">
                      <Badge className={`${getStatusColor(lead.status)} text-xs px-2 py-1`}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    {userRole !== "COUNSELOR" && (
                      <TableCell className="text-sm sm:text-base py-3 sm:py-4 hidden md:table-cell">
                        <div className="max-w-[150px] truncate" title={lead.assignedCounselor}>
                          {lead.assignedCounselor}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground text-xs sm:text-sm py-3 sm:py-4 hidden lg:table-cell">
                      {new Date(lead.lastContact).toLocaleDateString()}
                    </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
