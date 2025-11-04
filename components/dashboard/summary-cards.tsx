"use client"

import { Users, UserCheck, DollarSign, TrendingUp } from "lucide-react"

const summaryData = [
  {
    icon: Users,
    title: "Total Leads",
    value: "2,543",
    change: "+12.5%",
    changeType: "positive",
  },
  {
    icon: UserCheck,
    title: "Active Students",
    value: "1,896",
    change: "+8.2%",
    changeType: "positive",
  },
  {
    icon: DollarSign,
    title: "Pending Fees",
    value: "$48,500",
    change: "-3.1%",
    changeType: "negative",
  },
  {
    icon: TrendingUp,
    title: "Monthly Admissions",
    value: "342",
    change: "+15.8%",
    changeType: "positive",
  },
]

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryData.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{item.title}</p>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-xs font-semibold ${
                  item.changeType === "positive" ? "text-green-600" : "text-orange-600"
                }`}
              >
                {item.change} from last month
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
