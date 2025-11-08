"use client"

import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import Image from "next/image"

export default function AuthPage() {
  const router = useRouter()

  const handleLoginSuccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <Image 
              src="/tsm-logo.png" 
              alt="TSM University" 
              width={200} 
              height={100} 
              priority 
              className="h-20 md:h-24 w-auto object-contain" 
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2025 TSM CRM. All rights reserved.</p>
          <p className="mt-2 text-xs">
            User accounts are created by Super Admin. Contact your administrator for access.
          </p>
        </div>
      </div>
    </div>
  )
}
