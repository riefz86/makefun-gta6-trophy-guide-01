import { loadTrophies, trophyById } from "./data.js";
import {
  loadProgress, getProgress, saveProgress, toggleEarned, setCount, setNote,
  toggleNext, exportProgress, importProgress, resetProgress, getCount,
} from "./store.js";

const viewEl = document.getElementById("view");
const uiState = { kind: "all", grade: "all", query: "", sort: "psn", disputed: false, hiddenOnly: false, notEarned: false };

const loadShell = () => import("./views/shell.js");
const loadChecklist = () => import("./views/checklist.js");
const loadDetail = () => import("./views/detail.js");
const loadRoadmap = () => import("./views/roadmap.js");
const loadMissables = () => import("./views/missables.js");
const loadPlanner = () => import("./views/planner.js");
const loadSettings = () => import("./views/settings.js");
const loadSources = () => import("./views/sources.js");

const PAGE_RENDER = { roadmap: "renderRoadmap", missables: "renderMissables", planner: "renderPlanner", settings: "renderSettings", sources: "renderSources" };
const PAGE_LOADER = { roadmap: loadRoadmap, missables: loadMissables, planner: loadPlanner, settings: loadSettings, sources: loadSources };

const parseRoute = () => {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  if (parts[0] === "trophy" && parts[1]) return { name: "trophy", id: Number(parts[1]) };
  if (PAGE_RENDER[parts[0]]) return { name: parts[0] };
  return { name: "tracker" };
};

let currentRun = 0;
const stillCurrent = (run) => run === currentRun;

const show = async () => {
  const run = ++currentRun;
  const route = parseRoute();
  const shell = await loadShell();
  if (!stillCurrent(run)) return;
  shell.renderShell(route.name === "trophy" ? "" : route.name);
  if (route.name === "trophy") {
    const mod = await loadDetail();
    if (stillCurrent(run)) mod.renderDetail(viewEl, route.id);
  } else if (route.name === "tracker") {
    const mod = await loadChecklist();
    if (stillCurrent(run)) mod.renderChecklist(viewEl, uiState);
  } else {
    const mod = await PAGE_LOADER[route.name]();
    if (stillCurrent(run)) mod[PAGE_RENDER[route.name]](viewEl);
  }
  if (stillCurrent(run)) scrollTo(0, 0);
};

const download = (filename, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const flipTheme = async () => {
  const settings = getProgress().settings;
  settings.theme = settings.theme === "paper" ? "night" : "paper";
  saveProgress();
  const shell = await loadShell();
  shell.applyTheme(settings.theme);
  show();
};

const stepCount = (el, direction) => {
  const trophy = trophyById(Number(el.dataset.id));
  if (trophy && trophy.psn) {
    setCount(trophy.id, getCount(trophy.id) + direction, trophy.psn.target);
    show();
  }
};

const clickActions = {
  "toggle-earned": (el) => { toggleEarned(Number(el.dataset.id)); show(); },
  "toggle-next": (el) => { toggleNext(Number(el.dataset.id)); show(); },
  "count-plus": (el) => stepCount(el, 1),
  "count-minus": (el) => stepCount(el, -1),
  "set-kind": (el) => { uiState.kind = el.dataset.kind; show(); },
  "toggle-theme": () => flipTheme(),
  "export": () => download("sunset-platinum-progress.json", exportProgress()),
  "reset": () => {
    if (window.confirm("Reset all progress, notes and Next up marks?")) { resetProgress(); show(); }
  },
};

const onClick = (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = clickActions[el.dataset.action];
  if (action) action(el);
};

const onInput = (event) => {
  const note = event.target.closest("textarea.note");
  if (!note) return;
  setNote(Number(note.dataset.note), note.value);
  const saved = document.getElementById("note-saved");
  if (saved) saved.textContent = "Saved in this browser.";
};

const onThemeChanged = async () => {
  saveProgress();
  const shell = await loadShell();
  shell.applyTheme(getProgress().settings.theme);
  show();
};

const onSettingsChanged = () => {
  saveProgress();
  show();
};

const onImportFile = async (event) => {
  const result = importProgress(await event.detail.text());
  const status = document.getElementById("import-status") || document.getElementById("header-import-status");
  if (status) status.textContent = result.ok ? "Imported." : "Import failed: " + result.error;
  if (result.ok) show();
};

const onChange = (event) => {
  if (event.target.id === "import-file-header") {
    const file = event.target.files[0];
    if (file) window.dispatchEvent(new CustomEvent("sunset-import-file", { detail: file }));
  }
};

const onKeydown = (event) => {
  const active = document.activeElement;
  const typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
  if (event.key === "/" && !typing) {
    const search = document.getElementById("search");
    if (search) { event.preventDefault(); search.focus(); }
  }
  if (event.key === "Escape" && parseRoute().name === "trophy") location.hash = "#/";
};

document.addEventListener("click", onClick);
document.addEventListener("input", onInput);
window.addEventListener("sunset-theme-changed", onThemeChanged);
window.addEventListener("sunset-settings-changed", onSettingsChanged);
window.addEventListener("sunset-import-file", onImportFile);
document.addEventListener("change", onChange);
document.addEventListener("keydown", onKeydown);
window.addEventListener("hashchange", show);

const boot = async () => {
  await loadTrophies();
  loadProgress();
  const shell = await loadShell();
  shell.applyTheme(getProgress().settings.theme);
  show();
};
boot();
