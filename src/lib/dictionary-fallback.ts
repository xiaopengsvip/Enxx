import { words as localWords } from "@/data/words";
import type { WordItem } from "@/types/learning";

export type DictionaryFallbackWord = WordItem & {
  category: string;
  level: number;
  frequency: number;
  difficulty: string;
  definitionEn: string;
};

export type DictionaryFallbackResult = {
  items: DictionaryFallbackWord[];
  total: number;
  page: number;
  pageSize: number;
  source: "local-fallback";
};

function normalizeLocalWord(word: WordItem, index: number): DictionaryFallbackWord {
  const category = word.category ?? (index < 20 ? "高频基础" : "基础词汇");
  const level = word.level ?? (index < 20 ? 0 : 1);
  const frequency = word.frequency ?? Math.max(1, 100 - index);
  return {
    ...word,
    category,
    level,
    frequency,
    difficulty: word.difficulty ?? (level <= 1 ? "easy" : "medium"),
    definitionEn: word.definitionEn ?? `a high-frequency beginner word for ${category}`,
  };
}

const normalizedLocalWords = localWords.map(normalizeLocalWord);

function matchesQuery(word: DictionaryFallbackWord, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  const haystack = [
    word.word,
    word.meaning,
    word.partOfSpeech,
    word.category,
    word.scene,
    word.example,
    word.definitionEn,
    ...(word.phrases ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function getRecommendedLocalWords(query = "", pageSize = 20, page = 1): DictionaryFallbackWord[] {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 80);
  const filtered = normalizedLocalWords.filter((word) => matchesQuery(word, query.trim()));
  const start = (safePage - 1) * safePageSize;
  return filtered.slice(start, start + safePageSize);
}

export function searchLocalDictionary(query = "", pageSize = 20, page = 1): DictionaryFallbackResult {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 80);
  const trimmed = query.trim();
  const filtered = normalizedLocalWords.filter((word) => matchesQuery(word, trimmed));
  const start = (safePage - 1) * safePageSize;
  return {
    items: filtered.slice(start, start + safePageSize),
    total: filtered.length,
    page: safePage,
    pageSize: safePageSize,
    source: "local-fallback",
  };
}
