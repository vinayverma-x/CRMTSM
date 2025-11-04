import type React from "react"
import { AppLayout } from "@/components/layout"

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
