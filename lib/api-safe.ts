/**
 * Runtime validation helpers for API responses
 * Catches schema mismatches early before they cascade
 */

// Safe fetch wrapper with minimal logging
export async function safeApiCall<T>(
  url: string,
  fallbackValue: T,
  formatError?: (e: unknown) => string
): Promise<T> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      // Log only non-200 status codes
      const logEntry = `[API ${response.status}] ${url}`
      console.warn(logEntry)
      return fallbackValue
    }
    const data = await response.json()
    return data as T
  } catch (error) {
    const msg = formatError ? formatError(error) : String(error)
    console.error(`API call failed: ${url}`, msg)
    return fallbackValue
  }
}

// Field existence checker - prevents access to undefined fields
export function getField<T, K extends string>(
  obj: unknown,
  field: K,
  defaultValue?: unknown
): T | undefined {
  if (!obj || typeof obj !== 'object') return defaultValue as T | undefined
  const value = (obj as Record<string, unknown>)[field]
  return value !== undefined ? (value as T) : (defaultValue as T | undefined)
}

// Safe array iteration with existence check
export function safeArray<T>(arr: unknown): T[] {
  if (!Array.isArray(arr)) return []
  return arr as T[]
}

// Extract verse reference safely (handles both SB and CC formats)
export function extractVerseReference(verse: any): string {
  if (!verse) return '?'
  // CC format: uses verse_slug like "adi/1/103"
  if (verse.verse_slug) {
    const [section, chapter, num] = verse.verse_slug.split('/')
    return `CC ${section[0].toUpperCase()}${section.slice(1)} ${chapter}.${num}`
  }
  // SB format: full_reference like "SB 1.1.1"
  if (verse.full_reference) return verse.full_reference
  // Fallback
  return `Ch ${verse.chapter_id || '?'} V${verse.verse_number || '?'}`
}

// Safe entity type access
export function getEntityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    person: 'Person',
    place: 'Place',
    object: 'Object',
    event: 'Event'
  }
  return labels[type] || type
}

// Normalize names for comparison
export function normalizeForSearch(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
