import type { SentencePattern } from "@/types/learning";

export const patterns: SentencePattern[] = [
  {
    id: "sv",
    title: "结构一：主语 + 谓语",
    formulaZh: "主语 + 谓语",
    formulaEn: "Subject + Verb",
    explanation: "表示“谁做了某个动作”。这是最短的句子骨架。",
    examples: [
      { id: "sv-1", text: "I work.", meaning: "我工作。", pattern: "Subject + Verb" },
      { id: "sv-2", text: "The light turns on.", meaning: "灯打开了。", pattern: "Subject + Verb" },
    ],
    breakdown: [
      {
        sentence: "I work.",
        parts: [
          { label: "主语", text: "I", meaning: "我，动作发出者" },
          { label: "谓语", text: "work", meaning: "工作，动作" },
        ],
      },
    ],
    exercises: [
      { prompt: "用 I + work 写一句完整句子。", answer: "I work.", hint: "谁 + 做什么" },
      { prompt: "用 The light + turns on 写一句。", answer: "The light turns on.", hint: "灯自己发生了打开这个动作" },
    ],
  },
  {
    id: "svo",
    title: "结构二：主语 + 谓语 + 宾语",
    formulaZh: "主语 + 谓语 + 宾语",
    formulaEn: "Subject + Verb + Object",
    explanation: "表示“谁做某事，作用到某个对象”。这是最常用的英语句子结构。",
    examples: [
      { id: "svo-1", text: "I control the light.", meaning: "我控制灯光。", pattern: "Subject + Verb + Object" },
      { id: "svo-2", text: "Evo opens the curtain.", meaning: "Evo 打开窗帘。", pattern: "Subject + Verb + Object" },
    ],
    breakdown: [
      {
        sentence: "I control the light.",
        parts: [
          { label: "主语", text: "I", meaning: "我" },
          { label: "谓语", text: "control", meaning: "控制" },
          { label: "宾语", text: "the light", meaning: "灯光，被控制的对象" },
        ],
      },
    ],
    exercises: [
      { prompt: "把“我控制灯光”写成英文。", answer: "I control the light.", hint: "I + control + the light" },
      { prompt: "用 open 和 door 写一句。", answer: "I open the door.", hint: "主语可以用 I" },
    ],
  },
  {
    id: "slc",
    title: "结构三：主语 + 系动词 + 表语",
    formulaZh: "主语 + 系动词 + 表语",
    formulaEn: "Subject + Linking Verb + Complement",
    explanation: "表示“谁是什么 / 谁怎么样”。am、is、are 常用来连接主语和状态。",
    examples: [
      { id: "slc-1", text: "I am an engineer.", meaning: "我是一名工程师。", pattern: "Subject + Linking Verb + Complement" },
      { id: "slc-2", text: "The system is smart.", meaning: "系统很智能。", pattern: "Subject + Linking Verb + Complement" },
      { id: "slc-3", text: "The room feels comfortable.", meaning: "房间感觉很舒服。", pattern: "Subject + Linking Verb + Complement" },
    ],
    breakdown: [
      {
        sentence: "The system is smart.",
        parts: [
          { label: "主语", text: "The system", meaning: "系统" },
          { label: "系动词", text: "is", meaning: "是 / 处于某种状态" },
          { label: "表语", text: "smart", meaning: "智能的，说明系统怎么样" },
        ],
      },
    ],
    exercises: [
      { prompt: "把“设备在线”写成英文。", answer: "The device is online.", hint: "The device + is + online" },
      { prompt: "把“房间很舒服”写成英文。", answer: "The room is comfortable.", hint: "The room + is + comfortable" },
    ],
  },
  {
    id: "sviodo",
    title: "结构四：主语 + 谓语 + 间接宾语 + 直接宾语",
    formulaZh: "主语 + 谓语 + 间接宾语 + 直接宾语",
    formulaEn: "Subject + Verb + Indirect Object + Direct Object",
    explanation: "表示“谁给谁什么”。先说给谁，再说给什么。",
    examples: [
      { id: "sviodo-1", text: "I give him a device.", meaning: "我给他一个设备。", pattern: "Subject + Verb + Indirect Object + Direct Object" },
      { id: "sviodo-2", text: "Evo sends me a message.", meaning: "Evo 给我发一条消息。", pattern: "Subject + Verb + Indirect Object + Direct Object" },
    ],
    breakdown: [
      {
        sentence: "Evo sends me a message.",
        parts: [
          { label: "主语", text: "Evo", meaning: "发送者" },
          { label: "谓语", text: "sends", meaning: "发送" },
          { label: "间接宾语", text: "me", meaning: "给我" },
          { label: "直接宾语", text: "a message", meaning: "一条消息" },
        ],
      },
    ],
    exercises: [
      { prompt: "把“我给他一个设备”写成英文。", answer: "I give him a device.", hint: "I + give + him + a device" },
      { prompt: "把“Evo 给我一条消息”写成英文。", answer: "Evo sends me a message.", hint: "send 第三人称要用 sends" },
    ],
  },
  {
    id: "svoc",
    title: "结构五：主语 + 谓语 + 宾语 + 宾语补足语",
    formulaZh: "主语 + 谓语 + 宾语 + 宾语补足语",
    formulaEn: "Subject + Verb + Object + Object Complement",
    explanation: "表示“谁让某个东西变成某种状态”。最后一部分补充说明宾语的结果。",
    examples: [
      { id: "svoc-1", text: "I make the room comfortable.", meaning: "我让房间变舒服。", pattern: "Subject + Verb + Object + Object Complement" },
      { id: "svoc-2", text: "The system keeps the door locked.", meaning: "系统让门保持锁定。", pattern: "Subject + Verb + Object + Object Complement" },
      { id: "svoc-3", text: "We call it Evo.", meaning: "我们叫它 Evo。", pattern: "Subject + Verb + Object + Object Complement" },
    ],
    breakdown: [
      {
        sentence: "The system keeps the door locked.",
        parts: [
          { label: "主语", text: "The system", meaning: "系统" },
          { label: "谓语", text: "keeps", meaning: "保持" },
          { label: "宾语", text: "the door", meaning: "门" },
          { label: "宾语补足语", text: "locked", meaning: "锁住的，说明门的状态" },
        ],
      },
    ],
    exercises: [
      { prompt: "把“我让房间舒服”写成英文。", answer: "I make the room comfortable.", hint: "make + 宾语 + 状态" },
      { prompt: "把“我们叫它 Evo”写成英文。", answer: "We call it Evo.", hint: "call + it + 名字" },
    ],
  },
];
