'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  TrendingUp,
  ArrowLeft,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  getCurrentFeedback 
} from '@/lib/services/feedback-service'
import { 
  generateTimetable, 
  getCurrentTimetable,
  updateTimetableItemCompletion 
} from '@/lib/services/timetable-service'
import { useToast } from '@/components/toast-provider'
import type { TimetableEntry, Feedback } from '@/lib/types'

export default function TimetablePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [timetable, setTimetable] = useState<TimetableEntry | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [studyHours, setStudyHours] = useState(4)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const currentFeedback = getCurrentFeedback()
    if (!currentFeedback) {
     
      return
    }
    setFeedback(currentFeedback)

    const currentTimetable = getCurrentTimetable()
    if (currentTimetable && currentTimetable.feedbackId === currentFeedback.id) {
      setTimetable(currentTimetable)
      setStudyHours(currentTimetable.studyHours)
    }
  }, [router])

  const handleGenerateTimetable = async () => {
    if (!feedback) return

    setIsGenerating(true)
    
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const newTimetable = generateTimetable(feedback, studyHours)
    setTimetable(newTimetable)
    showToast('Timetable generated successfully!', 'success')
    setIsGenerating(false)
  }

  const handleToggleComplete = (itemId: string, completed: boolean) => {
    if (!timetable) return
    
    updateTimetableItemCompletion(timetable.id, itemId, completed)
    
    // Update local state
    setTimetable((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, completed } : item
        ),
      }
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/30'
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/30'
      case 'low':
        return 'bg-success/10 text-success border-success/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Focus'
      case 'medium':
        return 'Practice'
      case 'low':
        return 'Revise'
      default:
        return priority
    }
  }

  const completedCount = timetable?.items.filter((item) => item.completed).length || 0
  const totalCount = timetable?.items.length || 0
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (!feedback) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/feedback')}
          className="mb-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feedback
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Personalized Study Timetable</h1>
        <p className="text-muted-foreground">
          Customize your daily study schedule based on your performance
        </p>
      </div>

      {/* Hours Selector */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Study Hours Per Day
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="8"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <span className="min-w-[3rem] text-center text-2xl font-bold text-primary">
              {studyHours}h
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 hour</span>
            <span>8 hours</span>
          </div>
          <Button
            onClick={handleGenerateTimetable}
            disabled={isGenerating}
            className="w-full bg-primary text-primary-foreground hover:bg-accent"
          >
            {isGenerating ? 'Generating...' : timetable ? 'Regenerate Timetable' : 'Generate Timetable'}
          </Button>
        </CardContent>
      </Card>

      {/* Timetable */}
      {timetable && (
        <>
          {/* Progress */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Progress: {completedCount}/{totalCount} topics completed
                </span>
                <span className="text-sm font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Study Items Table */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Study Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="w-12 pb-3 text-left text-sm font-medium text-muted-foreground">
                        Done
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Concept
                      </th>
                      <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                        Priority
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.items.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-border last:border-0 ${
                          item.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="py-4">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) =>
                              handleToggleComplete(item.id, checked as boolean)
                            }
                            className="border-primary data-[state=checked]:bg-primary"
                          />
                        </td>
                        <td className="py-4">
                          <span
                            className={`font-medium ${
                              item.completed
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground'
                            }`}
                          >
                            {item.concept}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(
                              item.priority
                            )}`}
                          >
                            {getPriorityLabel(item.priority)}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="font-mono text-sm text-muted-foreground">
                            {item.timeMinutes} min
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* View Graph Button */}
          <div className="flex justify-center pb-8">
            <Button
              size="lg"
              onClick={() => router.push('/progress')}
              className="bg-primary text-primary-foreground shadow-lg hover:bg-accent"
            >
              <TrendingUp className="mr-2 h-5 w-5" /> View Improvement Graph
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
