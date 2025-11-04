"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PaymentsTabProps {
  student: {
    paymentHistory: Array<{
      id: number
      amount: number
      date: string
      status: string
      semester: string
    }>
    pendingDues: number
  }
}

export function PaymentsTab({ student }: PaymentsTabProps) {
  return (
    <div className="space-y-6">
      {/* Pending Dues Summary */}
      <Card className="p-6 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Pending Dues</p>
            <p className="text-3xl font-bold text-orange-600">₹{student.pendingDues.toLocaleString()}</p>
          </div>
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-base px-4 py-2">Pending</Badge>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Semester</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {student.paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{payment.semester}</td>
                  <td className="py-4 px-4 font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-gray-600">{payment.date}</td>
                  <td className="py-4 px-4">
                    <Badge
                      className={
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
