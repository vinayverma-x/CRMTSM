"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const chartData = [
  { month: "Jan", admissions: 240, target: 300 },
  { month: "Feb", admissions: 280, target: 300 },
  { month: "Mar", admissions: 320, target: 300 },
  { month: "Apr", admissions: 310, target: 300 },
  { month: "May", admissions: 350, target: 300 },
  { month: "Jun", admissions: 380, target: 300 },
  { month: "Jul", admissions: 400, target: 400 },
  { month: "Aug", admissions: 420, target: 400 },
  { month: "Sep", admissions: 385, target: 350 },
  { month: "Oct", admissions: 410, target: 400 },
  { month: "Nov", admissions: 440, target: 400 },
  { month: "Dec", admissions: 465, target: 450 },
]

export default function AdmissionsTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Admissions Trend</CardTitle>
        <CardDescription>Admissions vs. target over the past year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="admissions"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)", r: 4 }}
                name="Admissions"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="var(--color-muted-foreground)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-muted-foreground)", r: 4 }}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
