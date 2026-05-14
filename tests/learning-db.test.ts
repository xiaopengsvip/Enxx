import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  buildWordLookupCandidates,
  mapDbMistakeToClient,
  mapDbReviewToClient,
  toDbReviewType,
} from "../src/lib/learning-db";

test("review DB records are normalized for the client review page", () => {
  const createdAt = new Date("2026-05-01T08:00:00.000Z");
  const dueAt = new Date("2026-05-02T08:00:00.000Z");
  const item = mapDbReviewToClient({
    id: "rv_1",
    type: "WORD",
    contentId: "word-i",
    contentSnapshot: { sourceId: "i", title: "I", content: "我｜I use ChatGPT." },
    masteryLevel: 70,
    reviewCount: 2,
    createdAt,
    nextReviewAt: dueAt,
  });

  assert.deepEqual(item, {
    id: "rv_1",
    type: "word",
    sourceId: "i",
    title: "I",
    content: "我｜I use ChatGPT.",
    createdAt: createdAt.toISOString(),
    dueDate: dueAt.toISOString(),
    stage: 2,
    mastery: "基本会",
    completed: false,
  });
});

test("mastered review records become completed client records", () => {
  const createdAt = new Date("2026-05-01T08:00:00.000Z");
  const item = mapDbReviewToClient({
    id: "rv_done",
    type: "MISTAKE",
    contentId: null,
    contentSnapshot: { title: "错题复盘", content: "复盘一个错误" },
    masteryLevel: 100,
    reviewCount: 5,
    createdAt,
    nextReviewAt: null,
  });

  assert.equal(item.type, "practice");
  assert.equal(item.mastery, "已掌握");
  assert.equal(item.completed, true);
  assert.equal(item.dueDate, createdAt.toISOString());
});

test("mistake DB records are normalized for the client mistakes page", () => {
  const createdAt = new Date("2026-05-03T08:00:00.000Z");
  const item = mapDbMistakeToClient({
    id: "mk_1",
    question: "Use login in a sentence",
    userAnswer: "I login page",
    correctAnswer: "I log in to the page.",
    explanation: "login 是名词，log in 是动词短语。",
    resolved: false,
    createdAt,
  });

  assert.deepEqual(item, {
    id: "mk_1",
    question: "Use login in a sentence",
    userAnswer: "I login page",
    correctAnswer: "I log in to the page.",
    reason: "login 是名词，log in 是动词短语。",
    createdAt: createdAt.toISOString(),
    resolved: false,
  });
});

test("frontend word slugs can be resolved to seeded DB words", () => {
  assert.deepEqual(buildWordLookupCandidates({ wordId: "air-conditioner", word: "air conditioner" }), [
    "air-conditioner",
    "air conditioner",
  ]);
  assert.deepEqual(buildWordLookupCandidates({ wordId: "i", word: "I" }), ["i", "I"]);
});

test("client review types map to Prisma review enum values", () => {
  assert.equal(toDbReviewType("word"), "WORD");
  assert.equal(toDbReviewType("sentence"), "SENTENCE");
  assert.equal(toDbReviewType("pattern"), "PATTERN");
  assert.equal(toDbReviewType("scene"), "SCENE");
  assert.equal(toDbReviewType("practice"), "MISTAKE");
});
