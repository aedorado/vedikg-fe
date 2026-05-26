/**
 * Shared API types for frontend/backend contract
 * These types are derived from backend models to ensure consistency
 */

// ============ Books ============
export interface Book {
  id: number
  code: 'SB' | 'CC'
  title: string
  url_prefix: string
}

// ============ Cantos ============
export interface Canto {
  id: number
  book_id: number
  number: number
  title: string
  slug: string
  summary?: string
  section_label?: string
}

// ============ Chapters ============
export interface Chapter {
  id: number
  canto_id: number
  chapter_number: number
  title: string
  slug: string
  summary?: string
  source_url?: string
}

// ============ Verses ============
export interface Verse {
  id: number
  chapter_id: number
  verse_number: string
  full_reference: string
  devanagari?: string
  transliteration?: string
  translation?: string
  synonyms_raw?: string
  purport_html?: string
  purport_text?: string
  chanda?: string
  chanda_json?: string
  language: 'sa' | 'bn'
  book_id: number
  scraped_at: string
  processed_at?: string
  // For CC verses:
  verse_slug?: string
}

// ============ Entities (Characters/Places) ============
export interface Entity {
  id: number
  name: string
  normalized_name: string
  entity_type: 'person' | 'place' | 'object' | 'event'
  description?: string
  aliases_json?: string
  image_url?: string
  verse_count?: number
  cantos?: number[]
}

// ============ Verse Mentions ============
export interface VerseEntity {
  id: number
  verse_id: number
  entity_id: number
  mention_location: 'verse_text' | 'purport_text' | 'both'
  mention_text?: string
  context_summary?: string
  confidence_score: number
}

export interface EntityMention {
  verse_id: number
  reference: string
  translation?: string
  purport_text?: string
  mention_location: 'verse_text' | 'purport_text' | 'both'
}

// ============ Relationships ============
export interface Relationship {
  id: number
  source_entity_id: number
  target_entity_id: number
  relationship_type: string
  source_verse_id: number
}

// ============ API Response Types ============
export interface EntityDetail extends Entity {
  mention_count?: number
  first_appearance_verse_id?: number
}

export interface EntityWithMentions extends EntityDetail {
  verses?: EntityMention[]
}

export interface EntityRelationshipsResponse {
  entity: Entity
  relationships: {
    family: Array<Relationship & { target?: Entity; direction?: 'outgoing' | 'incoming' }>
    other: Array<Relationship & { target?: Entity; direction?: 'outgoing' | 'incoming' }>
  }
}

// ============ Chandas ============
export interface Chanda {
  name: string
  verse_count: number
}

export interface ChandasListResponse {
  total: number
  skip: number
  limit: number
  chandas: Chanda[]
}
