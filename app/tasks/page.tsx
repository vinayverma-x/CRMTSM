"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, CheckCircle2, Circle, AlertCircle, Clock, Calendar, Bell, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AddTaskModal } from "@/components/tasks/add-task-modal"
import { getCurrentUser, dummyTasks, setCurrentUser } from "@/lib/data/dummy-data"
import { User, Task } from "@/lib/types"
import { toast } from "sonner"

export default function TasksPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterStatus, setFilterStatus] = useState<"all" | Task["status"]>("all")
  const [filterPriority, setFilterPriority] = useState<"all" | Task["priority"]>("all")

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    // Load tasks based on user role
    let userTasks = dummyTasks
    if (user.role === "COUNSELOR") {
      userTasks = dummyTasks.filter((task) => task.assignedToId === user.id)
    }
    setTasks(userTasks)
  }, [router])

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "LOW":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTaskColor = (dueDate: string, status: Task["status"]) => {
    if (status === "COMPLETED") return "bg-gray-50"

    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "bg-red-50 border-l-4 border-red-500" // Overdue
    if (diffDays <= 2) return "bg-yellow-50 border-l-4 border-yellow-500" // Due soon
    return "bg-white"
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status:
                task.status === "PENDING"
                  ? "COMPLETED"
                  : task.status === "COMPLETED"
                    ? "IN_PROGRESS"
                    : "PENDING",
            }
          : task
      )
    )
    const task = tasks.find((t) => t.id === taskId)
    toast.success(`Task marked as ${task?.status === "PENDING" ? "Completed" : "Pending"}!`)
  }

  const toggleAutoReminder = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, autoReminder: !task.autoReminder } : task
      )
    )
    toast.success("Auto reminder setting updated")
  }

  const toggleCalendarSync = (taskId: string, syncType: "google" | "outlook" | "none") => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, calendarSync: syncType } : task
      )
    )
    toast.success(`Calendar sync ${syncType === "none" ? "disabled" : `set to ${syncType}`}`)
  }

  const handleAddTask = (newTask: any) => {
    if (!currentUser) return

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description || "",
      status: "PENDING",
      priority: newTask.priority || "MEDIUM",
      assignedToId: newTask.assignedToId || currentUser.id,
      assignedTo: newTask.assignedTo || currentUser.name,
      createdById: currentUser.id,
      dueDate: newTask.dueDate,
      relatedLeadId: newTask.relatedLeadId,
      relatedStudentId: newTask.relatedStudentId,
      autoReminder: newTask.autoReminder || false,
      calendarSync: newTask.calendarSync || "none",
      tags: newTask.tags || [],
    }

    setTasks([...tasks, task])
    setIsModalOpen(false)
    toast.success("Task created successfully")
  }

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    // Then by status
    if (a.status !== b.status) {
      const statusOrder = { PENDING: 0, IN_PROGRESS: 1, COMPLETED: 2, CANCELLED: 3 }
      return statusOrder[a.status] - statusOrder[b.status]
    }
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  if (!currentUser) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks & Reminders</h1>
          <p className="text-muted-foreground mt-1">Manage tasks with smart automation and reminders</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold text-primary">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              {tasks.filter((t) => t.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {tasks.filter((t) => t.status === "IN_PROGRESS").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {tasks.filter((t) => t.status === "COMPLETED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Filter by Status</Label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | Task["status"])}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex-1">
              <Label>Filter by Priority</Label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as "all" | Task["priority"])}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => {
            const today = new Date()
            const due = new Date(task.dueDate)
            const diffTime = due.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            const isOverdue = diffDays < 0 && task.status !== "COMPLETED"
            const isDueSoon = diffDays >= 0 && diffDays <= 2 && task.status !== "COMPLETED"

            return (
              <Card
                key={task.id}
                className={`transition-all hover:shadow-lg ${getTaskColor(task.dueDate, task.status)}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-1 flex-shrink-0 focus:outline-none"
                    >
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3
                          className={`text-lg font-semibold ${
                            task.status === "COMPLETED" ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          <Tag className="w-3 h-3 mr-1" />
                          {task.priority}
                        </Badge>
                        {isOverdue && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </Badge>
                        )}
                        {isDueSoon && !isOverdue && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span>
                          <span className="font-medium">Assigned to:</span> {task.assignedTo}
                        </span>
                        <span>
                          <span className="font-medium">Due:</span> {task.dueDate}
                        </span>
                      </div>

                      {/* Automation Features */}
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={task.autoReminder || false}
                            onCheckedChange={() => toggleAutoReminder(task.id)}
                            id={`reminder-${task.id}`}
                          />
                          <Label htmlFor={`reminder-${task.id}`} className="text-sm flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            Auto Reminder
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Calendar:
                          </Label>
                          <select
                            value={task.calendarSync || "none"}
                            onChange={(e) =>
                              toggleCalendarSync(task.id, e.target.value as "google" | "outlook" | "none")
                            }
                            className="text-xs px-2 py-1 border border-input rounded bg-background"
                          >
                            <option value="none">None</option>
                            <option value="google">Google</option>
                            <option value="outlook">Outlook</option>
                          </select>
                        </div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {task.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Badge
                        className={
                          task.status === "COMPLETED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : task.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        }
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={handleAddTask} />
    </>
  )
}
