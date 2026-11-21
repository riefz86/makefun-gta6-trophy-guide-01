// Sunset Platinum — small HTML helpers. Retry-2: one clean recording.
const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

export const esc = (text) => {
  const raw = text == null ? "" : String(text);
  return raw.replace(/[&<>"]/g, (ch) => ESCAPE_MAP[ch]);
};

export const medalDot = (grade) => {
  const safe = esc(grade);
  return `<span class="medal ${safe}" title="${safe}"></span>`;
};

export const guideParagraphs = (text) => {
  const input = String(text || "");
  const sentences = input.split(/(?<=[.!?])\s+/).filter((s) => s.trim() !== "");
  const paras = [];
  for (let i = 0; i < sentences.length; i++) {
    if (i % 2 === 0) paras.push(sentences[i]);
    else paras[paras.length - 1] += " " + sentences[i];
  }
  return paras;
};

export const citeSups = (step, localMap) => {
  const ids = step.s || [];
  const parts = [];
  for (const id of ids) {
    const num = localMap[id] || "?";
    parts.push(`<sup class="cite"><a href="#/sources" title="See the Sources tab">[${num}]</a></sup>`);
  }
  return parts.join("");
};

export const singleSourceTag = (step) => {
  const ids = step.s || [];
  return ids.length === 1 ? ` <span class="tag single">1 source</span>` : "";
};

export const fmt = (n) => {
  const digits = String(n);
  const groups = [];
  let rest = digits;
  while (rest.length > 3) {
    groups.unshift(rest.slice(-3));
    rest = rest.slice(0, -3);
  }
  groups.unshift(rest);
  return groups.join(",");
};
// Retry-2: single clean recording — content unchanged.
