"use client"

import { Card } from "@/components/ui/card"

interface AcademicInfoTabProps {
  student: {
    course: string
    year: string
    attendance: number
    totalSemesters: number
    cgpa: number
  }
}

export function AcademicInfoTab({ student }: AcademicInfoTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Academic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Course</p>
            <p className="text-2xl font-bold text-blue-600">{student.course}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Current Year</p>
            <p className="text-2xl font-bold text-blue-600">{student.year}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Attendance</p>
            <p className="text-2xl font-bold text-green-600">{student.attendance}%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">CGPA</p>
            <p className="text-2xl font-bold text-purple-600">{student.cgpa}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Semester Progress</h3>
        <div className="space-y-3">
          {Array.from({ length: student.totalSemesters }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Semester {i + 1}</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${80 + Math.random() * 20}%` }} />
              </div>
              <span className="text-sm font-semibold text-gray-700 w-8">100%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
