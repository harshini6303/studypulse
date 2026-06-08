// Score Service - handles quiz results
// Currently uses localStorage, can be replaced with MongoDB later

import type { QuizResult, QuestionAnswer, Subject } from '@/lib/types'

const STORAGE_KEYS = {
  QUIZ_RESULTS: 'quizResults',
  CURRENT_QUIZ_RESULT: 'currentQuizResult',
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all quiz results
export function getAllQuizResults(): QuizResult[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS)
  return data ? JSON.parse(data) : []
}

// Save all quiz results
function saveAllQuizResults(results: QuizResult[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results))
}

// Get quiz results by user ID
export function getQuizResultsByUserId(userId: string): QuizResult[] {
  return getAllQuizResults().filter((r) => r.oduserId === userId)
}

// Get quiz results by user ID and subject
export function getQuizResultsByUserAndSubject(
  userId: string,
  subject: Subject
): QuizResult[] {
  return getAllQuizResults().filter(
    (r) => r.oduserId === userId && r.subject === subject
  )
}

// Save a new quiz result
export function saveQuizResult(
  userId: string,
  subject: Subject,
  totalQuestions: number,
  answers: QuestionAnswer[],
  timeTaken: number
): QuizResult {
  const attempted = answers.filter((a) => a.selectedAnswer !== null).length
  const correct = answers.filter((a) => a.isCorrect).length
  const wrong = attempted - correct
  const score = correct - wrong // +1 for correct, -1 for wrong
  const negativeMarks = wrong
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0

  const result: QuizResult = {
    id: generateId(),
    oduserId: userId,
    subject,
    date: new Date().toISOString(),
    totalQuestions,
    attempted,
    correct,
    wrong,
    score,
    negativeMarks,
    accuracy,
    timeTaken,
    answers,
  }

  const allResults = getAllQuizResults()
  allResults.push(result)
  saveAllQuizResults(allResults)

  // Also save as current result for immediate access
  setCurrentQuizResult(result)

  return result
}

// Get current quiz result (most recent)
export function getCurrentQuizResult(): QuizResult | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_QUIZ_RESULT)
  return data ? JSON.parse(data) : null
}

// Set current quiz result
export function setCurrentQuizResult(result: QuizResult): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CURRENT_QUIZ_RESULT, JSON.stringify(result))
}

// Get quiz result by ID
export function getQuizResultById(id: string): QuizResult | undefined {
  return getAllQuizResults().find((r) => r.id === id)
}

// Get latest quiz result for user
export function getLatestQuizResult(userId: string): QuizResult | undefined {
  const userResults = getQuizResultsByUserId(userId)
  if (userResults.length === 0) return undefined
  return userResults.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]
}

// Get progress data for a user (for graphs)
export function getUserProgressData(userId: string): {
  subject: Subject
  date: string
  score: number
  accuracy: number
}[] {
  const results = getQuizResultsByUserId(userId)
  return results.map((r) => ({
    subject: r.subject,
    date: r.date,
    score: r.score,
    accuracy: r.accuracy,
  }))
}

// Get subject-wise statistics
export function getSubjectStats(userId: string): Record<Subject, {
  totalAttempts: number
  avgScore: number
  avgAccuracy: number
  bestScore: number
}> {
  const results = getQuizResultsByUserId(userId)
  const subjects: Subject[] = ['DSA', 'DBMS', 'OS', 'CN', 'Java']
  
  const stats: Record<Subject, {
    totalAttempts: number
    avgScore: number
    avgAccuracy: number
    bestScore: number
  }> = {} as typeof stats

  for (const subject of subjects) {
    const subjectResults = results.filter((r) => r.subject === subject)
    if (subjectResults.length === 0) {
      stats[subject] = {
        totalAttempts: 0,
        avgScore: 0,
        avgAccuracy: 0,
        bestScore: 0,
      }
    } else {
      const totalScore = subjectResults.reduce((sum, r) => sum + r.score, 0)
      const totalAccuracy = subjectResults.reduce((sum, r) => sum + r.accuracy, 0)
      const bestScore = Math.max(...subjectResults.map((r) => r.score))
      
      stats[subject] = {
        totalAttempts: subjectResults.length,
        avgScore: Math.round(totalScore / subjectResults.length),
        avgAccuracy: Math.round(totalAccuracy / subjectResults.length),
        bestScore,
      }
    }
  }

  return stats
}
