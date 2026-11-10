import { Genre, Tier } from './models';

/** Display data for the backend's Genre enum (keep in sync with Genre.java). Labels live in messages.ts. */
export const GENRES: Record<Genre, { emoji: string }> = {
  CLASSIC: { emoji: '🎪' },
  NOIR: { emoji: '🕵️' },
  SPACE_OPERA: { emoji: '🚀' },
  NATURE_DOC: { emoji: '🦁' },
  MEDIEVAL: { emoji: '🏰' },
  HEIST: { emoji: '💎' },
};

export const GENRE_CODES = Object.keys(GENRES) as Genre[];

/** Display data for the backend's Tier enum (keep in sync with Tier.java). Labels live in messages.ts. */
export const TIERS: Record<Tier, { emoji: string; threshold: number }> = {
  BORING: { emoji: '😐', threshold: 0 },
  CURIOUS: { emoji: '🤨', threshold: 6 },
  SPICY: { emoji: '🌶️', threshold: 15 },
  LEGENDARY: { emoji: '👑', threshold: 30 },
  MYTHIC: { emoji: '🐉', threshold: 50 },
};

export const TIER_CODES = Object.keys(TIERS) as Tier[];

export function tierRank(tier: Tier): number {
  return TIER_CODES.indexOf(tier);
}

export function nextTier(tier: Tier): Tier | null {
  return TIER_CODES[tierRank(tier) + 1] ?? null;
}
