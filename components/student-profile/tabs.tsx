"use client"
import { OverviewTab } from "./tabs/overview"
import { AcademicInfoTab } from "./tabs/academic-info"
import { PaymentsTab } from "./tabs/payments"
import { DocumentsTab } from "./tabs/documents"

interface StudentProfileTabsProps {
  student: any
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function StudentProfileTabs({ student, activeTab, setActiveTab }: StudentProfileTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "academic", label: "Academic Info" },
    { id: "payments", label: "Payments" },
    { id: "documents", label: "Documents" },
  ]

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && <OverviewTab student={student} />}
        {activeTab === "academic" && <AcademicInfoTab student={student} />}
        {activeTab === "payments" && <PaymentsTab student={student} />}
        {activeTab === "documents" && <DocumentsTab student={student} />}
      </div>
    </>
  )
}
