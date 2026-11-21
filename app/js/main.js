import { loadTrophies, trophyById } from "./data.js";
import {
  loadProgress, getProgress, saveProgress, toggleEarned, setCount, setNote,
  toggleNext, exportProgress, importProgress, resetProgress, getCount,
} from "./store.js";

// Sunset Platinum — router and shell wiring. Retry: one clean recording.
const view = document.getElementById("view");
const filters = { kind: "all", grade: "all", query: "", sort: "psn", disputed: false, hiddenOnly: false, notEarned: false };

const shellView = () => import("./views/shell.js");
const PAGE_RENDER = { roadmap: "renderRoadmap", missables: "renderMissables", planner: "renderPlanner", settings: "renderSettings", sources: "renderSources" };
const listView = () => import("./views/checklist.js");
const detailView = () => import("./views/detail.js");
const roadmapView = () => import("./views/roadmap.js");
const missablesView = () => import("./views/missables.js");
const plannerView = () => import("./views/planner.js");
const settingsView = () => import("./views/settings.js");
const sourcesView = () => import("./views/sources.js");

const viewLoader = { shell: shellView, checklist: listView, detail: detailView, roadmap: roadmapView, missables: missablesView, planner: plannerView, settings: settingsView, sources: sourcesView };

const parseRoute = () => {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  if (parts[0] === "trophy" && parts[1]) return { name: "trophy", id: Number(parts[1]) };
  if (PAGE_RENDER[parts[0]]) return { name: parts[0] };
  return { name: "tracker" };
};

let runId = 0;
const isCurrent = (run) => run === runId;

const show = async () => {
  const run = ++runId;
  const route = parseRoute();
  const shell = await viewLoader.shell();
  if (!isCurrent(run)) return;
  shell.renderShell(route.name === "trophy" ? "" : route.name);
  const target = route.name === "trophy"
    ? { load: viewLoader.detail, call: (mod) => mod.renderDetail(view, route.id) }
    : route.name === "tracker"
      ? { load: viewLoader.checklist, call: (mod) => mod.renderChecklist(view, filters) }
      : { load: viewLoader[route.name], call: (mod) => mod[PAGE_RENDER[route.name]](view) };
  const mod = await target.load();
  if (isCurrent(run)) target.call(mod);
  if (isCurrent(run)) scrollTo(0, 0);
};

const saveFile = (filename, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const flipTheme = async () => {
  const settings = getProgress().settings;
  settings.theme = settings.theme === "paper" ? "night" : "paper";
  saveProgress();
  const shell = await viewLoader.shell();
  shell.applyTheme(settings.theme);
  show();
};

const countStep = (el, direction) => {
  const trophy = trophyById(Number(el.dataset.id));
  if (trophy && trophy.psn) {
    setCount(trophy.id, getCount(trophy.id) + direction, trophy.psn.target);
    show();
  }
};

const clickActions = {
  "toggle-earned": (el) => { toggleEarned(Number(el.dataset.id)); show(); },
  "toggle-next": (el) => { toggleNext(Number(el.dataset.id)); show(); },
  "count-plus": (el) => countStep(el, 1),
  "count-minus": (el) => countStep(el, -1),
  "set-kind": (el) => { filters.kind = el.dataset.kind; show(); },
  "toggle-theme": () => flipTheme(),
  "export": () => saveFile("sunset-platinum-progress.json", exportProgress()),
  "reset": () => {
    if (window.confirm("Reset all progress, notes and Next up marks?")) { resetProgress(); show(); }
  },
};

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = clickActions[el.dataset.action];
  if (action) action(el);
});

document.addEventListener("input", (event) => {
  const note = event.target.closest("textarea.note");
  if (!note) return;
  setNote(Number(note.dataset.note), note.value);
  const saved = document.getElementById("note-saved");
  if (saved) saved.textContent = "Saved in this browser.";
});

window.addEventListener("sunset-theme-changed", async () => {
  saveProgress();
  const shell = await viewLoader.shell();
  shell.applyTheme(getProgress().settings.theme);
  show();
});

window.addEventListener("sunset-settings-changed", () => {
  saveProgress();
  show();
});

window.addEventListener("sunset-import-file", async (event) => {
  const result = importProgress(await event.detail.text());
  const status = document.getElementById("import-status") || document.getElementById("header-import-status");
  if (status) status.textContent = result.ok ? "Imported." : "Import failed: " + result.error;
  if (result.ok) show();
});

document.addEventListener("change", (event) => {
  if (event.target.id === "import-file-header") {
    const file = event.target.files[0];
    if (file) window.dispatchEvent(new CustomEvent("sunset-import-file", { detail: file }));
  }
});

document.addEventListener("keydown", (event) => {
  const active = document.activeElement;
  const typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
  if (event.key === "/" && !typing) {
    const search = document.getElementById("search");
    if (search) { event.preventDefault(); search.focus(); }
  }
  if (event.key === "Escape" && parseRoute().name === "trophy") location.hash = "#/";
});

window.addEventListener("hashchange", show);

const boot = async () => {
  await loadTrophies();
  loadProgress();
  const shell = await viewLoader.shell();
  shell.applyTheme(getProgress().settings.theme);
  show();
};
boot();
