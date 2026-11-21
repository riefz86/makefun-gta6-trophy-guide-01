import { STORAGE_KEY } from "./config.js";

// Sunset Platinum — progress saved in this browser. Retry: one clean recording.
const freshSettings = () => ({ theme: "night", spoilers: true, hideEarned: false });
const freshProgress = () => ({ earned: [], counts: {}, notes: {}, next: [], settings: freshSettings() });
const asRecord = (value) => (value !== null && typeof value === "object" ? value : {});
const asArray = (value) => (Array.isArray(value) ? value : []);
const has = (list, id) => list.includes(id);

let progress = freshProgress();

const mergeStored = (parsed) => {
  const merged = { ...freshProgress(), ...parsed };
  merged.settings = { ...freshSettings(), ...asRecord(parsed.settings) };
  merged.earned = asArray(parsed.earned);
  merged.counts = asRecord(parsed.counts);
  merged.notes = asRecord(parsed.notes);
  merged.next = asArray(parsed.next);
  return merged;
};

export const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) progress = mergeStored(JSON.parse(raw));
  } catch {
    progress = freshProgress();
  }
  return progress;
};

export const getProgress = () => progress;

export const saveProgress = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* private mode: keep going without saving */
  }
};

export const earnedCount = () => progress.earned.length;
export const isEarned = (id) => has(progress.earned, id);

export const toggleEarned = (id) => {
  progress.earned = progress.earned.includes(id)
    ? progress.earned.filter((entry) => entry !== id)
    : [...progress.earned, id];
  saveProgress();
  return isEarned(id);
};

export const getCount = (id) => progress.counts[id] || 0;

export const setCount = (id, value, target) => {
  const clamped = Math.max(0, Math.min(target, Math.round(value) || 0));
  if (clamped === 0) delete progress.counts[id];
  else progress.counts[id] = clamped;
  saveProgress();
  return clamped;
};

export const getNote = (id) => progress.notes[id] || "";

export const setNote = (id, text) => {
  const trimmed = (text || "").trim();
  if (trimmed === "") delete progress.notes[id];
  else progress.notes[id] = trimmed;
  saveProgress();
};

export const isNext = (id) => has(progress.next, id);

export const toggleNext = (id) => {
  progress.next = progress.next.includes(id)
    ? progress.next.filter((entry) => entry !== id)
    : [...progress.next, id];
  saveProgress();
  return isNext(id);
};

export const exportProgress = () => JSON.stringify({ app: "sunset-platinum", version: 2, progress }, null, 2);

export const importProgress = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }
  const incoming = parsed.progress || parsed;
  if (!incoming || !Array.isArray(incoming.earned)) {
    return { ok: false, error: "That file is not a Sunset Platinum export." };
  }
  const merged = { ...freshProgress(), ...incoming };
  merged.settings = { ...freshSettings(), ...asRecord(incoming.settings) };
  progress = merged;
  saveProgress();
  return { ok: true };
};

export const resetProgress = () => {
  progress = freshProgress();
  saveProgress();
};
