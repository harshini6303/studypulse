'use client'
// @ts-nocheck
import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { loginStudent, getCurrentUser } from '@/lib/services/student-service'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function LoginPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      window.location.href = '/dashboard' 
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  const isFormValid = usernameOrEmail.trim() !== '' && password.trim() !== ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    //setIsLoading(true)
    
    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = loginStudent(usernameOrEmail, password)

    if (result.success) {
      showToast('Login successful! Welcome back.', 'success')
      window.location.href = '/dashboard'
    } else {
      showToast(result.error || 'Login failed', 'error')
      setIsLoading(false)
    }
  }

 /* if (checkingAuth) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />
  }*/

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in border-border bg-card shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-primary">StudyPulse</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="usernameOrEmail" className="text-sm font-medium text-foreground">
                Email or Username
              </label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter your email or username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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
            </div>
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary transition-colors hover:text-accent hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner /> Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="font-medium text-primary transition-colors hover:text-accent hover:underline"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
