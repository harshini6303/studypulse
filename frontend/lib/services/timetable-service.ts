// Timetable Service - handles study timetable generation
// Currently uses localStorage, can be replaced with MongoDB later

import type { TimetableEntry, TimetableItem, Feedback } from '@/lib/types'

const STORAGE_KEYS = {
  TIMETABLES: 'timetables',
  CURRENT_TIMETABLE: 'currentTimetable',
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all timetables
export function getAllTimetables(): TimetableEntry[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.TIMETABLES)
  return data ? JSON.parse(data) : []
}

// Save all timetables
function saveAllTimetables(timetables: TimetableEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.TIMETABLES, JSON.stringify(timetables))
}

// Generate timetable from feedback
export function generateTimetable(
  feedback: Feedback,
  studyHoursPerDay: number
): TimetableEntry {
  const totalMinutes = studyHoursPerDay * 60
  const items: TimetableItem[] = []

  // Calculate weights based on priority
  const weakWeight = 3 // Weak concepts get 3x time
  const mediumWeight = 2 // Medium concepts get 2x time
  const strongWeight = 1 // Strong concepts get 1x time (revision)

  const totalWeight =
    feedback.weakConcepts.length * weakWeight +
    feedback.mediumConcepts.length * mediumWeight +
    feedback.strongConcepts.length * strongWeight

  if (totalWeight === 0) {
    return {
      id: generateId(),
      oduserId: feedback.oduserId,
      feedbackId: feedback.id,
      date: new Date().toISOString(),
      studyHours: studyHoursPerDay,
      items: [],
    }
  }

  const minutesPerWeight = totalMinutes / totalWeight

  // Add weak concepts (high priority)
  for (const concept of feedback.weakConcepts) {
    items.push({
      id: generateId(),
      concept: concept.concept,
      timeMinutes: Math.round(minutesPerWeight * weakWeight),
      completed: false,
      priority: 'high',
    })
  }

  // Add medium concepts
  for (const concept of feedback.mediumConcepts) {
    items.push({
      id: generateId(),
      concept: concept.concept,
      timeMinutes: Math.round(minutesPerWeight * mediumWeight),
      completed: false,
      priority: 'medium',
    })
  }

  // Add strong concepts (revision)
  for (const concept of feedback.strongConcepts) {
    items.push({
      id: generateId(),
      concept: concept.concept,
      timeMinutes: Math.round(minutesPerWeight * strongWeight),
      completed: false,
      priority: 'low',
    })
  }

  // Sort by priority (high first)
  items.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const timetable: TimetableEntry = {
    id: generateId(),
    oduserId: feedback.oduserId,
    feedbackId: feedback.id,
    date: new Date().toISOString(),
    studyHours: studyHoursPerDay,
    items,
  }

  // Save timetable
  const allTimetables = getAllTimetables()
  allTimetables.push(timetable)
  saveAllTimetables(allTimetables)

  // Set as current timetable
  setCurrentTimetable(timetable)

  return timetable
}

// Get current timetable
export function getCurrentTimetable(): TimetableEntry | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TIMETABLE)
  return data ? JSON.parse(data) : null
}

// Set current timetable
export function setCurrentTimetable(timetable: TimetableEntry): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CURRENT_TIMETABLE, JSON.stringify(timetable))
}

// Update timetable item completion status
export function updateTimetableItemCompletion(
  timetableId: string,
  itemId: string,
  completed: boolean
): void {
  const allTimetables = getAllTimetables()
  const timetableIndex = allTimetables.findIndex((t) => t.id === timetableId)

  if (timetableIndex === -1) return

  const itemIndex = allTimetables[timetableIndex].items.findIndex(
    (i) => i.id === itemId
  )

  if (itemIndex === -1) return

  allTimetables[timetableIndex].items[itemIndex].completed = completed
  saveAllTimetables(allTimetables)

  // Update current timetable if it's the same
  const currentTimetable = getCurrentTimetable()
  if (currentTimetable && currentTimetable.id === timetableId) {
    currentTimetable.items[itemIndex].completed = completed
    setCurrentTimetable(currentTimetable)
  }
}

// Get timetables by user ID
export function getTimetablesByUserId(userId: string): TimetableEntry[] {
  return getAllTimetables().filter((t) => t.oduserId === userId)
}

// Get latest timetable for a user
export function getLatestTimetable(userId: string): TimetableEntry | undefined {
  const userTimetables = getTimetablesByUserId(userId)
  if (userTimetables.length === 0) return undefined
  return userTimetables.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]
}
