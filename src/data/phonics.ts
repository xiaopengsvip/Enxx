export type PhonicsRule = { id: string; title: string; pattern: string; sound: string; explanation: string; examples: Array<{ word: string; sentence: string }>; tips: string[]; audioText: string; };

export const phonicsRules: PhonicsRule[] = [
  {
    "id": "letters-vs-sounds",
    "title": "字母和发音不是完全一样",
    "pattern": "letter ≠ sound",
    "sound": "字母是写法，音标是发音。",
    "explanation": "字母是写法，音标是发音，单词里字母可能有不同发音。",
    "examples": [
      {
        "word": "cat",
        "sentence": "I can read cat."
      },
      {
        "word": "city",
        "sentence": "I can read city."
      },
      {
        "word": "phone",
        "sentence": "I can read phone."
      }
    ],
    "tips": [
      "先看字母，再听发音，不要用汉语拼音硬套。"
    ],
    "audioText": "字母和发音不是完全一样. Examples: cat, city, phone."
  },
  {
    "id": "short-vowels",
    "title": "短元音 Short Vowels",
    "pattern": "a/e/i/o/u",
    "sound": "/æ/ /e/ /ɪ/ /ɒ/ /ʌ/",
    "explanation": "短元音声音短、口型清楚，是拼读入门重点。",
    "examples": [
      {
        "word": "cat",
        "sentence": "I can read cat."
      },
      {
        "word": "bed",
        "sentence": "I can read bed."
      },
      {
        "word": "sit",
        "sentence": "I can read sit."
      },
      {
        "word": "dog",
        "sentence": "I can read dog."
      },
      {
        "word": "cup",
        "sentence": "I can read cup."
      }
    ],
    "tips": [
      "短元音不要拖长。"
    ],
    "audioText": "短元音 Short Vowels. Examples: cat, bed, sit, dog, cup."
  },
  {
    "id": "long-vowels",
    "title": "长元音 Long Vowels",
    "pattern": "a_e/i_e/o_e/ee/oo",
    "sound": "/eɪ/ /aɪ/ /əʊ/ /iː/ /uː/",
    "explanation": "长元音常见于 magic e 和双字母组合。",
    "examples": [
      {
        "word": "make",
        "sentence": "I can read make."
      },
      {
        "word": "time",
        "sentence": "I can read time."
      },
      {
        "word": "home",
        "sentence": "I can read home."
      },
      {
        "word": "see",
        "sentence": "I can read see."
      },
      {
        "word": "food",
        "sentence": "I can read food."
      }
    ],
    "tips": [
      "看到 a_e 常读 /eɪ/，i_e 常读 /aɪ/。"
    ],
    "audioText": "长元音 Long Vowels. Examples: make, time, home, see, food."
  },
  {
    "id": "consonant-blends",
    "title": "常见辅音组合",
    "pattern": "sh/ch/th/ph/ck",
    "sound": "/ʃ/ /tʃ/ /θ/ /ð/ /f/ /k/",
    "explanation": "两个字母组合可能发一个音。",
    "examples": [
      {
        "word": "she",
        "sentence": "I can read she."
      },
      {
        "word": "chair",
        "sentence": "I can read chair."
      },
      {
        "word": "think",
        "sentence": "I can read think."
      },
      {
        "word": "this",
        "sentence": "I can read this."
      },
      {
        "word": "phone",
        "sentence": "I can read phone."
      },
      {
        "word": "black",
        "sentence": "I can read black."
      }
    ],
    "tips": [
      "th 有清浊两种：think 和 this 不一样。"
    ],
    "audioText": "常见辅音组合. Examples: she, chair, think, this, phone, black."
  },
  {
    "id": "endings",
    "title": "常见结尾",
    "pattern": "-ing/-ed/-s",
    "sound": "ending sounds",
    "explanation": "结尾会影响单词节奏和语法含义。",
    "examples": [
      {
        "word": "working",
        "sentence": "I can read working."
      },
      {
        "word": "opened",
        "sentence": "I can read opened."
      },
      {
        "word": "wanted",
        "sentence": "I can read wanted."
      },
      {
        "word": "liked",
        "sentence": "I can read liked."
      },
      {
        "word": "books",
        "sentence": "I can read books."
      },
      {
        "word": "dogs",
        "sentence": "I can read dogs."
      }
    ],
    "tips": [
      "-ed 有 /t/ /d/ /ɪd/ 多种读法。"
    ],
    "audioText": "常见结尾. Examples: working, opened, wanted, liked, books, dogs."
  }
];
