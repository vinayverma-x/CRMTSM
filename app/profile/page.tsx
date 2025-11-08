"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, setCurrentUser } from "@/lib/data/dummy-data"
import { Student } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, MapPin, GraduationCap, BookOpen, TrendingUp } from "lucide-react"

export default function StudentProfilePage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "STUDENT") {
      router.push("/dashboard")
      return
    }
    setStudent(user as Student)
  }, [router])

  if (!student) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">View your academic information and progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 border-4 border-primary/20">
                      <span className="text-3xl font-bold text-primary">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{student.name}</CardTitle>
                    <CardDescription className="mt-2">{student.rollNo}</CardDescription>
                    <Badge className="mt-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {student.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{student.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Academic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-semibold mt-1">{student.course}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold mt-1">{student.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Semester</p>
                      <p className="font-semibold mt-1">{student.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Date</p>
                      <p className="font-semibold mt-1">{student.admissionDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      CGPA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{student.cgpa?.toFixed(2) || "N/A"}</div>
                    <p className="text-sm text-muted-foreground mt-2">Current Semester</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5" />
                      Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{student.attendance || 0}%</div>
                    <p className="text-sm text-muted-foreground mt-2">This Semester</p>
                    <div className="mt-4 w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (student.attendance || 0) >= 75 ? "bg-green-500" : "bg-orange-500"
                        }`}
                        style={{ width: `${student.attendance || 0}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Information */}
              {student.fatherName && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {student.fatherName && (
                        <div>
                          <p className="text-sm text-muted-foreground">Father's Name</p>
                          <p className="font-semibold mt-1">{student.fatherName}</p>
                        </div>
                      )}
                      {student.dateOfBirth && (
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-semibold mt-1">{student.dateOfBirth}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
    </>
  )
}

