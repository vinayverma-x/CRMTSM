"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { StudentTable } from "@/components/students/student-table"
import { AddStudentModal } from "@/components/students/add-student-modal"
import { toast } from "sonner"
import { Student } from "@/lib/types"

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      } else {
        toast.error("Failed to load students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to load students")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddStudent = async (newStudent: any) => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email,
          phone: newStudent.contact,
          rollNo: newStudent.rollNo,
          course: newStudent.course,
          year: newStudent.year,
          semester: newStudent.semester || "1st Semester",
          admissionDate: newStudent.admissionDate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to create student")
        return
      }

      const createdStudent = await response.json()
      setStudents([...students, createdStudent])
      setIsModalOpen(false)
      toast.success("Student added successfully!")
    } catch (error) {
      console.error("Error creating student:", error)
      toast.error("Failed to create student")
    }
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
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading students...</div>
          ) : (
            <StudentTable students={filteredStudents} />
          )}
        </Card>

        {/* Add Student Modal */}
        <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddStudent={handleAddStudent} />
      </div>
    </div>
  )
}
