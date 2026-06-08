'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, BookOpen, Database, Cpu, Network, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/services/student-service'
import { saveSelectedSubject } from '@/lib/services/timer-service'
import type { Student, Subject } from '@/lib/types'
import { SUBJECT_FULL_NAMES } from '@/lib/types'

const subjectCards: { subject: Subject; icon: typeof BookOpen; description: string }[] = [
  { 
    subject: 'DSA', 
    icon: BookOpen, 
    description: 'Data Structures & Algorithms' 
  },
  { 
    subject: 'DBMS', 
    icon: Database, 
    description: 'Database Management System' 
  },
  { 
    subject: 'OS', 
    icon: Cpu, 
    description: 'Operating Systems' 
  },
  { 
    subject: 'CN', 
    icon: Network, 
    description: 'Computer Networks' 
  },
  { 
    subject: 'Java', 
    icon: Code, 
    description: 'Java Programming' 
  },
]


export default function DashboardPage() {
  
  const [results, setResults] = useState<any[]>([])
const [totalTests, setTotalTests] = useState(0)
const [avgAccuracy, setAvgAccuracy] = useState(0)
const [subjectStats, setSubjectStats] = useState<any>({})
  const router = useRouter()
  const [user, setUser] = useState<Student | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("quizResults") || "[]")

  setResults(stored)
  setTotalTests(stored.length)

  if (stored.length === 0) return

  // avg accuracy
  const avg =
    stored.reduce((sum: number, r: any) => sum + (r.accuracy || 0), 0) /
    stored.length

  setAvgAccuracy(Math.round(avg))

  // subject stats
  const stats: any = {}

  stored.forEach((r: any) => {
    const sub = r.subject

    if (!stats[sub]) {
      stats[sub] = {
        attempts: 0,
        totalAccuracy: 0,
      }
    }

    stats[sub].attempts++
    stats[sub].totalAccuracy += r.accuracy || 0
  })

  Object.keys(stats).forEach((sub) => {
    stats[sub].avgAccuracy =
      Math.round(stats[sub].totalAccuracy / stats[sub].attempts)
  })

  setSubjectStats(stats)
}, [])
 
  useEffect(() => {
  console.log("Selected Subject:", selectedSubject)
}, [selectedSubject])

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject)
  }

  const handleStartTest = () => {
    if (selectedSubject) {
       console.log("Starting test with:", selectedSubject)
      saveSelectedSubject(selectedSubject)
      router.push(`/test?subject=${selectedSubject}`)
    }
  }

  return (
    
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
          Welcome, <span className="text-primary">{user?.fullName || 'Student'}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select a subject and start your assessment journey
        </p>
      </div>

      {/* Subject Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Choose Your Subject</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {subjectCards.map(({ subject, icon: Icon, description }) => {
            const isSelected = selectedSubject === subject
            return (
              <Card
                key={subject}
                onClick={() => handleSubjectSelect(subject)}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-2 border-primary bg-primary/10 shadow-lg animate-pulse-glow'
                    : 'border-border bg-card hover:border-accent hover:shadow-md'
                }`}
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div
                    className={`mb-4 rounded-full p-4 transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{subject}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Selected Subject Info */}
      {selectedSubject && (
        <Card className="animate-fade-in border-primary/30 bg-card">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Selected: {SUBJECT_FULL_NAMES[selectedSubject]}
              </h3>
              <p className="text-sm text-muted-foreground">
                Test includes Easy, Medium, and Hard questions with timed sections
              </p>
            </div>
            <Button
              onClick={handleStartTest}
              size="lg"
              className="w-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-accent hover:shadow-xl sm:w-auto"
            >
              <Play className="mr-2 h-5 w-5" /> Start Test
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-border bg-card/50">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Test Instructions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              Each test has 3 difficulty levels: Easy , Medium , Hard (35 min)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              Questions progress from Easy to Medium to Hard
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              Scoring: +1 for correct, -1 for wrong, 0 for unanswered
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              You can mark questions for review and jump between questions
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              Timer persists even when navigating between questions
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
