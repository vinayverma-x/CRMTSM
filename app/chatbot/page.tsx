"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, Bot, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, getStudentById } from "@/lib/data/dummy-data"
import { Student } from "@/lib/types"
import { toast } from "sonner"

interface Message {
  id: string
  sender: "student" | "bot"
  content: string
  timestamp: string
}

// Dummy University Data
const universityData = {
  name: "TSM University",
  courses: [
    { name: "B.Tech Computer Science", duration: "4 years", fees: "₹2,50,000/year", intake: "July" },
    { name: "B.Tech Electronics", duration: "4 years", fees: "₹2,30,000/year", intake: "July" },
    { name: "MBA", duration: "2 years", fees: "₹3,00,000/year", intake: "July, January" },
    { name: "BBA", duration: "3 years", fees: "₹1,80,000/year", intake: "July" },
    { name: "M.Tech Computer Science", duration: "2 years", fees: "₹2,80,000/year", intake: "July" },
  ],
  admissionDates: {
    nextIntake: "July 2025",
    applicationDeadline: "May 31, 2025",
    entranceExam: "June 15, 2025",
  },
  contact: {
    email: "admissions@tsm.university",
    phone: "+91-1800-123-4567",
    address: "123 University Road, Education City, India",
  },
  facilities: ["Library", "Laboratories", "Hostel", "Sports Complex", "Cafeteria", "Medical Center"],
  scholarships: [
    { name: "Merit Scholarship", discount: "50%", eligibility: "CGPA > 8.5" },
    { name: "Need-based Scholarship", discount: "25-75%", eligibility: "Based on family income" },
    { name: "Sports Scholarship", discount: "30%", eligibility: "State/National level athletes" },
  ],
  importantDates: {
    semesterStart: "August 1, 2024",
    semesterEnd: "December 15, 2024",
    examPeriod: "December 1-15, 2024",
    holidays: ["Diwali", "Christmas", "New Year"],
  },
}

// Intelligent Response Generator
function generateBotResponse(message: string, student: Student | null): string {
  const lowerMessage = message.toLowerCase()

  // Greetings
  if (lowerMessage.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
    return `Hello ${student?.name || "there"}! 👋 I'm your virtual assistant at ${universityData.name}. How can I help you today?`
  }

  // Course Information
  if (lowerMessage.match(/\b(course|program|degree|study|curriculum)\b/)) {
    if (student?.course) {
      const studentCourse = universityData.courses.find((c) => c.name.includes(student.course.split(" ")[0]))
      if (studentCourse) {
        return `You're enrolled in **${student.course}**. This is a ${studentCourse.duration} program with fees of ${studentCourse.fees}. Your current year is ${student.year} and you're in ${student.semester}. Is there anything specific about your course you'd like to know?`
      }
    }
    return `We offer various courses including:\n${universityData.courses.map((c) => `• ${c.name} (${c.duration}) - ${c.fees}`).join("\n")}\n\nWhich course would you like to know more about?`
  }

  // Fees and Payments
  if (lowerMessage.match(/\b(fee|fees|payment|pay|tuition|cost|price|amount due)\b/)) {
    if (student?.course) {
      const studentCourse = universityData.courses.find((c) => c.name.includes(student.course.split(" ")[0]))
      if (studentCourse) {
        return `For your course **${student.course}**, the annual fee is ${studentCourse.fees}. You can check your payment status and pending fees in the Payments section of your dashboard. For payment-related queries, contact: ${universityData.contact.email} or ${universityData.contact.phone}.`
      }
    }
    return `Our course fees range from ₹1,80,000 to ₹3,00,000 per year depending on the program. You can find detailed fee structure in your student portal. For payment assistance, contact: ${universityData.contact.email}.`
  }

  // Admission Information
  if (lowerMessage.match(/\b(admission|admit|apply|application|enroll|enrollment|intake)\b/)) {
    return `**Admission Information:**\n• Next Intake: ${universityData.admissionDates.nextIntake}\n• Application Deadline: ${universityData.admissionDates.applicationDeadline}\n• Entrance Exam: ${universityData.admissionDates.entranceExam}\n\nYou can apply online through our portal or contact admissions at ${universityData.contact.email}.`
  }

  // Attendance
  if (lowerMessage.match(/\b(attendance|present|absent|attendance percentage)\b/)) {
    if (student?.attendance !== undefined) {
      const status = student.attendance >= 75 ? "excellent" : student.attendance >= 60 ? "good" : "needs improvement"
      return `Your current attendance is **${student.attendance}%**. ${status === "excellent" ? "Great job! Keep it up! 🎉" : status === "good" ? "You're doing well, but try to maintain above 75%." : "Please ensure you attend classes regularly to maintain the minimum 75% requirement."}`
    }
    return "You can check your attendance in your student dashboard. The minimum attendance requirement is 75% to be eligible for exams."
  }

  // Grades/CGPA
  if (lowerMessage.match(/\b(grade|gpa|cgpa|marks|score|result|performance)\b/)) {
    if (student?.cgpa !== undefined) {
      const performance = student.cgpa >= 8.5 ? "excellent" : student.cgpa >= 7.5 ? "very good" : student.cgpa >= 6.5 ? "good" : "needs improvement"
      return `Your current CGPA is **${student.cgpa}**. That's ${performance}! ${student.cgpa >= 8.5 ? "You're eligible for merit scholarships! 🏆" : ""} Keep up the great work!`
    }
    return "You can view your grades and CGPA in your student dashboard. Results are typically published within 2 weeks after exams."
  }

  // Documents
  if (lowerMessage.match(/\b(document|doc|certificate|marksheet|transcript|id card)\b/)) {
    return `You can access all your documents in the **Documents** section of your dashboard. Available documents include:\n• Admission Letter\n• ID Proof\n• Marksheets\n• Certificates\n\nIf you need a new document or have issues accessing them, contact the admin office.`
  }

  // Schedule/Timetable
  if (lowerMessage.match(/\b(schedule|timetable|class|lecture|time|when|exam date|semester)\b/)) {
    if (student?.semester) {
      return `**Important Dates for ${student.semester}:**\n• Semester Start: ${universityData.importantDates.semesterStart}\n• Semester End: ${universityData.importantDates.semesterEnd}\n• Exam Period: ${universityData.importantDates.examPeriod}\n\nYou can find your detailed class schedule in your student portal.`
    }
    return `You can view your class schedule and timetable in your student dashboard. For exam dates, check the academic calendar.`
  }

  // Scholarships
  if (lowerMessage.match(/\b(scholarship|financial aid|grant|funding|assistance)\b/)) {
    return `**Available Scholarships:**\n${universityData.scholarships.map((s) => `• ${s.name}: ${s.discount} discount (${s.eligibility})`).join("\n")}\n\nTo apply, visit the scholarship section in your portal or contact the financial aid office.`
  }

  // Facilities
  if (lowerMessage.match(/\b(facility|facilities|library|lab|hostel|sports|gym|cafeteria)\b/)) {
    return `**University Facilities:**\n${universityData.facilities.map((f) => `• ${f}`).join("\n")}\n\nAll facilities are available to students. For specific timings or access, check the facilities section in your portal.`
  }

  // Contact Information
  if (lowerMessage.match(/\b(contact|phone|email|address|help|support|office)\b/)) {
    return `**Contact Information:**\n• Email: ${universityData.contact.email}\n• Phone: ${universityData.contact.phone}\n• Address: ${universityData.contact.address}\n\nOffice hours: Monday-Friday, 9 AM - 5 PM`
  }

  // Profile Information
  if (lowerMessage.match(/\b(profile|my info|my details|student id|roll number)\b/)) {
    if (student) {
      return `**Your Profile:**\n• Name: ${student.name}\n• Roll No: ${student.rollNo}\n• Course: ${student.course}\n• Year: ${student.year}\n• Semester: ${student.semester}\n• Email: ${student.email}\n• Phone: ${student.phone || "Not provided"}\n\nYou can update your profile in the Profile section.`
    }
    return "You can view and update your profile information in the Profile section of your dashboard."
  }

  // Default responses
  const defaultResponses = [
    "I'm here to help! Could you please rephrase your question? I can assist with:\n• Course information\n• Fees and payments\n• Attendance and grades\n• Documents\n• Schedule and exams\n• Scholarships\n• Facilities\n• Contact information",
    "I understand you're asking about that. For more specific information, you can:\n• Check your student dashboard\n• Contact the admin office at " + universityData.contact.email + "\n• Visit the help section\n\nWhat else can I help you with?",
    "That's a great question! I can help you with information about courses, fees, attendance, documents, schedules, and more. What specific topic would you like to know about?",
  ]

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export default function ChatbotPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "STUDENT") {
      toast.error("Access denied. Chatbot is only available for students.")
      router.push("/dashboard")
      return
    }

    const studentData = getStudentById(user.id)
    if (studentData) {
      setStudent(studentData)
      // Welcome message
      setMessages([
        {
          id: "1",
          sender: "bot",
          content: `Hello ${studentData.name}! 👋 Welcome to ${universityData.name} chatbot. I'm here to help you with:\n\n• Course information\n• Fees and payments\n• Attendance and grades\n• Documents\n• Schedule and exams\n• Scholarships\n• Facilities\n• Contact information\n\nHow can I assist you today?`,
          timestamp: new Date().toISOString(),
        },
      ])
    } else {
      toast.error("Student data not found.")
      router.push("/dashboard")
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !student) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "student",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")

    // Generate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        content: generateBotResponse(inputMessage, student),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 500)
  }

  if (!student) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">AI Chatbot Assistant</h1>
        <p className="text-muted-foreground mt-1">Get instant answers to your questions about university services</p>
      </div>

      <Card className="h-[calc(100vh-250px)] flex flex-col">
        {/* Chat Header */}
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">University Assistant</CardTitle>
              <CardDescription>Available 24/7 to help you</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Online
            </Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "student" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-lg ${
                  message.sender === "student"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card border border-border rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs mt-2 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.sender === "student" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about courses, fees, attendance, documents, schedules..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()} className="gap-2">
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Try asking: "What is my attendance?", "Tell me about fees", "When are the exams?"
          </p>
        </div>
      </Card>
    </>
  )
}
