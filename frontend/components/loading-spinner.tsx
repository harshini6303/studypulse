'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  message?: string
}

export function LoadingSpinner({ fullScreen = false, message }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        {message && (
          <p className="mt-4 text-lg font-medium text-foreground">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}
