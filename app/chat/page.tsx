"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, dummyUsers, getChatMessages } from "@/lib/data/dummy-data"
import { User, ChatMessage } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Send, MessageSquare, User as UserIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ChatPage() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)

    if (!user) {
      router.push("/")
      return
    }

    // Get all users except current user for chat list
    const chatUsers = dummyUsers.filter((u) => u.id !== user.id && u.role !== "STUDENT")
    if (chatUsers.length > 0 && !selectedUser) {
      setSelectedUser(chatUsers[0])
    }
  }, [router, selectedUser])

  useEffect(() => {
    if (currentUser && selectedUser) {
      const chatMessages = getChatMessages(currentUser.id)
      // Filter messages between current user and selected user
      const filteredMessages = chatMessages.filter(
        (msg) =>
          (msg.senderId === currentUser.id && msg.receiverId === selectedUser.id) ||
          (msg.senderId === selectedUser.id && msg.receiverId === currentUser.id)
      )
      setMessages(filteredMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
    }
  }, [currentUser, selectedUser])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return

    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: selectedUser.id,
      receiverName: selectedUser.name,
      message: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      type: "text",
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const getChatUsers = () => {
    if (!currentUser) return []
    return dummyUsers
      .filter((u) => u.id !== currentUser.id && u.role !== "STUDENT")
      .filter((u) => !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const getUnreadCount = (userId: string) => {
    if (!currentUser) return 0
    return messages.filter((msg) => msg.senderId === userId && msg.receiverId === currentUser.id && !msg.read).length
  }

  if (!currentUser) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Internal Chat</h1>
        <p className="text-muted-foreground mt-1">Communicate with team members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
        {/* Users List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
              {getChatUsers().map((user) => {
                const unreadCount = getUnreadCount(user.id)
                const isSelected = selectedUser?.id === user.id
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors border-b border-border ${
                      isSelected ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role.replace("_", " ")}</p>
                    </div>
                    {unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {selectedUser ? (
            <>
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                    <CardDescription>{selectedUser.role.replace("_", " ")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.senderId === currentUser.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs font-medium mb-1 opacity-80">{message.senderName}</p>
                            )}
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a user to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  )
}

