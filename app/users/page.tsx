"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/data/dummy-data"
import { User, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Shield, Mail, Phone, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function UsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "COUNSELOR" as UserRole,
    phone: "",
  })

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    // Check if user is Super Admin
    if (user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard")
      return
    }

    // Load all users from API
    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error("Please login again")
        router.push("/")
        return
      }
      const response = await fetch("/api/users", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched users:", data)
        const currentUser = getCurrentUser()
        // Filter out current user
        const filteredUsers = data.filter((u: User) => u.id !== currentUser?.id)
        console.log("Filtered users:", filteredUsers)
        setUsers(filteredUsers)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error("Error response:", response.status, errorData)
        if (response.status === 401 || response.status === 403) {
          toast.error(errorData.error || "Unauthorized. Please login again.")
          // Redirect to login
          router.push("/")
        } else {
          toast.error(errorData.error || "Failed to load users")
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    }
  }

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || undefined,
          createdById: currentUser?.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to create user")
        return
      }

      const newUser = await response.json()
      setUsers([...users, newUser])
      setIsCreateOpen(false)
      setFormData({ name: "", email: "", role: "COUNSELOR", phone: "" })
      toast.success(`${formData.role === "ADMIN" ? "Admin" : "Counselor"} created successfully`)
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Failed to create user")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
    })
    setIsEditOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to update user")
        return
      }

      const updatedUser = await response.json()
      setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)))
      setIsEditOpen(false)
      setEditingUser(null)
      setFormData({ name: "", email: "", role: "COUNSELOR", phone: "" })
      toast.success("User updated successfully")
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch(`/api/users/${user.id}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || "Failed to delete user")
          return
        }

        setUsers(users.filter((u) => u.id !== user.id))
        toast.success("User deleted successfully")
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error("Failed to delete user")
      }
    }
  }

  const handleStatusToggle = async (user: User) => {
    try {
      const token = localStorage.getItem('authToken')
      const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to update user status")
        return
      }

      const updatedUser = await response.json()
      setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)))
      toast.success(`User ${user.status === "ACTIVE" ? "suspended" : "activated"}`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "COUNSELOR":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "SUSPENDED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (currentUser?.role !== "SUPER_ADMIN") {
    return null
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage Admin and Counselor accounts</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new Admin or Counselor to the system.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@tsm.university"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="COUNSELOR">Counselor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1-555-0100"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter((u) => u.role === "ADMIN").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Counselors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.role === "COUNSELOR").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter((u) => u.status === "ACTIVE").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all Admin and Counselor accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {user.createdAt}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {user.lastLogin}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusToggle(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user information.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="COUNSELOR">Counselor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone (Optional)</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>Update User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </>
  )
}

