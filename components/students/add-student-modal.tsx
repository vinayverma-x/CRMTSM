"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onAddStudent: (student: any) => void
}

export function AddStudentModal({ isOpen, onClose, onAddStudent }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    course: "",
    year: "",
    semester: "",
    email: "",
    contact: "",
    admissionDate: "",
    fatherName: "",
    dateOfBirth: "",
    address: "",
    photo: "",
    password: "",
  })

  const [successMessage, setSuccessMessage] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddStudent(formData)
    setSuccessMessage(true)
    setTimeout(() => {
      setSuccessMessage(false)
      setFormData({
        name: "",
        rollNo: "",
        course: "",
        year: "",
        semester: "",
        email: "",
        contact: "",
        admissionDate: "",
        fatherName: "",
        dateOfBirth: "",
        address: "",
        photo: "",
        password: "",
      })
    }, 2000)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="rollNo">Roll No *</Label>
                <Input id="rollNo" name="rollNo" value={formData.rollNo} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="course">Course *</Label>
                <Input id="course" name="course" value={formData.course} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input id="year" name="year" value={formData.year} onChange={handleChange} required placeholder="e.g., 1st Year" />
              </div>
              <div>
                <Label htmlFor="semester">Semester *</Label>
                <Input id="semester" name="semester" value={formData.semester || ""} onChange={handleChange} required placeholder="e.g., 1st Semester" />
              </div>
              <div>
                <Label htmlFor="email">College Email *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="student@college.edu" />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Login password" />
              </div>
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" name="contact" value={formData.contact} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fatherName">Father Name</Label>
                <Input id="fatherName" name="fatherName" value={formData.fatherName} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
              </div>
              <div>
                <Label htmlFor="photo">Photo URL</Label>
                <Input id="photo" name="photo" type="url" value={formData.photo} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
              </div>
              <div>
                <Label htmlFor="admissionDate">Admission Date *</Label>
                <Input
                  id="admissionDate"
                  name="admissionDate"
                  type="date"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Add Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          Student added successfully!
        </div>
      )}
    </>
  )
}
