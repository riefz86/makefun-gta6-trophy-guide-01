import { STORAGE_KEY } from "./config.js";

const defaultSettings = () => ({ theme: "night", spoilers: true, hideEarned: false });

const defaultProgress = () => ({ earned: [], counts: {}, notes: {}, next: [], settings: defaultSettings() });

const toObject = (value) => (value !== null && typeof value === "object" ? value : {});
const toList = (value) => (Array.isArray(value) ? value : []);

let progress = defaultProgress();

const normalize = (parsed) => {
  const out = { ...defaultProgress(), ...parsed };
  out.settings = { ...defaultSettings(), ...toObject(parsed.settings) };
  out.earned = toList(parsed.earned);
  out.counts = toObject(parsed.counts);
  out.notes = toObject(parsed.notes);
  out.next = toList(parsed.next);
  return out;
};

const flip = (list, id) => {
  if (list.includes(id)) return list.filter((entry) => entry !== id);
  return [...list, id];
};

export const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) progress = normalize(JSON.parse(raw));
  } catch {
    progress = defaultProgress();
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
export const isEarned = (id) => progress.earned.includes(id);

export const toggleEarned = (id) => {
  progress.earned = flip(progress.earned, id);
  saveProgress();
  return isEarned(id);
};

export const getCount = (id) => progress.counts[id] || 0;

export const setCount = (id, value, target) => {
  const rounded = Math.round(value) || 0;
  const clamped = Math.max(0, Math.min(target, rounded));
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

export const isNext = (id) => progress.next.includes(id);

export const toggleNext = (id) => {
  progress.next = flip(progress.next, id);
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
  const merged = { ...defaultProgress(), ...incoming };
  merged.settings = { ...defaultSettings(), ...toObject(incoming.settings) };
  progress = merged;
  saveProgress();
  return { ok: true };
};

export const resetProgress = () => {
  progress = defaultProgress();
  saveProgress();
};
