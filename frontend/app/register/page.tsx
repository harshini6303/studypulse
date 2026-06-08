'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { registerStudent } from '@/lib/services/student-service'
import { useToast } from '@/components/toast-provider'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isPasswordValid = passwordRequirements.every((req) => req.test(password))
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isFormValid = 
    fullName.trim() !== '' && 
    username.trim() !== '' && 
    isEmailValid && 
    isPasswordValid

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    //setIsLoading(true)
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = registerStudent(fullName, username, email, password)

    if (result.success) {
      showToast('Registration successful! Please login.', 'success')
      router.push('/')
    } else {
      showToast(result.error || 'Registration failed', 'error')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in border-border bg-card shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-primary">StudyPulse</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Fill in your details to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                disabled={isLoading}
              />
              {email && !isEmailValid && (
                <p className="text-xs text-destructive">Please enter a valid email address</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-background pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => {
                  const isValid = req.test(password)
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        password ? (isValid ? 'text-success' : 'text-destructive') : 'text-muted-foreground'
                      }`}
                    >
                      {password ? (
                        isValid ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-current" />
                      )}
                      {req.label}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                'Creating Account...'
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/"
                className="font-medium text-primary transition-colors hover:text-accent hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
