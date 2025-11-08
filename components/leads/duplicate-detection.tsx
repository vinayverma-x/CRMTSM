"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, Check } from "lucide-react"
import { Lead } from "@/lib/types"
import { toast } from "sonner"

interface DuplicateDetectionProps {
  lead: Lead
  allLeads: Lead[]
  onMerge?: (leadId: string, duplicateId: string) => void
  onDismiss?: (leadId: string) => void
}

export default function DuplicateDetection({ lead, allLeads, onMerge, onDismiss }: DuplicateDetectionProps) {
  // Find potential duplicates based on email, phone, or name similarity
  const findDuplicates = () => {
    return allLeads.filter((l) => {
      if (l.id === lead.id) return false

      // Check email match
      if (lead.email && l.email && lead.email.toLowerCase() === l.email.toLowerCase()) {
        return true
      }

      // Check phone match
      if (lead.phone && l.phone && lead.phone.replace(/\D/g, "") === l.phone.replace(/\D/g, "")) {
        return true
      }

      // Check name similarity (simple check)
      if (lead.name && l.name) {
        const name1 = lead.name.toLowerCase().split(" ")
        const name2 = l.name.toLowerCase().split(" ")
        const similarity = name1.filter((n) => name2.includes(n)).length / Math.max(name1.length, name2.length)
        if (similarity >= 0.7) {
          return true
        }
      }

      return false
    })
  }

  const duplicates = findDuplicates()

  if (duplicates.length === 0) {
    return null
  }

  const handleMerge = (duplicateId: string) => {
    if (onMerge) {
      onMerge(lead.id, duplicateId)
      toast.success("Leads merged successfully")
    }
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(lead.id)
      toast.info("Duplicate warning dismissed")
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-900 dark:text-orange-100">Potential Duplicate Detected</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-orange-800 dark:text-orange-200">
          Found {duplicates.length} potential duplicate{duplicates.length > 1 ? "s" : ""} based on similar information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {duplicates.map((duplicate) => (
            <div
              key={duplicate.id}
              className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{duplicate.name}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {duplicate.email && <span>📧 {duplicate.email}</span>}
                  {duplicate.phone && <span>📞 {duplicate.phone}</span>}
                  <Badge variant="outline" className="text-xs">
                    {duplicate.status}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMerge(duplicate.id)}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Merge
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          💡 Tip: Review duplicates carefully before merging to avoid data loss
        </p>
      </CardContent>
    </Card>
  )
}

