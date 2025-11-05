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
    <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Monthly Admissions Trend</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Admissions vs. target over the past year</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 sm:h-72 lg:h-80 w-full transition-all duration-300 ease-in-out">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ 
                top: 10, 
                right: 10, 
                left: -10, 
                bottom: 10 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--color-foreground)", fontSize: "12px" }}
                itemStyle={{ fontSize: "12px" }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Line
                type="monotone"
                dataKey="admissions"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ fill: "var(--color-primary)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Admissions"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="var(--color-muted-foreground)"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-muted-foreground)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
