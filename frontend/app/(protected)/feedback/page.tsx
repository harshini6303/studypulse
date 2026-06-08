'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Lightbulb,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentFeedback } from '@/lib/services/feedback-service'
import type { Feedback, ConceptScore } from '@/lib/types'

function ConceptCard({ 
  title, 
  concepts, 
  type 
}: { 
  title: string
  concepts: ConceptScore[]
  type: 'strong' | 'medium' | 'weak' 
}) {
  const colors = {
    strong: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: TrendingUp,
      iconColor: 'text-success',
      barColor: 'bg-success',
    },
    medium: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      icon: Minus,
      iconColor: 'text-warning',
      barColor: 'bg-warning',
    },
    weak: {
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      icon: TrendingDown,
      iconColor: 'text-destructive',
      barColor: 'bg-destructive',
    },
  }

  const { bg, border, icon: Icon, iconColor, barColor } = colors[type]

  if (concepts.length === 0) {
    return null
  }

  return (
    <Card className={`border ${border} ${bg}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {concepts.map((concept) => (
          <div key={concept.concept}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{concept.concept}</span>
              <span className="text-sm text-muted-foreground">{concept.score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full ${barColor} transition-all duration-500`}
                style={{ width: `${concept.score}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function FeedbackPage() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    const currentFeedback = getCurrentFeedback()
    if (!currentFeedback) {
    
      return
    }
    setFeedback(currentFeedback)
  }, [router])

  if (!feedback) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/result')}
          className="mb-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Learning Analysis</h1>
        <p className="text-muted-foreground">
          Personalized feedback based on your test performance
        </p>
      </div>

      {/* Concept Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ConceptCard
          title="Strong Concepts"
          concepts={feedback.strongConcepts}
          type="strong"
        />
        <ConceptCard
          title="Medium Concepts"
          concepts={feedback.mediumConcepts}
          type="medium"
        />
        <ConceptCard
          title="Weak Concepts"
          concepts={feedback.weakConcepts}
          type="weak"
        />
      </div>

      {/* AI Suggestions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-warning" />
            Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {index + 1}
              </div>
              <p className="text-foreground">{suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-success/10 p-4 text-center">
              <p className="text-3xl font-bold text-success">{feedback.strongConcepts.length}</p>
              <p className="text-sm text-muted-foreground">Strong Concepts</p>
            </div>
            <div className="rounded-lg bg-warning/10 p-4 text-center">
              <p className="text-3xl font-bold text-warning">{feedback.mediumConcepts.length}</p>
              <p className="text-sm text-muted-foreground">Medium Concepts</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{feedback.weakConcepts.length}</p>
              <p className="text-sm text-muted-foreground">Weak Concepts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Timetable Button */}
      <div className="flex justify-center pb-8">
        <Button
          size="lg"
          onClick={() => router.push('/timetable')}
          className="bg-primary text-primary-foreground shadow-lg hover:bg-accent"
        >
          <Calendar className="mr-2 h-5 w-5" /> Generate Timetable
        </Button>
      </div>
    </div>
  )
}
