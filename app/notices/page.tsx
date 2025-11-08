"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, dummyNotices, setCurrentUser } from "@/lib/data/dummy-data"
import { User, Notice, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle, Info, Bell, AlertTriangle, FileText, Calendar, User as UserIcon } from "lucide-react"
import { toast } from "sonner"

export default function NoticesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "ANNOUNCEMENT" as Notice["type"],
    priority: "MEDIUM" as Notice["priority"],
    targetRoles: [] as UserRole[],
  })

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    // Load notices based on user role
    const userNotices = dummyNotices.filter(
      (notice) => notice.isActive && (!notice.targetRoles || notice.targetRoles.includes(user.role))
    )
    setNotices(userNotices)
  }, [router])

  const handleCreateNotice = () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!currentUser) return

    const newNotice: Notice = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      content: formData.content,
      type: formData.type,
      priority: formData.priority,
      createdById: currentUser.id,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString().split("T")[0],
      targetRoles: formData.targetRoles.length > 0 ? formData.targetRoles : undefined,
      isActive: true,
    }

    setNotices([newNotice, ...notices])
    setIsCreateOpen(false)
    setFormData({
      title: "",
      content: "",
      type: "ANNOUNCEMENT",
      priority: "MEDIUM",
      targetRoles: [],
    })
    toast.success("Notice created successfully")
  }

  const getTypeIcon = (type: Notice["type"]) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <Bell className="h-5 w-5" />
      case "REMINDER":
        return <AlertCircle className="h-5 w-5" />
      case "ALERT":
        return <AlertTriangle className="h-5 w-5" />
      case "INFO":
        return <Info className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: Notice["type"]) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "REMINDER":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "ALERT":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "INFO":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: Notice["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "LOW":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const canCreateNotice = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN"

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notice Board</h1>
          <p className="text-muted-foreground mt-1">View and manage important announcements and notices</p>
        </div>
        {canCreateNotice && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Notice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Notice</DialogTitle>
                    <DialogDescription>Post a new announcement, reminder, or alert.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Notice title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Notice content"
                        rows={5}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value as Notice["type"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                            <SelectItem value="REMINDER">Reminder</SelectItem>
                            <SelectItem value="ALERT">Alert</SelectItem>
                            <SelectItem value="INFO">Info</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority *</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) =>
                            setFormData({ ...formData, priority: value as Notice["priority"] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Roles (Optional - Leave empty for all roles)</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["ADMIN", "COUNSELOR"] as UserRole[]).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              const newRoles = formData.targetRoles.includes(role)
                                ? formData.targetRoles.filter((r) => r !== role)
                                : [...formData.targetRoles, role]
                              setFormData({ ...formData, targetRoles: newRoles })
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              formData.targetRoles.includes(role)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {role.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateNotice}>Create Notice</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Notices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notices available</p>
              </div>
            ) : (
              notices.map((notice) => (
                <Card key={notice.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getTypeColor(notice.type)}`}>
                          {getTypeIcon(notice.type)}
                        </div>
                        <Badge className={getTypeColor(notice.type)}>{notice.type}</Badge>
                      </div>
                      <Badge className={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
                    </div>
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 whitespace-pre-wrap">{notice.content}</CardDescription>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3 w-3" />
                        <span>{notice.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{notice.createdAt}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
    </>
  )
}

