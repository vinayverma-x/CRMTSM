"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Bot, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Conversation {
  id: number
  name: string
  type: "student" | "counselor"
  lastMessage: string
  timestamp: string
  avatar: string
  unread: boolean
}

interface Message {
  id: number
  sender: string
  content: string
  type: "text" | "file"
  timestamp: string
  isAI: boolean
}

export default function ChatbotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      name: "Raj Kumar",
      type: "student",
      lastMessage: "Can I change my course after admission?",
      timestamp: "2:30 PM",
      avatar: "/placeholder.svg?key=r1y2",
      unread: true,
    },
    {
      id: 2,
      name: "Priya Sharma",
      type: "counselor",
      lastMessage: "Shared admission updates for batch 2024",
      timestamp: "1:15 PM",
      avatar: "/placeholder.svg?key=s3t4",
      unread: false,
    },
    {
      id: 3,
      name: "Amit Counselor",
      type: "counselor",
      lastMessage: "Can you approve the fee collection?",
      timestamp: "12:45 PM",
      avatar: "/placeholder.svg?key=u5v6",
      unread: true,
    },
    {
      id: 4,
      name: "Neha Singh",
      type: "student",
      lastMessage: "When is the next batch intake?",
      timestamp: "11:20 AM",
      avatar: "/placeholder.svg?key=w7x8",
      unread: false,
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Raj Kumar",
      content: "Hi, I have a question about course changes",
      type: "text",
      timestamp: "2:28 PM",
      isAI: false,
    },
    {
      id: 2,
      sender: "AI Assistant",
      content:
        "Hello Raj! I can help you with your course-related questions. Could you provide more details about your inquiry?",
      type: "text",
      timestamp: "2:29 PM",
      isAI: true,
    },
    {
      id: 3,
      sender: "Raj Kumar",
      content: "Can I change my course after admission?",
      type: "text",
      timestamp: "2:30 PM",
      isAI: false,
    },
  ])

  const [inputMessage, setInputMessage] = useState("")
  const [aiAssistEnabled, setAiAssistEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "Admin",
      content: inputMessage,
      type: "text",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isAI: false,
    }

    setMessages([...messages, newMessage])
    setInputMessage("")

    // Simulate AI response if enabled
    if (aiAssistEnabled) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          sender: "AI Assistant",
          content: `Thanks for your message. I've processed your request and will follow up with the relevant information shortly.`,
          type: "text",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          isAI: true,
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 800)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    // Clear unread status
    setConversations((prev) => prev.map((c) => (c.id === conversation.id ? { ...c, unread: false } : c)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-100px)]">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">AI Chatbot Inbox</h1>
            <p className="text-gray-600">Manage conversations with students and counselors</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow">
            <span className="text-sm font-medium text-gray-700">AI Assist</span>
            <button onClick={() => setAiAssistEnabled(!aiAssistEnabled)} className="focus:outline-none">
              {aiAssistEnabled ? (
                <ToggleRight className="w-6 h-6 text-blue-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex gap-6 h-full">
          {/* Conversations Sidebar */}
          <Card className="hidden md:flex md:w-80 shadow-lg overflow-hidden flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full text-left p-4 border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={conversation.avatar || "/placeholder.svg"}
                      alt={conversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-medium text-gray-900 truncate">{conversation.name}</p>
                        {conversation.unread && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {conversation.type === "student" ? "Student" : "Counselor"}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-500 mt-1">{conversation.timestamp}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Panel */}
          <Card className="flex-1 shadow-lg overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConversation.avatar || "/placeholder.svg"}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                      <p className="text-xs text-gray-600">
                        {selectedConversation.type === "student" ? "Student" : "Counselor"}
                      </p>
                    </div>
                  </div>
                  {aiAssistEnabled && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <Bot className="w-3 h-3" />
                      AI Active
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isAI || message.sender === "Admin" ? "justify-end" : "justify-start"}`}
                    >
                      {!message.isAI && message.sender !== "Admin" && (
                        <img
                          src={selectedConversation.avatar || "/placeholder.svg"}
                          alt={message.sender}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-sm px-4 py-3 rounded-lg ${
                          message.isAI
                            ? "bg-blue-50 text-gray-900 rounded-bl-none"
                            : message.sender === "Admin"
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {message.type === "text" ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">Document attached</span>
                          </div>
                        )}
                        <p
                          className={`text-xs mt-1 ${message.isAI || message.sender === "Admin" ? "text-gray-600" : "text-gray-500"}`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                      {message.isAI && (
                        <Bot className="w-8 h-8 p-1 bg-blue-100 text-blue-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-3">
                    <Button size="icon" variant="ghost" className="text-gray-600 hover:text-blue-600">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
