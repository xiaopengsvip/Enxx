import { analyzeSentence } from "@/lib/sentence-analyzer";

export type GrammarPracticeQuestion = {
  type: "choice" | "blank" | "negative" | "question" | "translate" | "analysis";
  prompt: string;
  answer: string;
  options?: string[];
};

export type GrammarLesson = {
  id: string;
  level: number;
  title: string;
  formula: string;
  simpleExplanation: string;
  examples: string[];
  breakdown: Array<{ part: string; text: string; meaning: string }>;
  commonMistakes: string[];
  practiceQuestions: GrammarPracticeQuestion[];
};

function buildBreakdown(example: string | undefined, fallbackFormula: string): GrammarLesson["breakdown"] {
  if (!example) {
    return [
      { part: "主语", text: "I", meaning: "谁或什么" },
      { part: "谓语 / 结构", text: fallbackFormula, meaning: "句子的骨架" },
    ];
  }
  const analysis = analyzeSentence(example);
  const parts = analysis.parts
    .filter((part) => part.text && part.text !== "—")
    .map((part) => ({ part: part.label, text: part.text, meaning: part.meaning }));
  return parts.length >= 2
    ? parts
    : [
        { part: "主语", text: "I", meaning: "谁或什么" },
        { part: "谓语 / 结构", text: fallbackFormula, meaning: "句子的骨架" },
      ];
}

const mk = (level: number, title: string, formula: string, simpleExplanation: string, examples: string[], commonMistakes: string[] = []): GrammarLesson => ({
  id: `grammar-${level}`,
  level,
  title,
  formula,
  simpleExplanation,
  examples,
  breakdown: buildBreakdown(examples[0], formula),
  commonMistakes: commonMistakes.length ? commonMistakes : ["不要先背术语，先看句子里谁在做什么。"],
  practiceQuestions: [
    { type: "blank", prompt: `${examples[0] ?? "I use English."} 的核心结构是什么？`, answer: formula },
    { type: "translate", prompt: "试着用这个结构写一个和自己有关的英文句子。", answer: examples[0] ?? "I use English." },
  ],
});

export const grammarLessons: GrammarLesson[] = [
  mk(0, "主语、谓语、宾语", "Subject + Verb + Object", "先找动作，再找动作前面的谁和动作后面的对象。", ["I control the light.", "The system opens the door."], ["不要把 every day 这类时间状语当宾语。"]),
  mk(1, "be 动词", "Subject + be + state", "am / is / are 用来说明身份、状态或位置。", ["I am a learner.", "The device is online."], ["I 后面用 am，单数用 is，复数用 are。"]),
  mk(2, "主系表", "Subject + Linking Verb + Complement", "表语说明主语是什么或怎么样。", ["The room is comfortable.", "English is useful."], ["is 后面不是动作，而是状态或身份。"]),
  mk(3, "一般现在时", "Subject + Verb(s) + Object", "表达经常发生的事或现在的事实。", ["I learn English every day.", "She uses the app."], ["he/she/it 后面的动词常加 s。"]),
  mk(4, "否定句", "Subject + do/does + not + Verb", "表达不做某事。", ["I do not control the light.", "He does not use the phone."], ["有 does 后，后面动词用原形。"]),
  mk(5, "疑问句", "Do/Does + Subject + Verb?", "把 do/does 放到句首来提问。", ["Do you use English?", "Does she need help?"], ["问句结尾用问号，does 后动词用原形。"]),
  mk(6, "can / should / must", "Subject + modal + Verb", "情态动词表达能力、建议或必须。", ["I can control the light.", "You should review words."], ["情态动词后面动词用原形。"]),
  mk(7, "一般过去时", "Subject + Verb-ed / past", "表达过去发生的动作。", ["I opened the door yesterday.", "We learned ten words."], ["过去时常和 yesterday/last week 一起出现。"]),
  mk(8, "一般将来时", "Subject + will + Verb", "表达将要做的事。", ["I will review tomorrow.", "The system will send a message."], ["will 后面动词用原形。"]),
  mk(9, "现在进行时", "Subject + be + Verb-ing", "表达正在发生的动作。", ["I am learning English now.", "She is listening."], ["不要漏掉 be 动词。"]),
  mk(10, "there be", "There + be + subject + place", "表达某处有某物。", ["There is a light in the room.", "There are two phones on the desk."], ["单数用 is，复数用 are。"]),
  mk(11, "because 原因句", "Result + because + reason", "说明为什么。", ["I review words because I want to remember them.", "The room is bright because the light is on."], ["because 后面接原因，不单独作完整回答更自然。"]),
  mk(12, "if 条件句", "If + condition, result", "表达如果发生某事，就会怎样。", ["If I practice, I will improve.", "If the door is locked, I feel safe."], ["初学先用 if + 现在时，后面 will。"]),
  mk(13, "when 时间句", "When + time, action", "说明什么时候发生动作。", ["When I get up, I listen to English.", "When the device is online, it sends data."], ["when 引导时间，不是地点。"]),
  mk(14, "to do 目的表达", "Verb + to + Verb", "说明做某事的目的。", ["I use the app to learn English.", "I open the dictionary to check a word."], ["to 后面动词用原形。"]),
  mk(15, "比较级", "A + be + adjective-er/more + than + B", "比较两个事物。", ["This sentence is easier than that one.", "Listening is more important than memorizing."], ["短形容词常加 er，长形容词常用 more。"]),
];
