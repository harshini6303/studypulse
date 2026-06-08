// Timer Service - handles test timer state persistence
// Currently uses localStorage, can be replaced with MongoDB later

import type { Subject, Difficulty, TestState } from '@/lib/types'
import { DIFFICULTY_TIMES } from '@/lib/types'

const STORAGE_KEYS = {
  TIMER_STATE: 'timerState',
  TEST_STATE: 'testState',
}

// Get timer state
export function getTimerState(): Record<Difficulty, number> | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.TIMER_STATE)
  return data ? JSON.parse(data) : null
}

// Save timer state
export function saveTimerState(state: Record<Difficulty, number>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state))
}

// Initialize timer state for a new test
export function initializeTimerState(): Record<Difficulty, number> {
  const state: Record<Difficulty, number> = {
    Easy: DIFFICULTY_TIMES.Easy,
    Medium: DIFFICULTY_TIMES.Medium,
    Hard: DIFFICULTY_TIMES.Hard,
  }
  saveTimerState(state)
  return state
}

// Update remaining time for a difficulty
export function updateRemainingTime(
  difficulty: Difficulty,
  remainingTime: number
): void {
  const state = getTimerState()
  if (state) {
    state[difficulty] = remainingTime
    saveTimerState(state)
  }
}

// Clear timer state (after test completion)
export function clearTimerState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.TIMER_STATE)
}

// Get full test state
export function getTestState(): TestState | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.TEST_STATE)
  if (!data) return null
  
  const parsed = JSON.parse(data)
  // Convert markedForReview array back to Set
  if (Array.isArray(parsed.markedForReview)) {
    parsed.markedForReview = new Set(parsed.markedForReview)
  }
  return parsed
}

// Save full test state
export function saveTestState(state: TestState): void {
  if (typeof window === 'undefined') return
  // Convert Set to array for JSON serialization
  const toSave = {
    ...state,
    markedForReview: Array.from(state.markedForReview),
  }
  localStorage.setItem(STORAGE_KEYS.TEST_STATE, JSON.stringify(toSave))
}

// Initialize test state for a new test
export function initializeTestState(subject: Subject): TestState {
  const state: TestState = {
    subject,
    currentDifficulty: 'Easy',
    currentQuestionIndex: 0,
    answers: {},
    markedForReview: new Set(),
    timerStates: {
      Easy: DIFFICULTY_TIMES.Easy,
      Medium: DIFFICULTY_TIMES.Medium,
      Hard: DIFFICULTY_TIMES.Hard,
    },
  }
  saveTestState(state)
  return state
}

// Update test state
export function updateTestState(updates: Partial<TestState>): void {
  const currentState = getTestState()
  if (currentState) {
    const newState = { ...currentState, ...updates }
    saveTestState(newState)
  }
}

// Clear test state (after test completion)
export function clearTestState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.TEST_STATE)
  clearTimerState()
}

// Save selected subject
export function saveSelectedSubject(subject: Subject): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('selectedSubject', subject)
}

// Get selected subject
export function getSelectedSubject(): Subject | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('selectedSubject') as Subject | null
}

// Clear selected subject
export function clearSelectedSubject(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('selectedSubject')
}
