'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Target,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { getCurrentUser } from '@/lib/services/student-service'

import type { Subject, QuizResult } from '@/lib/types'

const SUBJECTS: Subject[] = ['DSA', 'DBMS', 'OS', 'CN', 'Java']

const SUBJECT_COLORS: Record<Subject, string> = {
  DSA: '#1e40af',
  DBMS: '#2563eb',
  OS: '#3b82f6',
  CN: '#60a5fa',
  Java: '#93c5fd',
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [results, setResults] = useState<QuizResult[]>([])
  const [stats, setStats] = useState<Record<
    Subject,
    {
      totalAttempts: number
      avgScore: number
      avgAccuracy: number
      bestScore: number
    }
  > | null>(null)

useEffect(() => {
  const user = getCurrentUser()

  if (!user) {
    router.push('/')
    return
  }

  // 🔥 READ FROM LOCAL STORAGE (THIS IS THE FIX)
  const stored = JSON.parse(localStorage.getItem("quizResults") || "[]")

  setResults(stored)
}, [router])

  const totalTests = results.length



const subjects = ["DSA", "DBMS", "OS", "CN", "Java"]

const barChartData = subjects.map((sub) => {
  const filtered = results.filter((r: any) => r.subject.toLowerCase() === sub.toLowerCase())

  return {
    subject: sub,
    attempts: filtered.length,
    accuracy:
      filtered.length > 0
        ? Math.round(
            filtered.reduce((sum: number, r: any) => sum + (r.accuracy || 0), 0) /
              filtered.length
          )
        : 0,
  }
})

const avgAccuracy =
  results.length > 0
    ? Math.round(
        results.reduce((sum: number, r: any) => sum + r.accuracy, 0) /
          results.length
      )
    : 0

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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>

        <p className="text-muted-foreground">
          Comprehensive overview of your learning journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/20 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Tests</p>
              <p className="text-2xl font-bold text-foreground">
                {totalTests}
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
              <p className="text-sm text-muted-foreground">
                Average Accuracy
              </p>
              <p className="text-2xl font-bold text-foreground">
                {avgAccuracy}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            Subject Performance
          </CardTitle>
        </CardHeader>

        <CardContent>
          {barChartData.some((d) => d.attempts > 0) ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />

                  <XAxis
                    dataKey="subject"
                    className="text-muted-foreground"
                  />

                  <YAxis
                    domain={[0, 100]}
                    className="text-muted-foreground"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [
                      `${value}%`,
                      'Accuracy',
                    ]}
                  />

                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry) => (
                      <Cell
                        key={entry.subject}
                        fill={SUBJECT_COLORS[entry.subject as keyof typeof SUBJECT_COLORS]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No data available. Complete some tests to see analytics.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tests */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Tests</CardTitle>
        </CardHeader>

        <CardContent>
          {results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Date
                    </th>

                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Subject
                    </th>

                    <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                      Score
                    </th>

                    <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                      Accuracy
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {results
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() -
                        new Date(a.date).getTime()
                    )
                    .slice(0, 10)
                    .map((result) => (
                      <tr
                        key={result.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-4 text-sm text-foreground">
                          {new Date(result.date).toLocaleDateString()}
                        </td>

                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  SUBJECT_COLORS[result.subject],
                              }}
                            />

                            <span className="font-medium text-foreground">
                              {result.subject}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 text-center text-foreground">
                          {result.score}/{result.totalQuestions}
                        </td>

                        <td className="py-4 text-center">
                          <span
                            className={`font-medium ${
                              result.accuracy >= 70
                                ? 'text-success'
                                : result.accuracy >= 40
                                ? 'text-warning'
                                : 'text-destructive'
                            }`}
                          >{Number(result.accuracy).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No tests completed yet. Start a test to see your analytics.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
