'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Moon,
  Sun,
  Save,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  getCurrentUser, 
  updateUserProfile, 
  updateUserSettings 
} from '@/lib/services/student-service'
import { useToast } from '@/components/toast-provider'
import type { Student } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState<Student | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    setUser(currentUser)
    setFullName(currentUser.fullName)
    setEmail(currentUser.email)
    setDarkMode(currentUser.settings?.darkMode || false)

    // Apply dark mode on load
    if (currentUser.settings?.darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [router])

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked)
    if (checked) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    if (user) {
      updateUserSettings(user.id, { darkMode: checked })
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = updateUserProfile(user.id, { fullName, email })

    if (result.success) {
      showToast('Profile updated successfully!', 'success')
      // Refresh user data
      const updatedUser = getCurrentUser()
      setUser(updatedUser)
    } else {
      showToast(result.error || 'Failed to update profile', 'error')
    }

    setIsSaving(false)
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-primary">StudyPulse</h1>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-border bg-background pl-10 text-foreground"
                placeholder="Enter your full name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-background pl-10 text-foreground"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              type="text"
              value={user.username}
              disabled
              className="border-border bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Username cannot be changed</p>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full bg-primary text-primary-foreground hover:bg-accent"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            {darkMode ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>Customize your visual experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                {darkMode
                  ? 'Switch to Light Blue theme'
                  : 'Switch to Dark Blue theme'}
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between rounded-lg bg-secondary/30 p-3">
            <span className="text-sm text-muted-foreground">Account Created</span>
            <span className="text-sm font-medium text-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between rounded-lg bg-secondary/30 p-3">
            <span className="text-sm text-muted-foreground">User ID</span>
            <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
