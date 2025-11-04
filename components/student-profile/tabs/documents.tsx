"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, File } from "lucide-react"

interface DocumentsTabProps {
  student: {
    documents: Array<{
      id: number
      name: string
      uploadedDate: string
    }>
  }
}

export function DocumentsTab({ student }: DocumentsTabProps) {
  const [uploadedMessage, setUploadedMessage] = useState(false)

  const handleFileUpload = () => {
    setUploadedMessage(true)
    setTimeout(() => setUploadedMessage(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 shadow-lg border-2 border-dashed border-blue-300">
        <div className="text-center">
          <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 mb-4">Drag and drop your documents or click to browse</p>
          <Button onClick={handleFileUpload} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Uploaded Documents */}
      <Card className="p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Uploaded Documents</h3>
        <div className="space-y-3">
          {student.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded">
                  <File className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-600">Uploaded: {doc.uploadedDate}</p>
                </div>
              </div>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                <Download className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {uploadedMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Document uploaded successfully!
        </div>
      )}
    </div>
  )
}
