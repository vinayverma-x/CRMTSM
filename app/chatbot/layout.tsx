import type React from "react"
import { AppLayout } from "@/components/layout"

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
