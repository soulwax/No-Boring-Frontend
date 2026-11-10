import { Genre, Tier } from './models';

/** Display data for the backend's Genre enum (keep in sync with Genre.java). */
export const GENRES: Record<Genre, { emoji: string; label: string }> = {
  CLASSIC: { emoji: '🎪', label: 'Classic' },
  NOIR: { emoji: '🕵️', label: 'Noir' },
  SPACE_OPERA: { emoji: '🚀', label: 'Space Opera' },
  NATURE_DOC: { emoji: '🦁', label: 'Nature Doc' },
  MEDIEVAL: { emoji: '🏰', label: 'Medieval' },
  HEIST: { emoji: '💎', label: 'Heist' },
};

export const GENRE_CODES = Object.keys(GENRES) as Genre[];

/** Display data for the backend's Tier enum (keep in sync with Tier.java). */
export const TIERS: Record<Tier, { emoji: string; label: string; threshold: number }> = {
  BORING: { emoji: '😐', label: 'Boring', threshold: 0 },
  CURIOUS: { emoji: '🤨', label: 'Curious', threshold: 6 },
  SPICY: { emoji: '🌶️', label: 'Spicy', threshold: 15 },
  LEGENDARY: { emoji: '👑', label: 'Legendary', threshold: 30 },
  MYTHIC: { emoji: '🐉', label: 'Mythic', threshold: 50 },
};

export const TIER_CODES = Object.keys(TIERS) as Tier[];

export function tierRank(tier: Tier): number {
  return TIER_CODES.indexOf(tier);
}

export function nextTier(tier: Tier): Tier | null {
  return TIER_CODES[tierRank(tier) + 1] ?? null;
}
