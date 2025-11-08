"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, dummyAutoAssignmentRules, getCounselors } from "@/lib/data/dummy-data"
import { User, AutoAssignmentRule } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, MapPin, Building2, Users, Target } from "lucide-react"
import { toast } from "sonner"

export default function AutoAssignmentPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [rules, setRules] = useState<AutoAssignmentRule[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutoAssignmentRule | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    region: [] as string[],
    department: [] as string[],
    source: [] as string[],
    course: [] as string[],
    assignedCounselorId: "",
    priority: 1,
    isActive: true,
  })

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    setRules(dummyAutoAssignmentRules)
  }, [router])

  const counselors = getCounselors()

  const regions = ["North", "South", "East", "West", "Central"]
  const departments = ["Technology", "Business", "Engineering", "Medicine", "Law", "Arts"]
  const sources = ["Website", "Referral", "Social Media", "Email", "Walk-in", "Other"]
  const courses = [
    "Computer Science",
    "Data Science",
    "Business Administration",
    "Engineering",
    "Medicine",
    "Law",
  ]

  const handleCreateRule = () => {
    if (!formData.name || !formData.assignedCounselorId) {
      toast.error("Please fill in all required fields")
      return
    }

    const counselor = counselors.find((c) => c.id === formData.assignedCounselorId)
    const newRule: AutoAssignmentRule = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      criteria: {
        region: formData.region.length > 0 ? formData.region : undefined,
        department: formData.department.length > 0 ? formData.department : undefined,
        source: formData.source.length > 0 ? formData.source : undefined,
        course: formData.course.length > 0 ? formData.course : undefined,
      },
      assignedCounselorId: formData.assignedCounselorId,
      assignedCounselor: counselor?.name || "",
      priority: formData.priority,
      isActive: formData.isActive,
    }

    setRules([...rules, newRule])
    setIsCreateOpen(false)
    resetForm()
    toast.success("Auto assignment rule created successfully")
  }

  const handleEditRule = (rule: AutoAssignmentRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      region: rule.criteria.region || [],
      department: rule.criteria.department || [],
      source: rule.criteria.source || [],
      course: rule.criteria.course || [],
      assignedCounselorId: rule.assignedCounselorId,
      priority: rule.priority,
      isActive: rule.isActive,
    })
    setIsEditOpen(true)
  }

  const handleUpdateRule = () => {
    if (!editingRule || !formData.name || !formData.assignedCounselorId) {
      toast.error("Please fill in all required fields")
      return
    }

    const counselor = counselors.find((c) => c.id === formData.assignedCounselorId)
    const updatedRules = rules.map((rule) =>
      rule.id === editingRule.id
        ? {
            ...rule,
            name: formData.name,
            criteria: {
              region: formData.region.length > 0 ? formData.region : undefined,
              department: formData.department.length > 0 ? formData.department : undefined,
              source: formData.source.length > 0 ? formData.source : undefined,
              course: formData.course.length > 0 ? formData.course : undefined,
            },
            assignedCounselorId: formData.assignedCounselorId,
            assignedCounselor: counselor?.name || "",
            priority: formData.priority,
            isActive: formData.isActive,
          }
        : rule
    )

    setRules(updatedRules)
    setIsEditOpen(false)
    setEditingRule(null)
    resetForm()
    toast.success("Rule updated successfully")
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter((rule) => rule.id !== ruleId))
    toast.success("Rule deleted successfully")
  }

  const handleToggleActive = (ruleId: string) => {
    setRules(rules.map((rule) => (rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule)))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      region: [],
      department: [],
      source: [],
      course: [],
      assignedCounselorId: "",
      priority: 1,
      isActive: true,
    })
  }

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
  }

  if (!currentUser || (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "ADMIN")) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auto Assignment Rules</h1>
          <p className="text-muted-foreground mt-1">Automatically assign leads to counselors based on criteria</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Auto Assignment Rule</DialogTitle>
              <DialogDescription>Set up criteria to automatically assign leads to counselors</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., North Region - Technology"
                />
              </div>

              <div className="space-y-2">
                <Label>Regions</Label>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <Button
                      key={region}
                      type="button"
                      variant={formData.region.includes(region) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, region: toggleArrayItem(formData.region, region) })}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {region}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Departments</Label>
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <Button
                      key={dept}
                      type="button"
                      variant={formData.department.includes(dept) ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, department: toggleArrayItem(formData.department, dept) })
                      }
                    >
                      <Building2 className="w-3 h-3 mr-1" />
                      {dept}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sources</Label>
                <div className="flex flex-wrap gap-2">
                  {sources.map((src) => (
                    <Button
                      key={src}
                      type="button"
                      variant={formData.source.includes(src) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, source: toggleArrayItem(formData.source, src) })}
                    >
                      {src}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Courses</Label>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course) => (
                    <Button
                      key={course}
                      type="button"
                      variant={formData.course.includes(course) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, course: toggleArrayItem(formData.course, course) })}
                    >
                      {course}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="counselor">Assign to Counselor *</Label>
                <select
                  id="counselor"
                  value={formData.assignedCounselorId}
                  onChange={(e) => setFormData({ ...formData, assignedCounselorId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select Counselor</option>
                  {counselors.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground">Higher priority rules are evaluated first</p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">Priority: {rule.priority}</Badge>
                  </div>
                  <CardDescription>Assigned to: {rule.assignedCounselor}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.isActive} onCheckedChange={() => handleToggleActive(rule.id)} />
                  <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rule.criteria.region && rule.criteria.region.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Regions</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.criteria.region.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {rule.criteria.department && rule.criteria.department.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Departments</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.criteria.department.map((d) => (
                        <Badge key={d} variant="outline" className="text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {rule.criteria.source && rule.criteria.source.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Sources</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.criteria.source.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {rule.criteria.course && rule.criteria.course.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Courses</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.criteria.course.map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Auto Assignment Rule</DialogTitle>
            <DialogDescription>Update the criteria for automatic lead assignment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Rule Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Regions</Label>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <Button
                    key={region}
                    type="button"
                    variant={formData.region.includes(region) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, region: toggleArrayItem(formData.region, region) })}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {region}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Departments</Label>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    type="button"
                    variant={formData.department.includes(dept) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFormData({ ...formData, department: toggleArrayItem(formData.department, dept) })
                    }
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    {dept}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-counselor">Assign to Counselor *</Label>
              <select
                id="edit-counselor"
                value={formData.assignedCounselorId}
                onChange={(e) => setFormData({ ...formData, assignedCounselorId: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select Counselor</option>
                {counselors.map((counselor) => (
                  <option key={counselor.id} value={counselor.id}>
                    {counselor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Input
                id="edit-priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active</Label>
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRule}>Update Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

