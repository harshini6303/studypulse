'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, SidebarTrigger } from '@/components/sidebar'
import { getCurrentUser } from '@/lib/services/student-service'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      return
    } else {
      setIsLoading(false)
    }
  }, [router])

  

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-card/80 p-4 backdrop-blur-md lg:hidden">
          <SidebarTrigger onClick={() => setSidebarOpen(true)} />
          <h1 className="text-xl font-bold text-primary">StudyPulse</h1>
        </header>

        {/* Page content */}
        <main className="animate-fade-in p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
