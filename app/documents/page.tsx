"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, setCurrentUser, dummyDocuments } from "@/lib/data/dummy-data"
import { Student, Document } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download, Calendar, Eye } from "lucide-react"
import { toast } from "sonner"

export default function DocumentsPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    // Load student documents
    if (student) {
      const studentDocs = dummyDocuments.filter((doc) => doc.studentId === student.id)
      setDocuments(studentDocs)
    }
  }, [student])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "STUDENT") {
      router.push("/dashboard")
      return
    }
    setStudent(user as Student)
  }, [router])

  const handleUpload = () => {
    toast.info("Document upload feature coming soon")
  }

  const handleDownload = (doc: any) => {
    toast.info(`Downloading ${doc.name}...`)
  }

  const handleView = (doc: any) => {
    toast.info(`Viewing ${doc.name}...`)
  }

  if (!student) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">View and manage your documents</p>
        </div>
        <Button onClick={handleUpload} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">{doc.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3 w-3" />
                    {doc.uploadedDate}
                  </CardDescription>
                  <CardDescription className="text-xs">
                    {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <Badge
                      className={
                        doc.status === "Approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : doc.status === "Pending"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }
                    >
                      {doc.status}
                    </Badge>
                    {doc.approvedBy && (
                      <p className="text-xs text-muted-foreground mt-1">Approved by: {doc.approvedBy}</p>
                    )}
                    {doc.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {doc.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(doc)} className="flex-1 gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)} className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {documents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
                <Button onClick={handleUpload} className="mt-4 gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Your First Document
                </Button>
              </CardContent>
        </Card>
      )}
    </>
  )
}

