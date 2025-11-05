"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const leadsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    course: "Computer Science",
    status: "Active",
    counselor: "Dr. Ram Prasad",
    lastContact: "2025-10-28",
  },
  {
    id: 2,
    name: "Amit Patel",
    course: "Business Administration",
    status: "Pending",
    counselor: "Ms. Priya Singh",
    lastContact: "2025-10-25",
  },
  {
    id: 3,
    name: "Zara Khan",
    course: "Engineering",
    status: "Active",
    counselor: "Prof. Arjun Kumar",
    lastContact: "2025-10-29",
  },
  {
    id: 4,
    name: "Rohan Sharma",
    course: "Data Science",
    status: "Inactive",
    counselor: "Dr. Anjali Verma",
    lastContact: "2025-10-15",
  },
  {
    id: 5,
    name: "Lisa Chen",
    course: "Digital Marketing",
    status: "Active",
    counselor: "Ms. Nisha Gupta",
    lastContact: "2025-10-29",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Pending":
      return "bg-yellow-100 text-yellow-800"
    case "Inactive":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function RecentLeadsTable() {
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
                  <TableHead className="text-xs sm:text-sm font-semibold text-foreground hidden md:table-cell">Counselor</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold text-foreground hidden lg:table-cell">Last Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsData.map((lead) => (
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
                    <TableCell className="text-sm sm:text-base py-3 sm:py-4 hidden md:table-cell">
                      <div className="max-w-[150px] truncate" title={lead.counselor}>
                        {lead.counselor}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm py-3 sm:py-4 hidden lg:table-cell">
                      {new Date(lead.lastContact).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
