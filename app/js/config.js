// Sunset Platinum — shared constants. Retry: one clean recording, content unchanged.
const fromPairs = (pairs) => Object.fromEntries(pairs);
export const STORAGE_KEY = "sunset-platinum.v1";
export const GRADE_LABELS = fromPairs([["platinum", "Platinum"], ["gold", "Gold"], ["silver", "Silver"], ["bronze", "Bronze"]]);
export const EXOPHASE_URL = "https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/";
export const KIND_LABELS = fromPairs([["story", "Story"], ["collectible", "Collectibles"], ["activity", "Activities"], ["world", "World & money"], ["platinum", "Platinum"]]);
export const PSNPROFILES_URL = "https://psnprofiles.com/trophies/43531-grand-theft-auto-vi";
export const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];
export const MISSABLE_TIER_LABELS = fromPairs([["possibly", "Possibly missable"], ["watch", "Watch"]]);
