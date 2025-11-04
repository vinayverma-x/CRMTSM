"use client"

import { CheckCircle } from "lucide-react"

interface SuccessNotificationProps {
  message: string
}

export default function SuccessNotification({ message }: SuccessNotificationProps) {
  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      <p className="text-green-800 font-medium">{message}</p>
    </div>
  )
}
