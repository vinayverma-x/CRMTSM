"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Lock, Mail, MessageSquare } from "lucide-react"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("institute")
  const [saveMessage, setSaveMessage] = useState("")
  const [formData, setFormData] = useState({
    instituteName: "T.S. Mishra University",
    address: "123 University Road, Delhi, India",
    phone: "+91-11-12345678",
    email: "admin@tsm.edu",
    emailApi: "sendgrid",
    emailApiKey: "••••••••••••••••",
    whatsappApi: "twilio",
    whatsappApiKey: "••••••••••••••••",
    reminderTemplate: "Hi {name}, this is a reminder about {task}. Please complete it by {date}.",
    newPassword: "",
    confirmPassword: "",
  })

  const sections = [
    { id: "institute", label: "Institute Information", icon: "🏛️" },
    { id: "api", label: "API Integrations", icon: "⚙️" },
    { id: "templates", label: "Message Templates", icon: "📝" },
    { id: "profile", label: "Profile Settings", icon: "👤" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setSaveMessage("Settings saved successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your university CRM configuration</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="md:w-64">
            <Card className="shadow-lg p-0 overflow-hidden">
              <nav className="flex md:flex-col">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-6 py-4 font-medium transition-all ${
                      activeSection === section.id
                        ? "bg-blue-600 text-white border-l-4 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    <span className="hidden md:inline">{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Institute Information */}
            {activeSection === "institute" && (
              <Card className="p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Institute Information</h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input
                      id="instituteName"
                      name="instituteName"
                      value={formData.instituteName}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Logo Upload</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-gray-400 mr-2 inline" />
                        Click to upload logo
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* API Integrations */}
            {activeSection === "api" && (
              <Card className="p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">API Integrations</h2>
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Email API</h3>
                    </div>
                    <div className="space-y-4 pl-7">
                      <div>
                        <Label htmlFor="emailApi">Email Provider</Label>
                        <select
                          id="emailApi"
                          name="emailApi"
                          value={formData.emailApi}
                          onChange={handleChange}
                          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option>SendGrid</option>
                          <option>Mailgun</option>
                          <option>AWS SES</option>
                          <option>Gmail API</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="emailApiKey">API Key</Label>
                        <Input
                          id="emailApiKey"
                          name="emailApiKey"
                          type="password"
                          value={formData.emailApiKey}
                          onChange={handleChange}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">WhatsApp API</h3>
                    </div>
                    <div className="space-y-4 pl-7">
                      <div>
                        <Label htmlFor="whatsappApi">WhatsApp Provider</Label>
                        <select
                          id="whatsappApi"
                          name="whatsappApi"
                          value={formData.whatsappApi}
                          onChange={handleChange}
                          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option>Twilio</option>
                          <option>Twilio Business</option>
                          <option>WhatsApp Cloud API</option>
                          <option>Nexmo</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="whatsappApiKey">API Key</Label>
                        <Input
                          id="whatsappApiKey"
                          name="whatsappApiKey"
                          type="password"
                          value={formData.whatsappApiKey}
                          onChange={handleChange}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Message Templates */}
            {activeSection === "templates" && (
              <Card className="p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Message Templates</h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="reminderTemplate">Reminder Message Template</Label>
                    <textarea
                      id="reminderTemplate"
                      name="reminderTemplate"
                      value={formData.reminderTemplate}
                      onChange={handleChange}
                      rows={4}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Use variables: {"{name}"}, {"{task}"}, {"{date}"}, {"{course}"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Preview:</p>
                    <p className="text-sm text-gray-700 italic">
                      {formData.reminderTemplate
                        .replace("{name}", "Raj Kumar")
                        .replace("{task}", "Admission Form Submission")
                        .replace("{date}", "2024-11-15")
                        .replace("{course}", "B.Tech Computer Science")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Profile Settings */}
            {activeSection === "profile" && (
              <Card className="p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div>
                    <Label>Profile Photo</Label>
                    <div className="mt-4 flex items-center gap-6">
                      <img
                        src="/admin-profile.png"
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" className="text-gray-700 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Save Message Toast */}
        {saveMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  )
}
