/**
 * Some models leak their chain-of-thought into the answer text as literal
 * `<think>…</think>` (or `<thinking>…</thinking>`) tags instead of a dedicated
 * reasoning part. This splits that text into the hidden thinking and the visible
 * answer so the UI can render thinking in a collapsible block (like Claude) and
 * never show the raw tags.
 */
export interface ThinkSplit {
  thinking: string;
  answer: string;
  /** A `<think>` block is open but not yet closed — still streaming in. */
  thinkingStreaming: boolean;
  hasThinking: boolean;
}

const OPEN = "<think>";
const CLOSE = "</think>";

export function splitThinking(raw: string): ThinkSplit {
  const normalized = raw
    .replace(/<thinking>/gi, OPEN)
    .replace(/<\/thinking>/gi, CLOSE);

  if (!normalized.includes(OPEN)) {
    return {
      thinking: "",
      answer: raw,
      thinkingStreaming: false,
      hasThinking: false,
    };
  }

  let thinking = "";
  let answer = "";
  let rest = normalized;
  let streaming = false;

  while (rest.length > 0) {
    const openIdx = rest.indexOf(OPEN);
    if (openIdx === -1) {
      answer += rest;
      break;
    }
    answer += rest.slice(0, openIdx);
    const afterOpen = rest.slice(openIdx + OPEN.length);
    const closeIdx = afterOpen.indexOf(CLOSE);
    if (closeIdx === -1) {
      thinking += afterOpen;
      streaming = true;
      break;
    }
    thinking += afterOpen.slice(0, closeIdx);
    rest = afterOpen.slice(closeIdx + CLOSE.length);
  }

  const trimmedThinking = thinking.trim();
  return {
    thinking: trimmedThinking,
    answer: answer.trim(),
    thinkingStreaming: streaming,
    hasThinking: trimmedThinking.length > 0 || streaming,
  };
}
