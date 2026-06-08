'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getQuestions } from '@/lib/services/question-service'

import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentQuizResult } from '@/lib/services/score-service'

import { generateFeedback } from '@/lib/services/feedback-service'
import { useToast } from '@/components/toast-provider'
import type { QuizResult, Question } from '@/lib/types'
import { SUBJECT_FULL_NAMES } from '@/lib/types'

export default function ResultPage() {
  
  const router = useRouter()
  const { showToast } = useToast()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const subject =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('subject')
      : 'DSA'



const [questions, setQuestions] = useState<any[]>([])

useEffect(() => {
  const stored = localStorage.getItem("quizResult")

  if (!stored) {
    router.push("/dashboard")
    return
  }

  const parsed = JSON.parse(stored)

  setResult(parsed)
  setQuestions(parsed.questions || [])
}, [])
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const handleGenerateFeedback = async () => {
    if (!result) return
    
    setIsGeneratingFeedback(true)
    
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    generateFeedback(result)
    showToast('Feedback generated successfully!', 'success')
    router.push('/feedback')
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading results...</p>
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
          onClick={() => router.push('/dashboard')}
          className="mb-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Test Results</h1>
        <p className="text-muted-foreground">
          {SUBJECT_FULL_NAMES[result.subject]} - {new Date(result.date).toLocaleDateString()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/20 p-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className="text-2xl font-bold text-foreground">
                {result.score}/{result.totalQuestions}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-success/20 p-3">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold text-foreground">{Number(result.accuracy || 0).toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-info/20 p-3">
              <Clock className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Taken</p>
              <p className="text-2xl font-bold text-foreground">{formatTime(result.timeTaken)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">{result.correct}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{result.wrong}</p>
                <p className="text-sm text-muted-foreground">Wrong</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <MinusCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {result.totalQuestions - result.attempted}
                </p>
                <p className="text-sm text-muted-foreground">Unanswered</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <Target className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-foreground">-{result.negativeMarks}</p>
                <p className="text-sm text-muted-foreground">Negative Marks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result?.answers?.map((answer: any, index: number) => {
  const question = questions?.find((q: any) => q.id === answer.questionId)

  if (!question) return null

  const isCorrect = answer.isCorrect
  const isAttempted = answer.selectedAnswer !== null

  return (
    <div
      key={answer.questionId}
      className="rounded-lg border border-border p-4"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {index + 1}
          </span>

          <span className="text-xs text-muted-foreground">
            {question.difficulty || "N/A"}
          </span>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            !isAttempted
              ? "bg-muted text-muted-foreground"
              : isCorrect
              ? "bg-success/20 text-success"
              : "bg-destructive/20 text-destructive"
          }`}
        >
          {!isAttempted ? "0" : isCorrect ? "+1" : "-1"}
        </span>
      </div>

      <p className="mb-3 font-medium text-foreground">
        {question.questionText}
      </p>

      <div className="space-y-2">
       {question.options?.map((option: string, optIndex: number) => {
  const isSelected = answer.selectedAnswer === optIndex

let correctIndex = -1

if (typeof question.correctAnswer === "number") {
  correctIndex = question.correctAnswer
} else {
  correctIndex = question.options.findIndex(
    (opt: string) =>
      opt.toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()
  )
}

  const isCorrectOption = optIndex === correctIndex
  

  return (
    <div
      key={optIndex}
      className={`rounded-lg border p-3 ${
  isCorrectOption
    ? "border-green-500 bg-green-100 text-green-700"
    : isSelected
    ? "border-red-500 bg-red-100 text-red-700"
    : "border-border"
}`}
    >
      <span className="mr-2 font-medium">
        {String.fromCharCode(65 + optIndex)}.
      </span>

      {option}

      {/* Show correct answer ALWAYS */}
{isCorrectOption && (
  <span className="ml-2 text-green-600 font-semibold">✔</span>
)}

{/* Show wrong answer if selected AND wrong */}
{isSelected && !isCorrectOption && (
  <span className="ml-2 text-red-600">(Your Answer)</span>
)}

    </div>
  )
})}
      </div>
{isCorrect && (
  <span className="ml-2 text-green-600">(Correct)</span>
)}
      {!isCorrect && isAttempted && (
        <p className="mt-2 text-sm text-success">
          Correct Answer:{" "}
          {String.fromCharCode(65 + question.correctAnswer)}.{" "}
          {question.options?.[question.correctAnswer]}
        </p>
      )}
    </div>
  )
})}
        </CardContent>
      </Card>

      {/* Generate Feedback Button */}
      <div className="flex justify-center pb-8">
        <Button
          size="lg"
          onClick={handleGenerateFeedback}
          disabled={isGeneratingFeedback}
          className="bg-primary text-primary-foreground shadow-lg hover:bg-accent"
        >
          {isGeneratingFeedback ? (
            'Generating Feedback...'
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" /> Generate Feedback
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
