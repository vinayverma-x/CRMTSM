"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { StudentTable } from "@/components/students/student-table"
import { AddStudentModal } from "@/components/students/add-student-modal"

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Raj Kumar",
      rollNo: "STU001",
      course: "B.Tech Computer Science",
      year: "3rd Year",
      status: "Active",
      email: "raj.kumar@tsm.edu",
      contact: "+91-9876543210",
      admissionDate: "2022-07-15",
    },
    {
      id: 2,
      name: "Priya Sharma",
      rollNo: "STU002",
      course: "B.Tech Electronics",
      year: "2nd Year",
      status: "Active",
      email: "priya.sharma@tsm.edu",
      contact: "+91-9876543211",
      admissionDate: "2023-07-10",
    },
    {
      id: 3,
      name: "Amit Patel",
      rollNo: "STU003",
      course: "B.Tech Mechanical",
      year: "4th Year",
      status: "Alumni",
      email: "amit.patel@tsm.edu",
      contact: "+91-9876543212",
      admissionDate: "2021-07-20",
    },
    {
      id: 4,
      name: "Neha Singh",
      rollNo: "STU004",
      course: "MBA Management",
      year: "1st Year",
      status: "Active",
      email: "neha.singh@tsm.edu",
      contact: "+91-9876543213",
      admissionDate: "2024-08-01",
    },
  ])

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddStudent = (newStudent: any) => {
    const student = {
      ...newStudent,
      id: students.length + 1,
      status: "Active",
    }
    setStudents([...students, student])
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Student Management</h1>
          <p className="text-gray-600">Manage and view all students in the system</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, roll no, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </Button>
        </div>

        {/* Students Table */}
        <Card className="shadow-lg border-0">
          <StudentTable students={filteredStudents} />
        </Card>

        {/* Add Student Modal */}
        <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddStudent={handleAddStudent} />
      </div>
    </div>
  )
}
