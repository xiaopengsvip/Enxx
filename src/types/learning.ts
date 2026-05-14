export type MasteryLevel = "不会" | "有点印象" | "基本会" | "已掌握";

export type LearningUnitType = "word" | "pattern" | "scene" | "sentence" | "practice";

export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string;
  partOfSpeech: string;
  example: string;
  exampleMeaning: string;
  scene: string;
  category?: string;
  level?: number;
  definitionEn?: string | null;
  phrases?: string[];
  forms?: Record<string, string>;
  synonyms?: string[];
  antonyms?: string[];
  usageNotes?: string | null;
  commonMistake?: string | null;
  difficulty?: string | null;
  frequency?: number | null;
}

export interface SentenceItem {
  id: string;
  text: string;
  meaning: string;
  pattern: string;
}

export interface SentencePart {
  label: string;
  text: string;
  meaning: string;
}

export interface PatternExercise {
  prompt: string;
  answer: string;
  hint: string;
}

export interface SentencePattern {
  id: string;
  title: string;
  formulaZh: string;
  formulaEn: string;
  explanation: string;
  examples: SentenceItem[];
  breakdown: Array<{
    sentence: string;
    parts: SentencePart[];
  }>;
  exercises: PatternExercise[];
}

export interface SceneQuiz {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface LearningScene {
  id: string;
  name: string;
  englishName: string;
  description: string;
  words: string[];
  sentences: string[];
  actionPatterns: string[];
  quiz: SceneQuiz;
}

export interface ReviewItem {
  id: string;
  type: LearningUnitType;
  sourceId: string;
  title: string;
  content: string;
  createdAt: string;
  dueDate: string;
  stage: number;
  mastery: MasteryLevel;
  completed: boolean;
}

export interface MistakeItem {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  reason: string;
  createdAt: string;
  resolved: boolean;
}

export interface PracticeRecord {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  isCorrect: boolean;
}

export interface SentenceAnalysis {
  original: string;
  sentence?: string;
  subject: string;
  verb: string;
  object: string;
  complement: string;
  adverb: string;
  adverbial?: string;
  chineseMeaning: string;
  translation?: string;
  skeleton: string;
  pattern?: string;
  parts: SentencePart[];
  tip: string;
  explanation?: string;
  confidence?: number;
}

export interface AiCheckResponse {
  isCorrect: boolean;
  suggestion: string;
  simpleReason: string;
  encouragement: string;
  examples: string[];
  analysis: SentenceAnalysis;
}

export interface AiTranslateResponse {
  input: string;
  english: string;
  breakdown: SentencePart[];
  structure: string;
  note: string;
}

export interface AiPracticeResponse {
  title: string;
  sentences: string[];
  task: string;
  tip: string;
}
