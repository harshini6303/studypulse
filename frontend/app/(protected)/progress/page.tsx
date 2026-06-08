"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown, 
  Award,
  Target,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { getCurrentUser } from '@/lib/services/student-service'
import { getQuizResultsByUserId, getSubjectStats } from '@/lib/services/score-service'
import type { Subject, QuizResult } from '@/lib/types'

const SUBJECTS: Subject[] = ['DSA', 'DBMS', 'OS', 'CN', 'Java']


const SUBJECT_COLORS: Record<Subject, string> = {
  DSA: '#1e40af',    // Dark blue
  DBMS: '#2563eb',   // Blue
  OS: '#3b82f6',     // Light blue
  CN: '#60a5fa',     // Lighter blue
  Java: '#93c5fd',   // Lightest blue
}

interface ChartDataPoint {
  date: string
  attempt: number
  [key: string]: number | string
}

export default function ProgressPage() {
  const [results, setResults] = useState<any[]>([])
useEffect(() => {
  const data = JSON.parse(localStorage.getItem("quizResults") || "[]")
  setResults(data)
}, [])
useEffect(() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("quizResults")
    if (stored) {
      setResults(JSON.parse(stored))
    }
  }
}, [])

const graphData = results.map((r: any, index: number) => {
  const point: any = { attempt: index + 1 }

  SUBJECTS.forEach((sub) => {
    if (r.subject?.toLowerCase() === sub.toLowerCase()) {
      point[sub] = r.accuracy
    } else {
      point[sub] = undefined   // 🔥 IMPORTANT CHANGE
    }
  })

  return point
})
const SUBJECTS_LIST = ["DSA", "DBMS", "OS", "CN", "Java"]

const calculatedStats = SUBJECTS_LIST.reduce((acc: any, sub) => {
  const tests = results.filter((r: any) => r.subject.toLowerCase() === sub.toLowerCase())

  const attempts = tests.length

  const avgAccuracy =
    attempts > 0
      ? tests.reduce((sum: number, t: any) => sum + t.accuracy, 0) / attempts
      : 0

  const avgScore =
    attempts > 0
      ? tests.reduce((sum: number, t: any) => sum + t.score, 0) / attempts
      : 0

  const bestScore =
    attempts > 0 ? Math.max(...tests.map((t: any) => t.score)) : 0

  acc[sub] = {
    totalAttempts: attempts,
    avgScore: Math.round(avgScore),
    avgAccuracy: Math.round(avgAccuracy),
    bestScore,
  }

  return acc
}, {})

useEffect(() => {
  setStats(calculatedStats)
}, [results])
  const router = useRouter()

 const [stats, setStats] = useState<any>(null)
  const [bestSubject, setBestSubject] = useState<Subject | null>(null)
  const [mostImproved, setMostImproved] = useState<Subject | null>(null)
  const [needsFocus, setNeedsFocus] = useState<Subject | null>(null)
  useEffect(() => {
  if (typeof window !== "undefined") {
    const data = JSON.parse(localStorage.getItem("quizResults") || "[]")
    setResults(data)
  }
}, [])

  

  

  const processChartData = (results: QuizResult[]): ChartDataPoint[] => {
    // Group results by date and create chart data points
    const dataByAttempt: Map<number, ChartDataPoint> = new Map()
    const attemptCounts: Record<Subject, number> = {
      DSA: 0, DBMS: 0, OS: 0, CN: 0, Java: 0
    }

    // Sort results by date
    const sortedResults = [...results].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedResults.forEach((result) => {
      attemptCounts[result.subject]++
      const attemptNum = attemptCounts[result.subject]
      
      if (!dataByAttempt.has(attemptNum)) {
        dataByAttempt.set(attemptNum, {
          date: new Date(result.date).toLocaleDateString(),
          attempt: attemptNum,
        })
      }
      
      const dataPoint = dataByAttempt.get(attemptNum)!
      dataPoint[result.subject] = result.accuracy
    })

    return Array.from(dataByAttempt.values())
  }

  const calculateInsights = (
    subjectStats: Record<Subject, { totalAttempts: number; avgScore: number; avgAccuracy: number; bestScore: number }>,
    results: QuizResult[]
  ) => {
    // Find best subject (highest average accuracy)
    let best: Subject | null = null
    let bestAccuracy = -1
    let worst: Subject | null = null
    let worstAccuracy = 101

    SUBJECTS.forEach((subject) => {
      if (subjectStats[subject].totalAttempts > 0) {
        if (subjectStats[subject].avgAccuracy > bestAccuracy) {
          bestAccuracy = subjectStats[subject].avgAccuracy
          best = subject
        }
        if (subjectStats[subject].avgAccuracy < worstAccuracy) {
          worstAccuracy = subjectStats[subject].avgAccuracy
          worst = subject
        }
      }
    })

    setBestSubject(best)
    setNeedsFocus(worst)

    // Find most improved (compare first and last attempt)
    let maxImprovement = -Infinity
    let improved: Subject | null = null

    SUBJECTS.forEach((subject) => {
      const subjectResults = results
        .filter((r) => r.subject === subject)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (subjectResults.length >= 2) {
        const improvement =
          subjectResults[subjectResults.length - 1].accuracy - subjectResults[0].accuracy
        if (improvement > maxImprovement) {
          maxImprovement = improvement
          improved = subject
        }
      }
    })

    setMostImproved(improved)
  }

  const hasData = graphData.length > 0

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
        <h1 className="text-3xl font-bold text-foreground">Progress Graph</h1>
        <p className="text-muted-foreground">
          Track your subject-wise progress over time
        </p>
      </div>

      {/* Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Accuracy Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
     
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="attempt" 
                    label={{ value: 'Attempt', position: 'insideBottom', offset: -5 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(label) => `Attempt ${label}`}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                  <Legend />
                  {SUBJECTS.map((subject) => (
                    <Line
                      key={subject}
                      type="monotone"
                      dataKey={subject}
                      stroke={SUBJECT_COLORS[subject]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-warning" />
                <p className="mt-4 text-lg font-medium text-foreground">No Data Available</p>
                <p className="text-muted-foreground">
                  Complete some tests to see your progress graph
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-accent"
                >
                  Take a Test
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      {hasData && (
        <div className="grid gap-4 md:grid-cols-3">
          {bestSubject && (
            <Card className="border-success/30 bg-success/10">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-success/20 p-3">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Subject</p>
                  <p className="text-xl font-bold text-foreground">{bestSubject}</p>
                  <p className="text-sm text-success">
                    {stats?.[bestSubject].avgAccuracy}% avg accuracy
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {mostImproved && (
            <Card className="border-info/30 bg-info/10">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-info/20 p-3">
                  <TrendingUp className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Most Improved</p>
                  <p className="text-xl font-bold text-foreground">{mostImproved}</p>
                  <p className="text-sm text-info">Keep up the good work!</p>
                </div>
              </CardContent>
            </Card>
          )}

          {needsFocus && (
            <Card className="border-warning/30 bg-warning/10">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-warning/20 p-3">
                  <Target className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Needs Focus</p>
                  <p className="text-xl font-bold text-foreground">{needsFocus}</p>
                  <p className="text-sm text-warning">
                    {stats?.[needsFocus].avgAccuracy}% avg accuracy
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Subject Statistics */}
      
      {stats && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Subject Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                      Attempts
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                      Avg Score
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                      Avg Accuracy
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                      Best Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map((subject) => (
                    <tr key={subject} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: SUBJECT_COLORS[subject] }}
                          />
                          <span className="font-medium text-foreground">{subject}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center text-muted-foreground">
                        {stats[subject].totalAttempts}
                      </td>
                      <td className="py-4 text-center text-muted-foreground">
                        {stats[subject].avgScore}
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`font-medium ${
                            stats[subject].avgAccuracy >= 70
                              ? 'text-success'
                              : stats[subject].avgAccuracy >= 40
                              ? 'text-warning'
                              : 'text-destructive'
                          }`}
                        >
                          {stats[subject].avgAccuracy}%
                        </span>
                      </td>
                      <td className="py-4 text-center text-muted-foreground">
                        {stats[subject].bestScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
