'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  LogOut,
  User
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCurrentUser, logoutUser } from '@/lib/services/student-service'
import { useToast } from '@/components/toast-provider'
import type { Student } from '@/lib/types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/progress', label: 'Progress Graph', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState<Student | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    logoutUser()
    showToast('Logged out successfully', 'success')
    router.push('/')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-4">
            <h1 className="text-xl font-bold text-sidebar-primary">StudyPulse</h1>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-sidebar-accent lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-medium">{user?.fullName || 'User'}</p>
                <p className="truncate text-sm text-sidebar-foreground/70">
                  @{user?.username || 'username'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-sidebar-border p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// Menu button component for opening sidebar
export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-primary p-2 text-primary-foreground shadow-lg transition-all hover:bg-accent lg:hidden"
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}
