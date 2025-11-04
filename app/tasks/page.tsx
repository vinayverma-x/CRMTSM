"use client"

import { useState } from "react"
import { Plus, CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddTaskModal } from "@/components/tasks/add-task-modal"

interface Task {
  id: number
  title: string
  description: string
  assignedTo: string
  dueDate: string
  status: "Pending" | "Complete"
}

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Follow up with Raj Kumar",
      description: "Schedule admission counseling session",
      assignedTo: "Priya Counselor",
      dueDate: "2024-11-08",
      status: "Pending",
    },
    {
      id: 2,
      title: "Process Priya Sharma's admission",
      description: "Complete documentation and fee collection",
      assignedTo: "Amit Counselor",
      dueDate: "2024-11-05",
      status: "Pending",
    },
    {
      id: 3,
      title: "Send course brochures",
      description: "Email course details to prospective students",
      assignedTo: "Neha Staff",
      dueDate: "2024-11-20",
      status: "Pending",
    },
    {
      id: 4,
      title: "Update student records",
      description: "Upload attendance sheets for Semester 3",
      assignedTo: "Vikram Admin",
      dueDate: "2024-10-31",
      status: "Complete",
    },
    {
      id: 5,
      title: "Contact alumni for feedback",
      description: "Collect feedback for course improvement",
      assignedTo: "Priya Counselor",
      dueDate: "2024-11-03",
      status: "Pending",
    },
  ])

  const [completionMessage, setCompletionMessage] = useState("")

  const getTaskColor = (dueDate: string, status: string) => {
    if (status === "Complete") return "bg-gray-50"

    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "bg-red-50 border-l-4 border-red-500" // Overdue
    if (diffDays <= 2) return "bg-yellow-50 border-l-4 border-yellow-500" // Due soon
    return "bg-white"
  }

  const toggleTaskStatus = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: task.status === "Pending" ? "Complete" : "Pending" } : task,
      ),
    )
    const task = tasks.find((t) => t.id === id)
    setCompletionMessage(`Task marked as ${task?.status === "Pending" ? "Complete" : "Pending"}!`)
    setTimeout(() => setCompletionMessage(""), 2000)
  }

  const handleAddTask = (newTask: any) => {
    setTasks([
      ...tasks,
      {
        ...newTask,
        id: tasks.length + 1,
        status: "Pending",
      },
    ])
    setIsModalOpen(false)
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "Pending" ? -1 : 1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Tasks & Reminders</h1>
            <p className="text-gray-600">Manage counselor tasks and important reminders</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 shadow-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
          </Card>
          <Card className="p-4 shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{tasks.filter((t) => t.status === "Pending").length}</p>
          </Card>
          <Card className="p-4 shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{tasks.filter((t) => t.status === "Complete").length}</p>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const today = new Date()
            const due = new Date(task.dueDate)
            const diffTime = due.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            const isOverdue = diffDays < 0 && task.status === "Pending"
            const isDueSoon = diffDays >= 0 && diffDays <= 2 && task.status === "Pending"

            return (
              <Card
                key={task.id}
                className={`p-6 shadow-lg transition-all hover:shadow-xl ${getTaskColor(task.dueDate, task.status)}`}
              >
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleTaskStatus(task.id)} className="mt-1 flex-shrink-0 focus:outline-none">
                    {task.status === "Complete" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className={`text-lg font-semibold ${
                          task.status === "Complete" ? "text-gray-500 line-through" : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {isOverdue && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </Badge>
                      )}
                      {isDueSoon && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        <span className="font-medium">Assigned to:</span> {task.assignedTo}
                      </span>
                      <span>
                        <span className="font-medium">Due:</span> {task.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Badge
                      className={
                        task.status === "Complete"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Add Task Modal */}
        <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={handleAddTask} />

        {/* Notification Toast */}
        {completionMessage && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            {completionMessage}
          </div>
        )}
      </div>
    </div>
  )
}
