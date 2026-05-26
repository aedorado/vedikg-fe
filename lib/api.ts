export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vedikg-be.onrender.com'

export const api = {
  entities: {
    list: () => `${API_BASE_URL}/api/entities`,
    get: (id: number) => `${API_BASE_URL}/api/entities/${id}`,
    mentions: (id: number) => `${API_BASE_URL}/api/entities/${id}/mentions`,
    relationships: (id: number) => `${API_BASE_URL}/api/entities/${id}/relationships`,
    graph: (id: number) => `${API_BASE_URL}/api/entities/${id}/graph`,
  },
  verses: {
    list: () => `${API_BASE_URL}/api/verses`,
    get: (id: number) => `${API_BASE_URL}/api/verses/${id}`,
    bySlug: (slug: string) => `${API_BASE_URL}/api/verses/sb/${slug}`,
    chapter: (chapterId: number) => `${API_BASE_URL}/api/verses/chapter/${chapterId}`,
  },
}

/** Convert 'SB 1.1.3' → '/sb/1/1/3' for frontend navigation */
export function verseUrl(fullReference: string): string {
  const slug = fullReference.replace('SB ', '').replace(/\./g, '/')
  return `/sb/${slug}`
}
