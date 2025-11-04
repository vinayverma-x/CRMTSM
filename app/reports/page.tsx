"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface MonthlySummary {
  month: string
  leads: number
  admissions: number
  feesCollected: number
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: "2024-11-30",
  })

  const [exportMessage, setExportMessage] = useState("")

  // Lead Source Distribution Data
  const leadSourceData = [
    { name: "Online Portal", value: 35 },
    { name: "Social Media", value: 25 },
    { name: "Referral", value: 20 },
    { name: "Direct Visit", value: 15 },
    { name: "Advertisement", value: 5 },
  ]

  // Counselor Performance Data
  const counselorData = [
    { name: "Priya Counselor", conversions: 28, leads: 45 },
    { name: "Amit Counselor", conversions: 22, leads: 38 },
    { name: "Neha Staff", conversions: 18, leads: 32 },
    { name: "Vikram Admin", conversions: 15, leads: 28 },
    { name: "Raj Kumar", conversions: 12, leads: 24 },
  ]

  // Conversion Rate Data
  const conversionData = [
    { month: "Jan", rate: 42 },
    { month: "Feb", rate: 45 },
    { month: "Mar", rate: 48 },
    { month: "Apr", rate: 52 },
    { month: "May", rate: 55 },
    { month: "Jun", rate: 58 },
    { month: "Jul", rate: 62 },
    { month: "Aug", rate: 65 },
    { month: "Sep", rate: 68 },
    { month: "Oct", rate: 70 },
    { month: "Nov", rate: 72 },
  ]

  // Monthly Summary Data
  const monthlySummary: MonthlySummary[] = [
    { month: "January", leads: 120, admissions: 45, feesCollected: 1125000 },
    { month: "February", leads: 135, admissions: 52, feesCollected: 1300000 },
    { month: "March", leads: 148, admissions: 58, feesCollected: 1450000 },
    { month: "April", leads: 165, admissions: 68, feesCollected: 1700000 },
    { month: "May", leads: 182, admissions: 75, feesCollected: 1875000 },
    { month: "June", leads: 195, admissions: 82, feesCollected: 2050000 },
    { month: "July", leads: 210, admissions: 88, feesCollected: 2200000 },
    { month: "August", leads: 225, admissions: 95, feesCollected: 2375000 },
    { month: "September", leads: 238, admissions: 102, feesCollected: 2550000 },
    { month: "October", leads: 255, admissions: 110, feesCollected: 2750000 },
    { month: "November", leads: 268, admissions: 118, feesCollected: 2950000 },
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  const handleExport = (format: "pdf" | "csv") => {
    setExportMessage(`Report exported as ${format.toUpperCase()}`)
    setTimeout(() => setExportMessage(""), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive CRM metrics and performance analysis</p>
        </div>

        {/* Filters and Export */}
        <Card className="p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("pdf")}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                onClick={() => handleExport("csv")}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Lead Source Distribution */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Lead Source Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Counselor Performance */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Counselor Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={counselorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversions" fill="#3b82f6" name="Conversions" />
                <Bar dataKey="leads" fill="#93c5fd" name="Total Leads" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Conversion Rate Trend */}
        <Card className="p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Conversion Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "Conversion Rate (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                name="Conversion Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Summary Table */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Month</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Leads</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Admissions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Conversion %</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fees Collected</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.leads}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.admissions}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      {((row.admissions / row.leads) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ₹{(row.feesCollected / 100000).toFixed(1)}L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Export Message */}
        {exportMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            {exportMessage}
          </div>
        )}
      </div>
    </div>
  )
}
