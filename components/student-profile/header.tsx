"use client"
import { Badge } from "@/components/ui/badge"

interface StudentProfileHeaderProps {
  student: {
    name: string
    rollNo: string
    course: string
    year: string
    status: string
    email: string
    contact: string
    photo: string
  }
}

export function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
  return (
    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="relative">
        <img
          src={student.photo || "/placeholder.svg"}
          alt={student.name}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{student.name}</h1>
            <div className="space-y-1 text-blue-100">
              <p className="text-lg font-medium">{student.rollNo}</p>
              <p className="text-sm">
                {student.course} - {student.year}
              </p>
            </div>
          </div>
          <Badge className="w-fit bg-green-400 text-green-900 hover:bg-green-400 text-base px-3 py-1">
            {student.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-blue-100">Email</p>
            <p className="font-medium">{student.email}</p>
          </div>
          <div>
            <p className="text-blue-100">Contact</p>
            <p className="font-medium">{student.contact}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
