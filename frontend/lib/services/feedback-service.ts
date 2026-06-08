// Feedback Service - handles learning analysis and feedback
// Currently uses localStorage, can be replaced with MongoDB later

import type { Feedback, ConceptScore, QuizResult } from '@/lib/types'


const STORAGE_KEYS = {
  FEEDBACKS: 'feedbacks',
  CURRENT_FEEDBACK: 'currentFeedback',
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all feedbacks
export function getAllFeedbacks(): Feedback[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.FEEDBACKS)
  return data ? JSON.parse(data) : []
}

// Save all feedbacks
function saveAllFeedbacks(feedbacks: Feedback[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks))
}

// Generate feedback from quiz result
export function generateFeedback(quizResult: QuizResult): Feedback {
  // Analyze concepts from the quiz
  const conceptStats: Record<string, { correct: number; total: number }> = {}

 quizResult.questions?.forEach((q: any, index: number) => {
  const concept = q.concept || "General"
  const answer = quizResult.answers[index]

  if (!conceptStats[concept]) {
    conceptStats[concept] = { correct: 0, total: 0 }
  }

  conceptStats[concept].total++

  if (answer?.isCorrect) {
    conceptStats[concept].correct++
  }
})
  // Calculate scores and categorize
  const conceptScores: ConceptScore[] = Object.entries(conceptStats).map(
    ([concept, stats]) => ({
      concept,
      score: Math.round((stats.correct / stats.total) * 100),
    })
  )

  // Categorize concepts
  const strongConcepts = conceptScores.filter((c) => c.score >= 70)
  const mediumConcepts = conceptScores.filter((c) => c.score >= 40 && c.score < 70)
  const weakConcepts = conceptScores.filter((c) => c.score < 40)

  // Generate suggestions
  const suggestions = generateSuggestions(strongConcepts, mediumConcepts, weakConcepts)

  const feedback: Feedback = {
    id: generateId(),
    oduserId: quizResult.oduserId,
    quizResultId: quizResult.id,
    date: new Date().toISOString(),
    strongConcepts,
    mediumConcepts,
    weakConcepts,
    suggestions,
  }

  // Save feedback
  const allFeedbacks = getAllFeedbacks()
  allFeedbacks.push(feedback)
  saveAllFeedbacks(allFeedbacks)

  // Set as current feedback
  setCurrentFeedback(feedback)

  return feedback
}

// Generate AI-style suggestions
function generateSuggestions(
  strong: ConceptScore[],
  medium: ConceptScore[],
  weak: ConceptScore[]
): string[] {
  const suggestions: string[] = []

  if (weak.length > 0) {
    suggestions.push(
      `Focus on improving your understanding of ${weak.map((c) => c.concept).join(', ')}. These concepts need immediate attention.`
    )
    suggestions.push(
      'Consider revisiting the fundamentals and practicing more problems in your weak areas.'
    )
  }

  if (medium.length > 0) {
    suggestions.push(
      `Your knowledge in ${medium.map((c) => c.concept).join(', ')} is developing. Regular practice will help solidify these concepts.`
    )
  }

  if (strong.length > 0) {
    suggestions.push(
      `Great work on ${strong.map((c) => c.concept).join(', ')}! Keep revising to maintain your strong performance.`
    )
  }

  if (weak.length === 0 && medium.length === 0) {
    suggestions.push(
      'Excellent performance! You have a strong grasp of all concepts. Consider exploring advanced topics.'
    )
  }

  return suggestions
}

// Get current feedback
export function getCurrentFeedback(): Feedback | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_FEEDBACK)
  return data ? JSON.parse(data) : null
}

// Set current feedback
export function setCurrentFeedback(feedback: Feedback): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CURRENT_FEEDBACK, JSON.stringify(feedback))
}

// Get feedback by quiz result ID
export function getFeedbackByQuizResultId(quizResultId: string): Feedback | undefined {
  return getAllFeedbacks().find((f) => f.quizResultId === quizResultId)
}

// Get all feedbacks for a user
export function getFeedbacksByUserId(userId: string): Feedback[] {
  return getAllFeedbacks().filter((f) => f.oduserId === userId)
}

// Get latest feedback for a user
export function getLatestFeedback(userId: string): Feedback | undefined {
  const userFeedbacks = getFeedbacksByUserId(userId)
  if (userFeedbacks.length === 0) return undefined
  return userFeedbacks.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]
}
