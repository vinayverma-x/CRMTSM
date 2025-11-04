"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Lead } from "@/app/leads/page"

interface AddLeadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddLead: (lead: Omit<Lead, "id">) => void
}

const courses = [
  "Computer Science",
  "Business Administration",
  "Engineering",
  "Medicine",
  "Law",
  "Architecture",
  "Arts",
  "Science",
]

const sources = ["Website", "Referral", "Social Media", "Email", "Other"]

const counselors = ["Sarah Johnson", "Michael Chen", "David Kumar", "Emma Wilson", "James Brown"]

export default function AddLeadModal({ isOpen, onOpenChange, onAddLead }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    source: "",
    email: "",
    phone: "",
    notes: "",
    assignedCounselor: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.course) newErrors.course = "Course is required"
    if (!formData.source) newErrors.source = "Source is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (formData.email && !formData.email.includes("@")) newErrors.email = "Please enter a valid email"
    if (!formData.assignedCounselor) newErrors.assignedCounselor = "Counselor assignment is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onAddLead({
      name: formData.name,
      course: formData.course,
      source: formData.source as Lead["source"],
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      assignedCounselor: formData.assignedCounselor,
      status: "New",
      lastContact: new Date().toISOString().split("T")[0],
    })

    setFormData({
      name: "",
      course: "",
      source: "",
      email: "",
      phone: "",
      notes: "",
      assignedCounselor: "",
    })
    setErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-accent transition-colors">
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Fill in the details to add a new lead to the system</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Course */}
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-foreground mb-1">
              Course <span className="text-destructive">*</span>
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            {errors.course && <p className="text-destructive text-xs mt-1">{errors.course}</p>}
          </div>

          {/* Source */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-foreground mb-1">
              Source <span className="text-destructive">*</span>
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select a source</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {errors.source && <p className="text-destructive text-xs mt-1">{errors.source}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1-555-0000"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Assigned Counselor */}
          <div>
            <label htmlFor="assignedCounselor" className="block text-sm font-medium text-foreground mb-1">
              Assigned Counselor <span className="text-destructive">*</span>
            </label>
            <select
              id="assignedCounselor"
              name="assignedCounselor"
              value={formData.assignedCounselor}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select a counselor</option>
              {counselors.map((counselor) => (
                <option key={counselor} value={counselor}>
                  {counselor}
                </option>
              ))}
            </select>
            {errors.assignedCounselor && <p className="text-destructive text-xs mt-1">{errors.assignedCounselor}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this lead..."
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-input bg-background text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Add Lead
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
