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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {summaryData.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-2 truncate">{item.title}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{item.value}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg flex-shrink-0 ml-3 transition-all duration-300 hover:bg-primary/20">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  item.changeType === "positive" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
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
