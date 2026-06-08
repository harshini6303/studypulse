// Student Service - handles user authentication and management
// Currently uses localStorage, can be replaced with MongoDB later

import type { Student, UserSettings } from '@/lib/types'

const STORAGE_KEYS = {
  REGISTERED_USERS: 'registeredUsers',
  CURRENT_USER: 'currentUser',
}

// Generate unique ID (will be replaced by MongoDB ObjectId)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all registered users
export function getAllStudents(): Student[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)
  return data ? JSON.parse(data) : []
}

// Save all students
function saveAllStudents(students: Student[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(students))
}

// Register a new student
export function registerStudent(
  fullName: string,
  username: string,
  email: string,
  password: string
): { success: boolean; error?: string } {
  const students = getAllStudents()

  // Check if username or email already exists
  const existingUser = students.find(
    (s) => s.username.toLowerCase() === username.toLowerCase() || s.email.toLowerCase() === email.toLowerCase()
  )

  if (existingUser) {
    if (existingUser.username.toLowerCase() === username.toLowerCase()) {
      return { success: false, error: 'Username already exists' }
    }
    return { success: false, error: 'Email already registered' }
  }

  const newStudent: Student = {
    id: generateId(),
    fullName,
    username,
    email,
    password, // In production, hash this password
    createdAt: new Date().toISOString(),
    settings: { darkMode: false },
  }

  students.push(newStudent)
  saveAllStudents(students)

  return { success: true }
}

// Login student (accepts username or email)
export function loginStudent(
  usernameOrEmail: string,
  password: string
): { success: boolean; student?: Student; error?: string } {
  const students = getAllStudents()

  const student = students.find(
    (s) =>
      (s.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        s.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
      s.password === password
  )

  if (!student) {
    return { success: false, error: 'Invalid username/email or password' }
  }

  // Save current user session
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(student))
  }

  return { success: true, student }
}

// Get current logged in user
export function getCurrentUser(): Student | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

// Logout current user
export function logoutUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

// Find user by username or email
export function findUserByUsernameOrEmail(usernameOrEmail: string): Student | null {
  const students = getAllStudents()
  return (
    students.find(
      (s) =>
        s.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        s.email.toLowerCase() === usernameOrEmail.toLowerCase()
    ) || null
  )
}

// Reset password
export function resetPassword(
  usernameOrEmail: string,
  newPassword: string
): { success: boolean; error?: string } {
  const students = getAllStudents()
  const index = students.findIndex(
    (s) =>
      s.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
      s.email.toLowerCase() === usernameOrEmail.toLowerCase()
  )

  if (index === -1) {
    return { success: false, error: 'User not found' }
  }

  students[index].password = newPassword
  saveAllStudents(students)

  return { success: true }
}

// Update user settings
export function updateUserSettings(userId: string, settings: Partial<UserSettings>): void {
  const students = getAllStudents()
  const index = students.findIndex((s) => s.id === userId)

  if (index !== -1) {
    students[index].settings = { ...students[index].settings, ...settings } as UserSettings
    saveAllStudents(students)

    // Update current user if it's the same user
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      currentUser.settings = students[index].settings
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser))
    }
  }
}

// Update user profile
export function updateUserProfile(
  userId: string,
  updates: { fullName?: string; email?: string }
): { success: boolean; error?: string } {
  const students = getAllStudents()
  const index = students.findIndex((s) => s.id === userId)

  if (index === -1) {
    return { success: false, error: 'User not found' }
  }

  // Check if email is being changed to one that already exists
  if (updates.email) {
    const emailExists = students.find(
      (s) => s.email.toLowerCase() === updates.email!.toLowerCase() && s.id !== userId
    )
    if (emailExists) {
      return { success: false, error: 'Email already in use' }
    }
  }

  if (updates.fullName) students[index].fullName = updates.fullName
  if (updates.email) students[index].email = updates.email

  saveAllStudents(students)

  // Update current user if it's the same user
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === userId) {
    if (updates.fullName) currentUser.fullName = updates.fullName
    if (updates.email) currentUser.email = updates.email
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser))
  }

  return { success: true }
}
