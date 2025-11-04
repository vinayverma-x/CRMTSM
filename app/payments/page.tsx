"use client"

import { useState } from "react"
import { Search, Download, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [invoiceMessage, setInvoiceMessage] = useState("")

  const payments: Payment[] = [
    {
      id: 1,
      studentName: "Raj Kumar",
      course: "B.Tech Computer Science",
      pendingAmount: 0,
      lastPayment: "2024-07-15",
      status: "Paid",
      email: "raj.kumar@tsm.edu",
    },
    {
      id: 2,
      studentName: "Priya Sharma",
      course: "B.Tech Electronics",
      pendingAmount: 125000,
      lastPayment: "2024-06-20",
      status: "Pending",
      email: "priya.sharma@tsm.edu",
    },
    {
      id: 3,
      studentName: "Amit Patel",
      course: "MBA Management",
      pendingAmount: 250000,
      lastPayment: "2024-05-10",
      status: "Overdue",
      email: "amit.patel@tsm.edu",
    },
    {
      id: 4,
      studentName: "Neha Singh",
      course: "B.Tech Mechanical",
      pendingAmount: 0,
      lastPayment: "2024-07-10",
      status: "Paid",
      email: "neha.singh@tsm.edu",
    },
    {
      id: 5,
      studentName: "Vikram Das",
      course: "B.Tech Computer Science",
      pendingAmount: 75000,
      lastPayment: "2024-07-01",
      status: "Pending",
      email: "vikram.das@tsm.edu",
    },
  ]

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter === "all" || payment.course.includes(courseFilter)
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesCourse && matchesStatus
  })

  const totalFeesCollected = payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + 250000, 0)
  const totalPendingAmount = payments.reduce((sum, p) => sum + p.pendingAmount, 0)

  const handleGenerateInvoice = (studentName: string) => {
    setInvoiceMessage(`Invoice generated for ${studentName}`)
    setTimeout(() => setInvoiceMessage(""), 3000)
  }

  const handleSendReminder = (type: "email" | "whatsapp", studentName: string) => {
    setInvoiceMessage(`${type === "email" ? "Email" : "WhatsApp"} reminder sent to ${studentName}`)
    setTimeout(() => setInvoiceMessage(""), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Payments & Fees Management</h1>
          <p className="text-gray-600">Manage student fees and payment records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Total Fees Collected</p>
            <p className="text-3xl font-bold text-green-600">₹{(totalFeesCollected / 100000).toFixed(1)}L</p>
            <p className="text-xs text-gray-500 mt-2">From paid students</p>
          </Card>
          <Card className="p-6 shadow-lg border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Total Pending Amount</p>
            <p className="text-3xl font-bold text-orange-600">₹{(totalPendingAmount / 100000).toFixed(1)}L</p>
            <p className="text-xs text-gray-500 mt-2">
              From {payments.filter((p) => p.pendingAmount > 0).length} students
            </p>
          </Card>
          <Card className="p-6 shadow-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Collection Rate</p>
            <p className="text-3xl font-bold text-blue-600">
              {((totalFeesCollected / (totalFeesCollected + totalPendingAmount)) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Payment collection</p>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 border-gray-300"
              />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="Computer Science">B.Tech CS</option>
              <option value="Electronics">B.Tech Electronics</option>
              <option value="Mechanical">B.Tech Mechanical</option>
              <option value="MBA">MBA Management</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pending Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.course}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{payment.pendingAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.lastPayment}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge
                        className={
                          payment.status === "Paid"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : payment.status === "Pending"
                              ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleGenerateInvoice(payment.studentName)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendReminder("email", payment.studentName)}
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendReminder("whatsapp", payment.studentName)}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Message Toast */}
        {invoiceMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            {invoiceMessage}
          </div>
        )}
      </div>
    </div>
  )
}
