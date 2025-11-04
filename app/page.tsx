"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"
import Image from "next/image"

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false)
  const router = useRouter()

  const handleLoginSuccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image src="/tsm-logo.png" alt="TSM University" width={120} height={60} priority className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">TSM CRM</h1>
          <p className="text-muted-foreground mt-2">University Management System</p>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          {isSignup ? (
            <SignupForm onSignupSuccess={() => setIsSignup(false)} />
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )}

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary font-semibold hover:text-accent transition-colors"
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2025 TSM CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
