import { strict as assert } from "node:assert";
import { test } from "node:test";
import { dailyPlanTemplate, totalDailyPlanMinutes } from "../src/data/daily-plan";
import { grammarLessons } from "../src/data/grammar";
import { badgeCatalog, evaluateBadges } from "../src/data/badges";
import { calculateUserLevel, getLevelInfo, calculateStreakStats } from "../src/lib/level";
import { analyzeSentence } from "../src/lib/sentence-analyzer";
import { getRecommendedLocalWords } from "../src/lib/dictionary-fallback";

test("daily plan defines a six-step 10-minute learning loop", () => {
  assert.deepEqual(dailyPlanTemplate.map((item) => item.id), ["listen", "words", "pattern", "sentence", "dictionary", "review"]);
  assert.equal(dailyPlanTemplate[4].href, "/dictionary");
  assert.equal(totalDailyPlanMinutes(dailyPlanTemplate), 13);
});

test("grammar path covers levels 0 through 15 in order", () => {
  assert.equal(grammarLessons.length, 16);
  assert.deepEqual(grammarLessons.map((lesson) => lesson.level), Array.from({ length: 16 }, (_, index) => index));
  assert.equal(grammarLessons[0].title, "主语、谓语、宾语");
  assert.equal(grammarLessons[15].title, "比较级");
});

test("sentence analyzer recognizes core beginner sentence patterns", () => {
  assert.equal(analyzeSentence("The system controls the room automatically.").pattern, "Subject + Verb + Object + Adverb");
  assert.equal(analyzeSentence("The room is comfortable.").pattern, "Subject + Linking Verb + Complement");
  assert.equal(analyzeSentence("There is a light in the room.").pattern, "There be + Subject + Place");
  assert.equal(analyzeSentence("I can control the light.").pattern, "Subject + Modal Verb + Verb + Object");
  assert.equal(analyzeSentence("I do not control the light.").pattern, "Subject + Auxiliary + Not + Verb + Object");
});

test("grammar lesson 0 breaks I control the light into subject verb and object", () => {
  const firstLesson = grammarLessons[0];
  assert.equal(firstLesson.examples[0], "I control the light.");
  assert.deepEqual(
    firstLesson.breakdown.map((part) => [part.part, part.text]),
    [
      ["主语", "I"],
      ["谓语", "control"],
      ["宾语", "the light"],
    ],
  );
});

test("dictionary local fallback returns 20 recommended high-frequency words for empty search", () => {
  const recommended = getRecommendedLocalWords("", 20);
  assert.equal(recommended.length, 20);
  assert.equal(recommended[0].word, "I");
  assert.ok(recommended.some((word) => word.word === "control"));
});

test("level calculator follows ENXX progression rules", () => {
  assert.deepEqual(getLevelInfo(0), { level: 0, zh: "零基础", en: "Zero" });
  assert.equal(calculateUserLevel({ alphabetCompleted: true, learnedWords: 99, masteredPatterns: 0, completedScenes: 0, streakDays: 0 }), 1);
  assert.equal(calculateUserLevel({ alphabetCompleted: true, learnedWords: 100, masteredPatterns: 19, completedScenes: 0, streakDays: 0 }), 2);
  assert.equal(calculateUserLevel({ alphabetCompleted: true, learnedWords: 100, masteredPatterns: 20, completedScenes: 9, streakDays: 0 }), 3);
  assert.equal(calculateUserLevel({ alphabetCompleted: true, learnedWords: 100, masteredPatterns: 20, completedScenes: 10, streakDays: 29 }), 4);
  assert.equal(calculateUserLevel({ alphabetCompleted: true, learnedWords: 100, masteredPatterns: 20, completedScenes: 10, streakDays: 30 }), 5);
});

test("streak stats derive current, longest, week, and month counts from study log dates", () => {
  const stats = calculateStreakStats(["2026-05-01", "2026-05-10", "2026-05-11", "2026-05-12", "2026-05-14"], new Date("2026-05-14T12:00:00+08:00"));
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.longestStreak, 3);
  assert.equal(stats.weekStudyDays, 4);
  assert.equal(stats.monthStudyDays, 5);
  assert.equal(stats.todayCompleted, true);
});

test("badge evaluation returns earned learning badges", () => {
  assert.ok(badgeCatalog.length >= 10);
  const badges = evaluateBadges({ alphabetCompleted: true, phonicsCompleted: true, learnedWords: 100, masteredPatterns: 1, streakDays: 7, aiTutorUses: 1, dictionaryLookups: 1, notes: 1, savedSentences: 100, completedReviews: 100 });
  assert.ok(badges.some((badge) => badge.id === "hundred-words"));
  assert.ok(badges.some((badge) => badge.id === "review-master"));
});
