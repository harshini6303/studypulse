// Types that map to future MongoDB collections

// students collection
export interface Student {
  id: string
  fullName: string
  username: string
  email: string
  password: string // In production, this should be hashed
  createdAt: string
  settings?: UserSettings
}

export interface UserSettings {
  darkMode: boolean
}

// questions collection
export interface Question {
  id: string
  subject: Subject
  difficulty: Difficulty
  questionText: string
  options: string[]
  correctAnswer: number // index of correct option
  concept: string // for feedback analysis
}

// scores collection
export interface QuizResult {
  id: string
  oduserId: string // Maps to students collection - named for future MongoDB compatibility
  subject: Subject
  date: string
  totalQuestions: number
  attempted: number
  correct: number
  wrong: number
  score: number
  negativeMarks: number
  accuracy: number
  timeTaken: number // in seconds
  answers: QuestionAnswer[]
  questions?: any[]
}

export interface QuestionAnswer {
  questionId: string
  selectedAnswer: number | null
  isCorrect: boolean
  markedForReview: boolean
}

// feedback collection
export interface Feedback {
  id: string
  oduserId: string // Maps to students collection - named for future MongoDB compatibility
  quizResultId: string
  date: string
  strongConcepts: ConceptScore[]
  mediumConcepts: ConceptScore[]
  weakConcepts: ConceptScore[]
  suggestions: string[]
}

export interface ConceptScore {
  concept: string
  score: number
}

// timetable collection
export interface TimetableEntry {
  id: string
  oduserId: string // Maps to students collection - named for future MongoDB compatibility
  feedbackId: string
  date: string
  studyHours: number
  items: TimetableItem[]
}

export interface TimetableItem {
  id: string
  concept: string
  timeMinutes: number
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

// Enums and constants
export type Subject = 'DSA' | 'DBMS' | 'OS' | 'CN' | 'Java'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export const SUBJECT_FULL_NAMES: Record<Subject, string> = {
  DSA: 'Data Structures and Algorithms',
  DBMS: 'Database Management System',
  OS: 'Operating Systems',
  CN: 'Computer Networks',
  Java: 'Java Programming',
}

export const DIFFICULTY_TIMES: Record<Difficulty, number> = {
  Easy: 7 * 60, // 5 minutes in seconds
  Medium: 10 * 60, // 7 minutes in seconds
  Hard: 15 * 60, // 10 minutes in seconds
}

// Timer state for persistence
export interface TimerState {
  subject: Subject
  difficulty: Difficulty
  remainingTime: number
  startedAt: string
}

// Test state for persistence
export interface TestState {
  subject: Subject
  currentDifficulty: Difficulty
  currentQuestionIndex: number
  answers: Record<string, number | null>
  markedForReview: Set<string> | string[]
  timerStates: Record<Difficulty, number>
}
