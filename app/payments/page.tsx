"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, setCurrentUser } from "@/lib/data/dummy-data"
import { Student, User } from "@/lib/types"
import { Search, Download, Mail, MessageCircle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface Payment {
  id: number
  studentName: string
  course: string
  pendingAmount: number
  lastPayment: string
  status: "Paid" | "Pending" | "Overdue"
  email: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    // Students and Admins can access, but Super Admin and Counselors cannot
    if (user.role === "COUNSELOR") {
      router.push("/dashboard")
    }
  }, [router])

  const allPayments: Payment[] = [
    {
      id: 1,
      studentName: "Raj Kumar",
      course: "B.Tech Computer Science",
      pendingAmount: 250000,
      lastPayment: "2024-07-15",
      status: "Pending",
      email: "raj.kumar@tsm.university",
    },
    {
      id: 2,
      studentName: "Priya Sharma",
      course: "B.Tech Business Administration",
      pendingAmount: 125000,
      lastPayment: "2024-06-20",
      status: "Pending",
      email: "priya.sharma@tsm.university",
    },
    {
      id: 3,
      studentName: "Amit Patel",
      course: "B.Tech Engineering",
      pendingAmount: 0,
      lastPayment: "2024-08-01",
      status: "Paid",
      email: "amit.patel@tsm.university",
    },
  ]

  // Filter payments based on user role
  const payments =
    currentUser?.role === "STUDENT"
      ? allPayments.filter((p) => p.email === currentUser.email)
      : allPayments

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter === "all" || payment.course.includes(courseFilter)
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesCourse && matchesStatus
  })

  const totalFeesCollected = payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + 250000, 0)
  const totalPendingAmount = payments.reduce((sum, p) => sum + p.pendingAmount, 0)

  const handlePayNow = (payment: Payment) => {
    toast.info(`Processing payment for ${payment.studentName}...`)
  }

  const handleGenerateInvoice = (studentName: string) => {
    toast.success(`Invoice generated for ${studentName}`)
  }

  const handleSendReminder = (type: "email" | "whatsapp", studentName: string) => {
    toast.success(`${type === "email" ? "Email" : "WhatsApp"} reminder sent to ${studentName}`)
  }

  const isStudent = currentUser?.role === "STUDENT"

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isStudent ? "My Payments" : "Payments & Fees Management"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isStudent ? "View and pay your fees" : "Manage student fees and payment records"}
        </p>
      </div>

      {/* Summary Cards */}
      {isStudent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                ₹{payments.reduce((sum, p) => sum + p.pendingAmount, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total amount due</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {payments.length > 0 ? payments[0].lastPayment : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Most recent payment date</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ₹{(payments.filter((p) => p.status === "Paid").length * 250000).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">From paid students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                ₹{payments.reduce((sum, p) => sum + p.pendingAmount, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                From {payments.filter((p) => p.pendingAmount > 0).length} students
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {payments.filter((p) => p.status === "Paid").length}/{payments.length}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Students paid</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search - Only for Admin/Super Admin */}
      {!isStudent && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-4 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Courses</option>
                <option value="Computer Science">B.Tech CS</option>
                <option value="Business Administration">B.Tech Business</option>
                <option value="Engineering">B.Tech Engineering</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
            <CardHeader>
              <CardTitle>{isStudent ? "My Payment History" : "Payment Records"}</CardTitle>
              <CardDescription>
                {isStudent ? "View your payment history and pending fees" : "Manage all student payments"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isStudent && <TableHead>Student Name</TableHead>}
                    <TableHead>Course</TableHead>
                    <TableHead>Pending Amount</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isStudent ? 5 : 6} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        {!isStudent && <TableCell className="font-medium">{payment.studentName}</TableCell>}
                        <TableCell>{payment.course}</TableCell>
                        <TableCell className="font-semibold">₹{payment.pendingAmount.toLocaleString()}</TableCell>
                        <TableCell>{payment.lastPayment}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.status === "Paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : payment.status === "Pending"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {isStudent && payment.pendingAmount > 0 ? (
                              <Button size="sm" onClick={() => handlePayNow(payment)} className="gap-2">
                                <CreditCard className="w-4 h-4" />
                                Pay Now
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleGenerateInvoice(payment.studentName)}
                                  className="gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                {!isStudent && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSendReminder("email", payment.studentName)}
                                      className="gap-2"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSendReminder("whatsapp", payment.studentName)}
                                      className="gap-2"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
    </>
  )
}
