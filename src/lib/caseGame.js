// The mystery game's state: which clues are found, when the hunt started, when it was solved.
// A tiny shared store (any component can read it with useCase), saved in localStorage so a reload
// keeps your progress. Clue finds and the solve are sent to analytics.
import { useSyncExternalStore } from 'react'
import { mystery } from '../content.js'
import { track } from './analytics.js'

const KEY = 'cf-case'
const TOTAL = mystery.clues.length
const listeners = new Set()

const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    if (v && Array.isArray(v.found)) return v
  } catch {}
  return { found: [], startedAt: 0, solvedAt: 0, lastFound: '' }
}
let state = load()

const save = (next) => {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
  listeners.forEach((l) => l())
}

export const subscribe = (l) => (listeners.add(l), () => listeners.delete(l))
export const getCase = () => state

/** Bag a clue. Returns true if it was new. */
export function findClue(id) {
  if (state.found.includes(id)) return false
  const now = Date.now()
  const found = [...state.found, id]
  save({ ...state, found, startedAt: state.startedAt || now, lastFound: id })
  track('clue_found', { clue: id, count: found.length })
  return true
}

export function solveCase() {
  if (state.solvedAt) return
  const now = Date.now()
  save({ ...state, solvedAt: now })
  track('case_solved', { seconds: Math.round((now - state.startedAt) / 1000) })
}

export function wrongAccusation(answer) {
  track('case_wrong_answer', { answer })
}

export function resetCase() {
  save({ found: [], startedAt: 0, solvedAt: 0, lastFound: '' })
  track('case_reset')
}

export const totalClues = TOTAL
export const allFound = (s = state) => s.found.length >= TOTAL

/** "2:14" from the hunt's start to its solve (or now). */
export function caseTime(s = state) {
  if (!s.startedAt) return '0:00'
  const secs = Math.max(0, Math.round(((s.solvedAt || Date.now()) - s.startedAt) / 1000))
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}

export function useCase() {
  return useSyncExternalStore(subscribe, getCase, getCase)
}
