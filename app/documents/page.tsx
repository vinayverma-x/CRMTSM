"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, setCurrentUser } from "@/lib/data/dummy-data"
import { Student, Document } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Upload, Download, Calendar, Eye } from "lucide-react"
import { toast } from "sonner"

export default function DocumentsPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "STUDENT") {
      router.push("/dashboard")
      return
    }
    setStudent(user as Student)
  }, [router])

  useEffect(() => {
    // Fetch documents from API
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const response = await fetch("/api/documents", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setDocuments(data)
        } else {
          console.error("Failed to fetch documents")
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
      }
    }

    if (student) {
      fetchDocuments()
    }
  }, [student])

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [documentType, setDocumentType] = useState("")

  const handleUpload = () => {
    setIsUploadDialogOpen(true)
    setDocumentType("")
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!documentType) {
      toast.error("Please select a document type")
      return
    }

    setIsUploading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error("Please login again")
        return
      }

      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'document')

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        toast.error(error.error || "Failed to upload document")
        return
      }

      const uploadData = await uploadResponse.json()

      // Create document record (API will automatically associate with student)
      const documentResponse = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentType: documentType,
          documentName: file.name,
          filePath: uploadData.filePath,
          fileSize: uploadData.fileSize,
          mimeType: uploadData.mimeType,
          status: "Pending",
        }),
      })

      if (!documentResponse.ok) {
        const error = await documentResponse.json()
        toast.error(error.error || "Failed to create document record")
        return
      }

      const newDocument = await documentResponse.json()
      setDocuments([newDocument, ...documents])
      setIsUploadDialogOpen(false)
      setDocumentType("")
      toast.success("Document uploaded successfully")
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
    } finally {
      setIsUploading(false)
    }
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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Select a document file to upload</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admission Letter">Admission Letter</SelectItem>
                  <SelectItem value="ID Proof">ID Proof</SelectItem>
                  <SelectItem value="Academic Records">Academic Records</SelectItem>
                  <SelectItem value="Fee Receipt">Fee Receipt</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">PDF, Word, Excel, or Images (max 10MB)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsUploadDialogOpen(false)
              setDocumentType("")
            }} disabled={isUploading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{doc.documentType || doc.type}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">{doc.documentName || doc.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3 w-3" />
                    {doc.uploadedAt || doc.uploadedDate}
                  </CardDescription>
                  <CardDescription className="text-xs">
                    {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                  </CardDescription>
                  <CardDescription className="text-xs text-muted-foreground">
                    Type: {doc.documentType || doc.type}
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
                    {doc.filePath && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(doc.filePath, '_blank')} 
                          className="flex-1 gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = doc.filePath
                            link.download = doc.documentName || doc.name
                            link.click()
                          }} 
                          className="flex-1 gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
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

