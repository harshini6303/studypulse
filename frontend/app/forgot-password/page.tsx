'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, KeyRound, Check, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPassword, findUserByUsernameOrEmail } from '@/lib/services/student-service'
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

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isPasswordValid = passwordRequirements.every((req) => req.test(newPassword))
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword !== ''
  const isFormValid = 
    usernameOrEmail.trim() !== '' && 
    isPasswordValid && 
    doPasswordsMatch

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    //setIsLoading(true)
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // First check if user exists
    const user = findUserByUsernameOrEmail(usernameOrEmail)
    if (!user) {
      showToast('User not found. Please check your username or email.', 'error')
      setIsLoading(false)
      return
    }

    const result = resetPassword(usernameOrEmail, newPassword)

    if (result.success) {
      showToast('Password reset successful! Please login with your new password.', 'success')
      router.push('/')
    } else {
      showToast(result.error || 'Password reset failed', 'error')
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
          <CardTitle className="text-2xl font-bold text-foreground">Forgot Password?</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your username or email and create a new password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="usernameOrEmail" className="text-sm font-medium text-foreground">
                Username or Email
              </label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter your username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-border bg-background pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => {
                  const isValid = req.test(newPassword)
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        newPassword ? (isValid ? 'text-success' : 'text-destructive') : 'text-muted-foreground'
                      }`}
                    >
                      {newPassword ? (
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
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Re-enter Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-border bg-background pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
              {confirmPassword && doPasswordsMatch && (
                <p className="flex items-center gap-1 text-xs text-success">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                'Resetting Password...'
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                </>
              )}
            </Button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
