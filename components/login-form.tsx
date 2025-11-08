"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, Info, Shield } from "lucide-react"
import { dummyUsers, setCurrentUser, getStudentByEmail } from "@/lib/data/dummy-data"
import { User, Student } from "@/lib/types"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState("")
  const [tempUser, setTempUser] = useState<User | Student | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call with dummy data
    setTimeout(() => {
      if (!email || !password) {
        setError("Please fill in all fields")
        setIsLoading(false)
        return
      }

      // Find user by email (for demo, any password works)
      // Check both regular users and students
      let user: User | Student | undefined = dummyUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
      
      // If not found in regular users, check students
      if (!user) {
        user = getStudentByEmail(email)
      }

      if (!user) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      if (user.status !== "ACTIVE") {
        setError("Your account has been suspended. Please contact administrator.")
        setIsLoading(false)
        return
      }

      // Check if 2FA is enabled (for demo, Super Admin and Admin have 2FA)
      const requires2FA = user.role === "SUPER_ADMIN" || user.role === "ADMIN"

      if (requires2FA && !show2FA) {
        setTempUser(user)
        setShow2FA(true)
        setIsLoading(false)
        return
      }

      // Verify 2FA code (for demo, any 6-digit code works)
      if (show2FA && twoFACode.length !== 6) {
        setError("Please enter a valid 6-digit code")
        setIsLoading(false)
        return
      }

      // Get the user (either from tempUser if 2FA was used, or from the found user)
      const userToLogin = show2FA && tempUser ? tempUser : user

      // Set current user and update last login
      const updatedUser: User | Student = {
        ...userToLogin,
        lastLogin: new Date().toISOString().split("T")[0],
      }
      // Save to localStorage using the imported setCurrentUser function
      setCurrentUser(updatedUser)
      // Clear local 2FA state variables
      setTempUser(null)
      setShow2FA(false)
      setTwoFACode("")
      setIsLoading(false)
      onLoginSuccess()
    }, 800)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <a href="#" className="text-xs text-primary hover:text-accent transition-colors font-medium">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="remember"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded border-input bg-background border cursor-pointer accent-primary"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-foreground cursor-pointer">
          Remember me
        </label>
      </div>

      {/* 2FA Code Input */}
      {show2FA && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <label htmlFor="2fa" className="block text-sm font-medium text-foreground">
              Two-Factor Authentication
            </label>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Enter the 6-digit code from your authenticator app
          </p>
          <div className="relative">
            <input
              id="2fa"
              type="text"
              value={twoFACode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setTwoFACode(value)
              }}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-center text-2xl font-mono tracking-widest"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            For demo: Enter any 6-digit code
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (show2FA && twoFACode.length !== 6)}
        className="w-full bg-primary hover:bg-accent text-primary-foreground py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⊚</span> {show2FA ? "Verifying..." : "Signing in..."}
          </span>
        ) : show2FA ? (
          "Verify & Sign In"
        ) : (
          "Sign In"
        )}
      </button>

      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">or</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-background border border-border text-foreground py-2.5 rounded-lg font-medium hover:bg-muted transition-colors"
      >
        Sign in with SSO
      </button>

      {/* Demo Credentials Info */}
      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-primary mb-1">Demo Credentials:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• Super Admin: superadmin@tsm.university</li>
              <li>• Admin: admin@tsm.university</li>
              <li>• Counselor: sarah.johnson@tsm.university</li>
              <li>• Student: raj.kumar@tsm.university</li>
              <li className="text-muted-foreground/70 mt-1">Use any password to login</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  )
}

