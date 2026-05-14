"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getNextReviewDate, isDue } from "@/lib/review";
import { createId, todayKey } from "@/lib/utils";
import type { LearningUnitType, MasteryLevel, MistakeItem, PracticeRecord, ReviewItem } from "@/types/learning";

type ReviewInput = {
  type: LearningUnitType;
  sourceId: string;
  title: string;
  content: string;
};

type MistakeInput = Omit<MistakeItem, "id" | "createdAt" | "resolved">;

type PracticeInput = Omit<PracticeRecord, "id" | "createdAt">;

interface LearningState {
  studiedWordIds: string[];
  masteredWordIds: string[];
  favoriteWordIds: string[];
  masteredPatternIds: string[];
  completedSceneIds: string[];
  reviewItems: ReviewItem[];
  mistakes: MistakeItem[];
  practiceRecords: PracticeRecord[];
  firstStudyDate: string;
  lastStudyDate: string;
  streakDays: number;
  todayMinutes: number;
  markWordStudied: (wordId: string) => void;
  toggleFavoriteWord: (wordId: string) => void;
  masterWord: (wordId: string) => void;
  masterPattern: (patternId: string) => void;
  completeScene: (sceneId: string) => void;
  addReviewItem: (item: ReviewInput) => void;
  gradeReviewItem: (id: string, mastery: MasteryLevel) => void;
  addMistake: (mistake: MistakeInput) => void;
  resolveMistake: (id: string) => void;
  recordPractice: (record: PracticeInput) => void;
  addStudyMinutes: (minutes: number) => void;
  dueReviewsCount: () => number;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function updateStreak(state: Pick<LearningState, "lastStudyDate" | "streakDays" | "firstStudyDate">): Pick<LearningState, "lastStudyDate" | "streakDays" | "firstStudyDate"> {
  const today = todayKey();
  if (!state.firstStudyDate) {
    return { firstStudyDate: today, lastStudyDate: today, streakDays: 1 };
  }
  if (state.lastStudyDate === today) {
    return state;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = todayKey(yesterday);
  return {
    firstStudyDate: state.firstStudyDate,
    lastStudyDate: today,
    streakDays: state.lastStudyDate === yesterdayKey ? state.streakDays + 1 : 1,
  };
}

const initialDate = todayKey();

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      studiedWordIds: [],
      masteredWordIds: [],
      favoriteWordIds: [],
      masteredPatternIds: [],
      completedSceneIds: [],
      reviewItems: [],
      mistakes: [],
      practiceRecords: [],
      firstStudyDate: initialDate,
      lastStudyDate: initialDate,
      streakDays: 1,
      todayMinutes: 0,
      markWordStudied: (wordId) =>
        set((state) => ({
          ...updateStreak(state),
          studiedWordIds: unique([...state.studiedWordIds, wordId]),
        })),
      toggleFavoriteWord: (wordId) =>
        set((state) => ({
          favoriteWordIds: state.favoriteWordIds.includes(wordId)
            ? state.favoriteWordIds.filter((id) => id !== wordId)
            : [...state.favoriteWordIds, wordId],
        })),
      masterWord: (wordId) =>
        set((state) => ({
          ...updateStreak(state),
          studiedWordIds: unique([...state.studiedWordIds, wordId]),
          masteredWordIds: unique([...state.masteredWordIds, wordId]),
        })),
      masterPattern: (patternId) =>
        set((state) => ({
          ...updateStreak(state),
          masteredPatternIds: unique([...state.masteredPatternIds, patternId]),
        })),
      completeScene: (sceneId) =>
        set((state) => ({
          ...updateStreak(state),
          completedSceneIds: unique([...state.completedSceneIds, sceneId]),
        })),
      addReviewItem: (item) =>
        set((state) => {
          const exists = state.reviewItems.some((review) => review.type === item.type && review.sourceId === item.sourceId && !review.completed);
          if (exists) {
            return state;
          }
          const review: ReviewItem = {
            id: createId("review"),
            ...item,
            createdAt: new Date().toISOString(),
            dueDate: getNextReviewDate(0, "有点印象"),
            stage: 0,
            mastery: "有点印象",
            completed: false,
          };
          return {
            ...updateStreak(state),
            reviewItems: [review, ...state.reviewItems],
          };
        }),
      gradeReviewItem: (id, mastery) =>
        set((state) => ({
          ...updateStreak(state),
          reviewItems: state.reviewItems.map((item) => {
            if (item.id !== id) {
              return item;
            }
            const nextStage = mastery === "不会" ? 0 : Math.min(item.stage + 1, 4);
            const completed = mastery === "已掌握" && nextStage >= 4;
            return {
              ...item,
              mastery,
              stage: nextStage,
              dueDate: completed ? item.dueDate : getNextReviewDate(nextStage, mastery),
              completed,
            };
          }),
        })),
      addMistake: (mistake) =>
        set((state) => ({
          mistakes: [
            {
              ...mistake,
              id: createId("mistake"),
              createdAt: new Date().toISOString(),
              resolved: false,
            },
            ...state.mistakes,
          ],
        })),
      resolveMistake: (id) =>
        set((state) => ({
          mistakes: state.mistakes.map((mistake) => (mistake.id === id ? { ...mistake, resolved: true } : mistake)),
        })),
      recordPractice: (record) =>
        set((state) => ({
          ...updateStreak(state),
          practiceRecords: [
            {
              ...record,
              id: createId("practice"),
              createdAt: new Date().toISOString(),
            },
            ...state.practiceRecords,
          ].slice(0, 80),
          todayMinutes: state.lastStudyDate === todayKey() ? state.todayMinutes + 3 : 3,
        })),
      addStudyMinutes: (minutes) =>
        set((state) => ({
          ...updateStreak(state),
          todayMinutes: state.lastStudyDate === todayKey() ? state.todayMinutes + minutes : minutes,
        })),
      dueReviewsCount: () => get().reviewItems.filter((item) => !item.completed && isDue(item.dueDate)).length,
    }),
    {
      name: "enxx-learning-progress-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
