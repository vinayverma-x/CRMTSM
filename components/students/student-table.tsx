"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Student {
  id: number
  name: string
  rollNo: string
  course: string
  year: string
  status: "Active" | "Alumni"
  email: string
  contact: string
  admissionDate: string
}

export function StudentTable({ students }: { students: Student[] }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roll No</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Course</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Year</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.rollNo}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.course}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.year}</td>
              <td className="px-6 py-4 text-sm">
                <Badge
                  className={
                    student.status === "Active"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                >
                  {student.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Link href={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  View Profile
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
