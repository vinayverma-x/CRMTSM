"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, dummySystemSettings, setCurrentUser } from "@/lib/data/dummy-data"
import { User, SystemSettings } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Lock, Mail, Settings as SettingsIcon, Building2, Key, Palette, Bell } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(dummySystemSettings)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    setProfileData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      newPassword: "",
      confirmPassword: "",
    })
  }, [router])

  const handleSystemSettingsUpdate = () => {
    toast.success("System settings updated successfully")
  }

  const handleProfileUpdate = () => {
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    toast.success("Profile updated successfully")
  }

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN"
  const isAdmin = currentUser?.role === "ADMIN"

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and system configuration</p>
      </div>

      <Tabs defaultValue={isSuperAdmin ? "system" : "profile"} className="space-y-6">
        <TabsList>
          {isSuperAdmin && (
            <>
              <TabsTrigger value="system">
                <SettingsIcon className="h-4 w-4 mr-2" />
                System Settings
              </TabsTrigger>
              <TabsTrigger value="api">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="profile">
            <Lock className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* System Settings - Super Admin Only */}
        {isSuperAdmin && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  University Information
                </CardTitle>
                <CardDescription>Update university branding and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="universityName">University Name</Label>
                  <Input
                    id="universityName"
                    value={systemSettings.universityName}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, universityName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <img src={systemSettings.logo || "/tsm-logo.png"} alt="Logo" className="max-w-full max-h-full" />
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <select
                    id="theme"
                    value={systemSettings.theme}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        theme: e.target.value as "light" | "dark" | "auto",
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <Button onClick={handleSystemSettingsUpdate}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Features
                </CardTitle>
                <CardDescription>Enable or disable system features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chatbot</Label>
                    <p className="text-sm text-muted-foreground">Enable AI chatbot feature</p>
                  </div>
                  <Switch
                    checked={systemSettings.features.chatbot}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        features: { ...systemSettings.features, chatbot: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable push notifications</p>
                  </div>
                  <Switch
                    checked={systemSettings.features.notifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        features: { ...systemSettings.features, notifications: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reports</Label>
                    <p className="text-sm text-muted-foreground">Enable reporting features</p>
                  </div>
                  <Switch
                    checked={systemSettings.features.reports}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        features: { ...systemSettings.features, reports: checked },
                      })
                    }
                  />
                </div>
                <Button onClick={handleSystemSettingsUpdate}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* API Keys - Super Admin Only */}
        {isSuperAdmin && (
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys & Integrations
                </CardTitle>
                <CardDescription>Manage API keys for external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Email API</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="emailKey">Email API Key</Label>
                    <Input
                      id="emailKey"
                      type="password"
                      value={systemSettings.apiKeys?.email || "••••••••"}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          apiKeys: { ...systemSettings.apiKeys, email: e.target.value },
                        })
                      }
                      placeholder="Enter email API key"
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">SMS API</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="smsKey">SMS API Key</Label>
                    <Input
                      id="smsKey"
                      type="password"
                      value={systemSettings.apiKeys?.sms || "••••••••"}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          apiKeys: { ...systemSettings.apiKeys, sms: e.target.value },
                        })
                      }
                      placeholder="Enter SMS API key"
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Payment API</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="paymentKey">Payment API Key</Label>
                    <Input
                      id="paymentKey"
                      type="password"
                      value={systemSettings.apiKeys?.payment || "••••••••"}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          apiKeys: { ...systemSettings.apiKeys, payment: e.target.value },
                        })
                      }
                      placeholder="Enter payment API key"
                    />
                  </div>
                </div>

                <Button onClick={handleSystemSettingsUpdate}>Save API Keys</Button>
              </CardContent>
            </Card>

            {/* API Access Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Access & Webhooks
                </CardTitle>
                <CardDescription>Manage API access and webhook integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>API Base URL</Label>
                    <Input value="https://api.tsm-crm.university/v1" readOnly className="mt-1 font-mono text-sm" />
                    <p className="text-xs text-muted-foreground mt-1">Use this URL for all API requests</p>
                  </div>

                  <div>
                    <Label>API Access Token</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value="tsm_crm_••••••••••••••••" readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="sm">Generate New</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Keep this token secure. It provides full API access.</p>
                  </div>

                  <div>
                    <Label>Webhook URL</Label>
                    <Input
                      placeholder="https://your-webhook-url.com/webhook"
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Receive real-time updates via webhooks</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Supported Integrations</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2 p-2 border border-border rounded">
                        <span className="text-sm">Google Sheets</span>
                        <Badge variant="outline" className="ml-auto">Enabled</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 border border-border rounded">
                        <span className="text-sm">Zapier</span>
                        <Badge variant="outline" className="ml-auto">Enabled</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 border border-border rounded">
                        <span className="text-sm">HubSpot</span>
                        <Badge variant="outline" className="ml-auto">Available</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 border border-border rounded">
                        <span className="text-sm">Slack</span>
                        <Badge variant="outline" className="ml-auto">Available</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Rate Limits</Label>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Requests per minute:</span>
                        <span className="font-medium">100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Requests per hour:</span>
                        <span className="font-medium">5,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Requests per day:</span>
                        <span className="font-medium">50,000</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSystemSettingsUpdate}>Save API Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Profile Settings - All Users */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-2 border-border flex items-center justify-center bg-muted">
                  <span className="text-2xl font-bold text-primary">
                    {currentUser?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U"}
                  </span>
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Change Photo
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <Button onClick={handleProfileUpdate}>Update Profile</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleProfileUpdate}>Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
