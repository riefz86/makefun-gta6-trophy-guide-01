// app shell — retry-3
import { loadTrophies, trophyById } from "./data.js";
import {
  loadProgress, getProgress, saveProgress, toggleEarned, setCount, setNote,
  toggleNext, exportProgress, importProgress, resetProgress, getCount,
} from "./store.js";

const viewEl = document.getElementById("view");
const flt = { kind: "all", grade: "all", query: "", sort: "psn", disputed: false, hiddenOnly: false, notEarned: false };

const impShell = () => import("./views/shell.js");
const impList = () => import("./views/checklist.js");
const impDetail = () => import("./views/detail.js");
const impRoad = () => import("./views/roadmap.js");
const impMiss = () => import("./views/missables.js");
const impPlan = () => import("./views/planner.js");
const impSet = () => import("./views/settings.js");
const impSrc = () => import("./views/sources.js");

const FN = {
  roadmap: "renderRoadmap",
  missables: "renderMissables",
  planner: "renderPlanner",
  settings: "renderSettings",
  sources: "renderSources",
};
const IMP = {
  roadmap: impRoad,
  missables: impMiss,
  planner: impPlan,
  settings: impSet,
  sources: impSrc,
};

const route = () => {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  if (parts[0] === "trophy" && parts[1]) return { name: "trophy", id: Number(parts[1]) };
  if (FN[parts[0]]) return { name: parts[0] };
  return { name: "tracker" };
};

let run = 0;
const live = (n) => n === run;

const render = async () => {
  const n = ++run;
  const r = route();
  const shell = await impShell();
  if (!live(n)) return;
  shell.renderShell(r.name === "trophy" ? "" : r.name);
  if (r.name === "trophy") {
    const mod = await impDetail();
    if (live(n)) mod.renderDetail(viewEl, r.id);
  } else if (r.name === "tracker") {
    const mod = await impList();
    if (live(n)) mod.renderChecklist(viewEl, flt);
  } else {
    const mod = await IMP[r.name]();
    if (live(n)) mod[FN[r.name]](viewEl);
  }
  if (live(n)) scrollTo(0, 0);
};

const save = (filename, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const theme = async () => {
  const settings = getProgress().settings;
  settings.theme = settings.theme === "paper" ? "night" : "paper";
  saveProgress();
  const shell = await impShell();
  shell.applyTheme(settings.theme);
  render();
};

const bump = (el, direction) => {
  const trophy = trophyById(Number(el.dataset.id));
  if (trophy && trophy.psn) {
    setCount(trophy.id, getCount(trophy.id) + direction, trophy.psn.target);
    render();
  }
};

const ACT = {
  "toggle-earned": (el) => { toggleEarned(Number(el.dataset.id)); render(); },
  "toggle-next": (el) => { toggleNext(Number(el.dataset.id)); render(); },
  "count-plus": (el) => bump(el, 1),
  "count-minus": (el) => bump(el, -1),
  "set-kind": (el) => { flt.kind = el.dataset.kind; render(); },
  "toggle-theme": () => theme(),
  "export": () => save("sunset-platinum-progress.json", exportProgress()),
  "reset": () => {
    if (window.confirm("Reset all progress, notes and Next up marks?")) {
      resetProgress();
      render();
    }
  },
};

const click = (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const fn = ACT[el.dataset.action];
  if (fn) fn(el);
};

const input = (event) => {
  const note = event.target.closest("textarea.note");
  if (!note) return;
  setNote(Number(note.dataset.note), note.value);
  const saved = document.getElementById("note-saved");
  if (saved) saved.textContent = "Saved in this browser.";
};

const onTheme = async () => {
  saveProgress();
  const shell = await impShell();
  shell.applyTheme(getProgress().settings.theme);
  render();
};

const onSet = () => {
  saveProgress();
  render();
};

const onImp = async (event) => {
  const result = importProgress(await event.detail.text());
  const status = document.getElementById("import-status") || document.getElementById("header-import-status");
  if (status) status.textContent = result.ok ? "Imported." : "Import failed: " + result.error;
  if (result.ok) render();
};

const change = (event) => {
  if (event.target.id === "import-file-header") {
    const file = event.target.files[0];
    if (file) window.dispatchEvent(new CustomEvent("sunset-import-file", { detail: file }));
  }
};

const keys = (event) => {
  const active = document.activeElement;
  const typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
  if (event.key === "/" && !typing) {
    const search = document.getElementById("search");
    if (search) {
      event.preventDefault();
      search.focus();
    }
  }
  if (event.key === "Escape" && route().name === "trophy") location.hash = "#/";
};

document.addEventListener("click", click);
document.addEventListener("input", input);
window.addEventListener("sunset-theme-changed", onTheme);
window.addEventListener("sunset-settings-changed", onSet);
window.addEventListener("sunset-import-file", onImp);
document.addEventListener("change", change);
document.addEventListener("keydown", keys);
window.addEventListener("hashchange", render);

const start = async () => {
  await loadTrophies();
  loadProgress();
  const shell = await impShell();
  shell.applyTheme(getProgress().settings.theme);
  render();
};
start();
