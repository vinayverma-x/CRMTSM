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
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
        <CardDescription>Latest leads and their enrollment status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Counselor</TableHead>
                <TableHead>Last Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsData.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.course}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>{lead.counselor}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(lead.lastContact).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
