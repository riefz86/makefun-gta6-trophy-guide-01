// Sunset Platinum — small HTML helpers. Retry-3: re-derived in one clean recording.
const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

export const esc = (value) => {
  const text = value == null ? "" : String(value);
  let out = "";
  for (const ch of text) out += ESCAPES[ch] || ch;
  return out;
};

export const medalDot = (grade) => {
  const safe = esc(grade);
  return '<span class="medal ' + safe + '" title="' + safe + '"></span>';
};

export const guideParagraphs = (text) => {
  const sentences = String(text || "")
    .split(/(?<=[.!?])\s+/)
    .filter((piece) => piece.trim() !== "");
  const paras = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const pair = sentences[i + 1] ? sentences[i] + " " + sentences[i + 1] : sentences[i];
    paras.push(pair);
  }
  return paras;
};

export const citeSups = (step, localMap) => {
  const out = [];
  for (const id of step.s || []) {
    const num = localMap[id] || "?";
    out.push('<sup class="cite"><a href="#/sources" title="See the Sources tab">[' + num + "]</a></sup>");
  }
  return out.join("");
};

export const singleSourceTag = (step) => {
  const ids = step.s || [];
  return ids.length === 1 ? ' <span class="tag single">1 source</span>' : "";
};

export const fmt = (n) => {
  const digits = String(n);
  if (digits.length <= 3) return digits;
  const head = digits.slice(0, digits.length - 3);
  const tail = digits.slice(-3);
  return fmt(head) + "," + tail;
};
