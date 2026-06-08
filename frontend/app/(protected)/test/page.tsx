"use client";
import { useState, useEffect, useCallback } from 'react'
import { Timer } from "@/components/timer"
import { useRouter } from 'next/navigation'
import { useSearchParams } from "next/navigation";
import { getQuestions } from "@/lib/services/question-service";

import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  ArrowLeft
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const QUESTIONS_PER_DIFFICULTY = 10



// ===================== UTIL FUNCTIONS =====================

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

const shuffle = (arr: any[]) => {
  return [...arr].sort(() => Math.random() - 0.5)
}

const getDifficultyIndex = (d: string) => DIFFICULTIES.indexOf(d)

const calculatePercentage = (correct: number, total: number) => {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}
const SUBJECT_FULL_NAMES: Record<string, string> = {
  DSA: "Data Structures and Algorithms",
  DBMS: "Database Management Systems",
  OS: "Operating Systems",
  CN: "Computer Networks",
  Java: "Java Programming"
}


// ===================== COMPONENT =====================

export default function TestPage() {
  const [startTime] = useState(Date.now())
  const [timeTaken, setTimeTaken] = useState(0)

 const TOTAL_TIME = 35 * 60   // 35 minutes

const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)



  const router = useRouter()
  const searchParams = useSearchParams();
const subject = (searchParams.get("subject") || "DSA").toUpperCase();
const handleAnswerSelect = (index: number) => {
  const currentQuestion = questions[currentQuestionIndex]

  if (!currentQuestion) return

 setAnswers((prev) => ({
  ...prev,
  [currentQuestion.id]: index,
}))
}
  

  // ===================== STATES =====================
  
 
 
  const [questions, setQuestions] = useState<any[]>([])
  const [currentDifficulty, setCurrentDifficulty] = useState('Easy')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
   const [answers, setAnswers] = useState<{ [key: string]: number }>({})

  
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())


  const [isLoading, setIsLoading] = useState(true)

  const [isSubmitted, setIsSubmitted] = useState(false)
  const handleTimeUp = () => {
  handleSubmit()
}

const handleTimerUpdate = (time: number) => {

}




const handleQuestionJump = (index: number) => {
  setCurrentQuestionIndex(index)
}

const getQuestionStatus = (index: number) => {
  const q = questions[index]
  if (!q) return "not-attempted"

  if (markedForReview.has(q.id)) return "marked"
  if (answers[q.id] !== undefined) return "attempted"
  return "not-attempted"
}
const currentQuestion = questions[currentQuestionIndex];

const globalIndex = currentQuestionIndex

const isFirstQuestion = currentQuestionIndex === 0
const isLastQuestion = currentQuestionIndex === questions.length - 1

const totalQuestions = questions.length
const handleMarkForReview = () => {
  setMarkedForReview((prev) => {
    const newSet = new Set(prev)
    if (newSet.has(currentQuestion.id)) {
      newSet.delete(currentQuestion.id)
    } else {
      newSet.add(currentQuestion.id)
    }
    return newSet
  })
}
useEffect(() => {
  if (currentQuestionIndex < 10) {
    setCurrentDifficulty("Easy")
  } else if (currentQuestionIndex < 20) {
    setCurrentDifficulty("Medium")
  } else {
    setCurrentDifficulty("Hard")
  }
}, [currentQuestionIndex])
  // ===================== FETCH =====================


useEffect(() => {
  const subjectParam = searchParams.get("subject")

  const subject = subjectParam?.toUpperCase()

  if (!subject) {
    console.error("No subject received")
    return
  }

  console.log("Loading subject:", subject)

  const data = getQuestions(subject)

  const formatted = data.map((q: any, i: number) => ({
    id: i.toString(),
    questionText: q.question,
    options: q.options,
    correctAnswer: q.options.indexOf(q.correctAnswer),
    difficulty: q.difficulty,
    concept: q.concept
  }))

  setQuestions(formatted)
  setCurrentQuestionIndex(0)
  setIsLoading(false)
}, [searchParams])
  // ===================== TIMER =====================
 useEffect(() => {
  const interval = setInterval(() => {
    setTimeTaken(Math.floor((Date.now() - startTime) / 1000))
  }, 1000)

  return () => clearInterval(interval)
}, [startTime])
 useEffect(() => {
  if (timeLeft <= 0) {
    handleSubmit()
    return
  }

  const timer = setInterval(() => {
    setTimeLeft(prev => prev - 1)
  }, 1000)

  return () => clearInterval(timer)
}, [timeLeft])
  // ===================== CURRENT =====================
  const currentQuestions = questions

if (isLoading) return <div>Loading...</div>;

if (!questions.length) return <div>No questions found</div>;

if (!questions[currentQuestionIndex]) {
  return <div>Loading question...</div>;
}


  // ===================== NAV =====================
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }
 

 const handleSubmit = () => {
  let correct = 0
  let wrong = 0
  let unanswered = 0

  const formattedAnswers = questions.map((q) => {
    const userAnswer = answers[q.id]

    if (userAnswer === undefined) {
      unanswered++
      return {
        questionId: q.id,
        selectedAnswer: null,
        isCorrect: false,
        markedForReview: false,
      }
    }

    const isCorrect = userAnswer === q.correctAnswer
    if (isCorrect) correct++
    else wrong++

    return {
      questionId: q.id,
      selectedAnswer: userAnswer,
      isCorrect,
      markedForReview: false,
    }
  })

  const score = correct - wrong

  const endTime = Date.now()
  const timeTaken = Math.floor((endTime - startTime) / 1000)
  

  // ===================== CONCEPT ANALYSIS =====================
  const conceptStats: Record<string, { correct: number; total: number }> = {}

  formattedAnswers.forEach((ans, i) => {
    const question = questions[i]
    const concept = question.concept || "General"

    if (!conceptStats[concept]) {
      conceptStats[concept] = { correct: 0, total: 0 }
    }

    conceptStats[concept].total++

    if (ans.isCorrect) {
      conceptStats[concept].correct++
    }
  })

  const conceptPerformance = Object.entries(conceptStats).map(
    ([concept, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100

      let level = "weak"
      if (accuracy >= 75) level = "strong"
      else if (accuracy >= 40) level = "medium"

      return { concept, accuracy, level }
    }
  )

  // ===================== RESULT =====================
  const result = {
  date: new Date().toISOString(),
  subject: subject,
  totalQuestions: questions.length,
  attempted: correct + wrong,
  correct,
  wrong,
  unanswered,
  score,
  negativeMarks: wrong,
  accuracy: Math.round((correct / questions.length) * 100),
  timeTaken,
  answers: formattedAnswers,
  questions: questions,
  conceptPerformance
}

  // ===================== STORAGE =====================
  const existing = JSON.parse(localStorage.getItem("quizResults") || "[]")
  existing.push(result)
  localStorage.setItem("quizResults", JSON.stringify(existing))

  localStorage.setItem("quizResult", JSON.stringify(result))

  router.push("/result")
}
// ===================== STATUS =====================
  const getStatus = (q: any) => {
    if (markedForReview.has(q.id)) return 'yellow'
    if (answers[q.id] !== undefined) return 'green'
    return 'red'
  }

  

  // ===================== UI =====================
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="mb-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {SUBJECT_FULL_NAMES[subject]}
          </h1>
        </div>
    <div className={`text-lg font-semibold ${
  timeLeft <= 60 ? "text-red-500 animate-pulse" : ""
}`}>
  ⏱ {formatTime(timeLeft)}
</div>
      </div>
 <div className={`text-lg font-semibold ${
  timeLeft <= 60 ? "text-red-500 animate-pulse" : ""
}`}>
  ⏱ {formatTime(timeLeft)}
</div>

      {/* Difficulty Tabs */}
      <div className="flex rounded-lg bg-card p-1 shadow-sm">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff}
            onClick={() => {
             const handleDifficultyChange = (diff: string) => {
  setCurrentDifficulty(diff)

  if (diff === "Easy") setCurrentQuestionIndex(0)
  else if (diff === "Medium") setCurrentQuestionIndex(10)
  else setCurrentQuestionIndex(20)
}
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              currentDifficulty === diff
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Question Section */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-foreground">
                <span>Question {globalIndex + 1} of {totalQuestions}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {currentDifficulty} Level
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <p className="text-lg text-foreground">{currentQuestion.questionText}</p>

              {/* Options */}
          <div className="space-y-3">
  {(currentQuestion.options || []).map((option: string, index: number) => {
    const isSelected = answers[currentQuestion.id] === index

    return (
      <button
        key={index}
        onClick={() => handleAnswerSelect(index)}
        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
          isSelected
            ? "border-primary bg-primary/10 text-foreground"
            : "border-border hover:border-accent"
        }`}
      >
        {option}
      </button>
    )
  })}
</div>

              {/* Navigation Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstQuestion}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isLastQuestion}
                  className="bg-primary text-primary-foreground hover:bg-accent"
                >
                  Save & Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleMarkForReview}
                  className={`border-border ${
                    markedForReview.has(currentQuestion.id)
                      ? 'bg-info text-info-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="ml-auto bg-success text-success-foreground hover:bg-success/90"
                >
                  <Send className="mr-2 h-4 w-4" /> Submit Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Status Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Question Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-success" />
                  <span className="text-muted-foreground">Attempted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-destructive" />
                  <span className="text-muted-foreground">Not Attempted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-info" />
                  <span className="text-muted-foreground">Marked for Review</span>
                </div>
              </div>

              {/* Question Numbers */}
              {DIFFICULTIES.map((diff, diffIndex) => (
                <div key={diff}>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">{diff}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: QUESTIONS_PER_DIFFICULTY }).map((_, qIndex) => {
                      const globalIdx = diffIndex * QUESTIONS_PER_DIFFICULTY + qIndex
                      const status = getQuestionStatus(globalIdx)
                      const isCurrentQuestion = globalIdx === globalIndex
                      return (
                        <button
                          key={qIndex}
                          onClick={() => handleQuestionJump(globalIdx)}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            isCurrentQuestion
                              ? 'ring-2 ring-primary ring-offset-2'
                              : ''
                          } ${
                            status === 'attempted'
                              ? 'bg-success text-success-foreground'
                              : status === 'marked'
                              ? 'bg-info text-info-foreground'
                              : 'bg-destructive/80 text-destructive-foreground'
                          }`}
                        >
                          {globalIdx + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}