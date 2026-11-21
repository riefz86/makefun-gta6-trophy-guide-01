// Sunset Platinum — small HTML helpers. Retry: one clean recording.
const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

export const esc = (text) => String(text == null ? "" : text).replace(/[&<>"]/g, (ch) => ESCAPES[ch]);

export const medalDot = (grade) => `<span class="medal ${esc(grade)}" title="${esc(grade)}"></span>`;

export const guideParagraphs = (text) => {
  const sentences = String(text || "").split(/(?<=[.!?])\s+/).filter((s) => s.trim() !== "");
  return sentences.reduce((paras, sentence, i) => {
    if (i % 2 === 0) paras.push(sentence);
    else paras[paras.length - 1] += " " + sentence;
    return paras;
  }, []);
};

export const citeSups = (step, localMap) =>
  (step.s || []).map((id) => `<sup class="cite"><a href="#/sources" title="See the Sources tab">[${localMap[id] || "?"}]</a></sup>`).join("");

export const singleSourceTag = (step) =>
  step.s && step.s.length === 1 ? ` <span class="tag single">1 source</span>` : "";

export const fmt = (n) => {
  const digits = String(n);
  let out = "";
  for (let i = digits.length - 1, group = 0; i >= 0; i--, group++) {
    if (group > 0 && group % 3 === 0) out = "," + out;
    out = digits[i] + out;
  }
  return out;
};
// Retry: single clean recording — content unchanged.
