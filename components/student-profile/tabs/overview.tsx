"use client"

import { Card } from "@/components/ui/card"

interface OverviewTabProps {
  student: {
    name: string
    fatherName: string
    dateOfBirth: string
    address: string
    admissionDate: string
    course: string
  }
}

export function OverviewTab({ student }: OverviewTabProps) {
  return (
    <Card className="p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-gray-600 mb-1">Father's Name</p>
          <p className="font-medium text-gray-900">{student.fatherName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
          <p className="font-medium text-gray-900">{student.dateOfBirth}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-600 mb-1">Address</p>
          <p className="font-medium text-gray-900">{student.address}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Admission Date</p>
          <p className="font-medium text-gray-900">{student.admissionDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Course</p>
          <p className="font-medium text-gray-900">{student.course}</p>
        </div>
      </div>
    </Card>
  )
}
