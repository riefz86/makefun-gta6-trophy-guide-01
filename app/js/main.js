import { loadTrophies, trophyById } from "./data.js";
import { loadProgress, getProgress, saveProgress, toggleEarned, setCount, setNote, toggleNext, exportProgress, importProgress, resetProgress, getCount } from "./store.js";

const view = document.getElementById("view");
const ui = { kind: "all", grade: "all", query: "", sort: "psn", disputed: false, hiddenOnly: false, notEarned: false };

const load = {
  shell: () => import("./views/shell.js"),
  checklist: () => import("./views/checklist.js"),
  detail: () => import("./views/detail.js"),
  roadmap: () => import("./views/roadmap.js"),
  missables: () => import("./views/missables.js"),
  planner: () => import("./views/planner.js"),
  settings: () => import("./views/settings.js"),
  sources: () => import("./views/sources.js")
};
const PAGES = { roadmap: "renderRoadmap", missables: "renderMissables", planner: "renderPlanner", settings: "renderSettings", sources: "renderSources" };

function route() {
  const seg = location.hash.replace(/^#\/?/, "").split("/");
  if (seg[0] === "trophy" && seg[1]) return { name: "trophy", id: +seg[1] };
  if (PAGES[seg[0]]) return { name: seg[0] };
  return { name: "tracker" };
}

let seq = 0;
const alive = run => run === seq;

async function show() {
  const run = ++seq;
  const r = route();
  const shell = await load.shell();
  if (!alive(run)) return;
  shell.renderShell(r.name === "trophy" ? "" : r.name);
  if (r.name === "trophy") {
    const m = await load.detail();
    if (alive(run)) m.renderDetail(view, r.id);
  } else if (r.name === "tracker") {
    const m = await load.checklist();
    if (alive(run)) m.renderChecklist(view, ui);
  } else {
    const m = await load[r.name]();
    if (alive(run)) m[PAGES[r.name]](view);
  }
  if (alive(run)) scrollTo(0, 0);
}

function saveFile(filename, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function flipTheme() {
  const s = getProgress().settings;
  s.theme = s.theme === "paper" ? "night" : "paper";
  saveProgress();
  (await load.shell()).applyTheme(s.theme);
  show();
}

document.addEventListener("click", async e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const id = +el.dataset.id, a = el.dataset.action;
  if (a === "toggle-earned") { toggleEarned(id); show(); }
  else if (a === "toggle-next") { toggleNext(id); show(); }
  else if (a === "count-plus" || a === "count-minus") {
    const t = trophyById(id);
    if (t && t.psn) {
      setCount(id, getCount(id) + (a === "count-plus" ? 1 : -1), t.psn.target);
      show();
    }
  }
  else if (a === "set-kind") { ui.kind = el.dataset.kind; show(); }
  else if (a === "toggle-theme") flipTheme();
  else if (a === "export") saveFile("sunset-platinum-progress.json", exportProgress());
  else if (a === "reset") {
    if (window.confirm("Reset all progress, notes and Next up marks?")) { resetProgress(); show(); }
  }
});

document.addEventListener("input", e => {
  const note = e.target.closest("textarea.note");
  if (!note) return;
  setNote(+note.dataset.note, note.value);
  const saved = document.getElementById("note-saved");
  if (saved) saved.textContent = "Saved in this browser.";
});

window.addEventListener("sunset-theme-changed", async () => {
  saveProgress();
  (await load.shell()).applyTheme(getProgress().settings.theme);
  show();
});
window.addEventListener("sunset-settings-changed", () => { saveProgress(); show(); });
window.addEventListener("sunset-import-file", async e => {
  const result = importProgress(await e.detail.text());
  const status = document.getElementById("import-status") || document.getElementById("header-import-status");
  if (status) status.textContent = result.ok ? "Imported." : "Import failed: " + result.error;
  if (result.ok) show();
});

document.addEventListener("change", e => {
  if (e.target.id === "import-file-header") {
    const file = e.target.files[0];
    if (file) window.dispatchEvent(new CustomEvent("sunset-import-file", { detail: file }));
  }
});

document.addEventListener("keydown", e => {
  const active = document.activeElement;
  const typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
  if (e.key === "/" && !typing) {
    const search = document.getElementById("search");
    if (search) { e.preventDefault(); search.focus(); }
  }
  if (e.key === "Escape" && route().name === "trophy") location.hash = "#/";
});

window.addEventListener("hashchange", show);

async function boot() {
  await loadTrophies();
  loadProgress();
  (await load.shell()).applyTheme(getProgress().settings.theme);
  show();
}
boot();
