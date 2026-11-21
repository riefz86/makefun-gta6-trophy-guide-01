// saved progress — retry-3
import { STORAGE_KEY } from "./config.js";

const defSet = () => ({ theme: "night", spoilers: true, hideEarned: false });
const defProg = () => ({ earned: [], counts: {}, notes: {}, next: [], settings: defSet() });

const asObj = (v) => (v !== null && typeof v === "object" ? v : {});
const asArr = (v) => (Array.isArray(v) ? v : []);

let state = defProg();

const norm = (parsed) => {
  const out = { ...defProg(), ...parsed };
  out.settings = { ...defSet(), ...asObj(parsed.settings) };
  out.earned = asArr(parsed.earned);
  out.counts = asObj(parsed.counts);
  out.notes = asObj(parsed.notes);
  out.next = asArr(parsed.next);
  return out;
};

const tog = (list, id) =>
  list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id];

export const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = norm(JSON.parse(raw));
  } catch {
    state = defProg();
  }
  return state;
};

export const getProgress = () => state;

export const saveProgress = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode: keep going without saving.
  }
};

export const earnedCount = () => state.earned.length;
export const isEarned = (id) => state.earned.includes(id);

export const toggleEarned = (id) => {
  state.earned = tog(state.earned, id);
  saveProgress();
  return isEarned(id);
};

export const getCount = (id) => state.counts[id] || 0;

export const setCount = (id, value, target) => {
  const clamped = Math.max(0, Math.min(target, Math.round(value) || 0));
  if (clamped === 0) delete state.counts[id];
  else state.counts[id] = clamped;
  saveProgress();
  return clamped;
};

export const getNote = (id) => state.notes[id] || "";

export const setNote = (id, text) => {
  const trimmed = (text || "").trim();
  if (trimmed === "") delete state.notes[id];
  else state.notes[id] = trimmed;
  saveProgress();
};

export const isNext = (id) => state.next.includes(id);

export const toggleNext = (id) => {
  state.next = tog(state.next, id);
  saveProgress();
  return isNext(id);
};

export const exportProgress = () =>
  JSON.stringify({ app: "sunset-platinum", version: 2, progress: state }, null, 2);

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
  const merged = { ...defProg(), ...incoming };
  merged.settings = { ...defSet(), ...asObj(incoming.settings) };
  state = merged;
  saveProgress();
  return { ok: true };
};

export const resetProgress = () => {
  state = defProg();
  saveProgress();
};
