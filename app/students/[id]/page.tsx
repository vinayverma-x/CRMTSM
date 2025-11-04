"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StudentProfileHeader } from "@/components/student-profile/header"
import { StudentProfileTabs } from "@/components/student-profile/tabs"

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  const student = {
    id: Number.parseInt(params.id),
    name: "Raj Kumar",
    rollNo: "STU001",
    course: "B.Tech Computer Science",
    year: "3rd Year",
    status: "Active",
    email: "raj.kumar@tsm.edu",
    contact: "+91-9876543210",
    admissionDate: "2022-07-15",
    photo: "/student-profile.png",
    fatherName: "Ramesh Kumar",
    dateOfBirth: "2002-05-15",
    address: "123 Main Street, Delhi, India",
    attendance: 92,
    totalSemesters: 5,
    cgpa: 8.4,
    documents: [
      { id: 1, name: "Admission Letter", uploadedDate: "2022-07-15" },
      { id: 2, name: "ID Proof", uploadedDate: "2022-07-15" },
      { id: 3, name: "Academic Records", uploadedDate: "2023-12-01" },
    ],
    paymentHistory: [
      { id: 1, amount: 250000, date: "2024-01-15", status: "Paid", semester: "Semester 1" },
      { id: 2, amount: 250000, date: "2024-06-20", status: "Paid", semester: "Semester 2" },
      { id: 3, amount: 250000, date: "2024-07-10", status: "Pending", semester: "Semester 3" },
    ],
    pendingDues: 250000,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/students">
          <Button variant="ghost" className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Student List
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <StudentProfileHeader student={student} />
        </Card>

        {/* Tabs */}
        <StudentProfileTabs student={student} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}
