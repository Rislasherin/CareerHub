export enum CandidateTurnIntent {
  THINKING = 'THINKING',
  EXPLICIT_UNKNOWN = 'EXPLICIT_UNKNOWN',
  POSSIBLE_INCOMPLETE = 'POSSIBLE_INCOMPLETE',
  NORMAL_ANSWER = 'NORMAL_ANSWER',
}

const THINKING_PATTERNS = [
  /\b(let\s+me\s+think(\s+about\s+(that|this))?|give\s+me\s+a\s+(second|moment|sec|minute)|one\s+(second|moment|sec|minute)|just\s+a\s+(second|moment|sec|minute)|can\s+i\s+have\s+a\s+(second|moment|minute)|let's\s+see|hmm\s+let\s+me\s+think|thinking|wait\s+a\s+(second|moment|minute)|hold\s+on\s+a\s+(second|moment)|gimme\s+a\s+(sec|second|moment))\b/i,
  /\b(let\s+me\s+think|give\s+me\s+a\s+(second|moment)|one\s+(second|moment))\s*$/i,
];

const EXPLICIT_UNKNOWN_PATTERNS = [
  /\b(i\s+don't\s+know(\s+the\s+answer)?|i\s+do\s+not\s+know|i'm\s+not\s+sure|i\s+am\s+not\s+sure|no\s+idea|i\s+have\s+no\s+idea|i\s+haven't\s+worked\s+with\s+(that|this)|i\s+have\s+not\s+used\s+(that|this)|i\s+don't\s+recall|i\s+do\s+not\s+recall|pass|can\s+we\s+skip(\s+this)?|skip\s+(this\s+question)?|not\s+familiar\s+with\s+(that|this)|not\s+really\s+sure)\b/i,
];

const INCOMPLETE_TRAILING_WORDS = new Set([
  'and', 'or', 'because', 'but', 'so', 'if', 'when', 'like', 'then', 'since', 'although', 'which', 'that', 'whereas'
]);

export function classifyTurnIntent(text: string): CandidateTurnIntent {
  if (!text) {
    return CandidateTurnIntent.NORMAL_ANSWER;
  }

  const clean = text.trim().toLowerCase().replace(/[^\w\s']/g, '').replace(/\s+/g, ' ');
  const words = clean.split(' ').filter(Boolean);

  if (words.length === 0) {
    return CandidateTurnIntent.NORMAL_ANSWER;
  }

  // 1. Check for Thinking Phrases
  for (const pattern of THINKING_PATTERNS) {
    if (pattern.test(clean)) {
      // If the entire utterance is short (<= 8 words) and matches thinking phrase
      if (words.length <= 8) {
        return CandidateTurnIntent.THINKING;
      }
    }
  }

  // 2. Check for Explicit Unknown / Pass
  for (const pattern of EXPLICIT_UNKNOWN_PATTERNS) {
    if (pattern.test(clean)) {
      if (words.length <= 10) {
        return CandidateTurnIntent.EXPLICIT_UNKNOWN;
      }
    }
  }

  // 3. Check for Incomplete Trailing Conjunction
  if (words.length > 0 && words.length <= 4) {
    const lastWord = words[words.length - 1];
    if (INCOMPLETE_TRAILING_WORDS.has(lastWord)) {
      return CandidateTurnIntent.POSSIBLE_INCOMPLETE;
    }
  }

  return CandidateTurnIntent.NORMAL_ANSWER;
}
