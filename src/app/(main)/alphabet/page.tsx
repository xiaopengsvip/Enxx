"use client";

import { useMemo, useState } from "react";
import { alphabetLetters } from "@/data/alphabet";
import { phoneticSymbols } from "@/data/phonetics";
import { phonicsRules } from "@/data/phonics";
import { words } from "@/data/words";
import { scenes } from "@/data/scenes";
import { speakText, stopSpeech } from "@/lib/speech";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SpeakButton } from "@/components/learning/speak-button";
import { cn } from "@/lib/utils";

type Tab = "alphabet" | "phonetics" | "phonics" | "listen";
type ListenType = "letters" | "words" | "phonetics" | "scenes";

const tabs: Array<{ id: Tab; label: string; zh: string }> = [
  { id: "alphabet", label: "Alphabet", zh: "字母" },
  { id: "phonetics", label: "Phonetics", zh: "音标" },
  { id: "phonics", label: "Phonics", zh: "自然拼读" },
  { id: "listen", label: "Listen Mode", zh: "听着学习" },
];

const comparePairs = ["/iː/ vs /ɪ/", "/æ/ vs /e/", "/uː/ vs /ʊ/", "/θ/ vs /s/", "/ð/ vs /z/"];

export default function AlphabetPage() {
  const [tab, setTab] = useState<Tab>("alphabet");
  const [selectedLetter, setSelectedLetter] = useState(alphabetLetters[0]);
  const [listenType, setListenType] = useState<ListenType>("letters");
  const [listenIndex, setListenIndex] = useState(0);
  const [rate, setRate] = useState(0.85);

  const listenItems = useMemo(() => {
    if (listenType === "letters") {
      return alphabetLetters.map((item) => ({ title: `${item.uppercase} ${item.lowercase}`, subtitle: `${item.exampleWord} · ${item.exampleMeaning}`, text: item.audioText }));
    }
    if (listenType === "phonetics") {
      return phoneticSymbols.map((item) => ({ title: `${item.symbol} · ${item.exampleWord}`, subtitle: item.exampleMeaning, text: `${item.symbol}, ${item.exampleWord}. ${item.exampleSentence}` }));
    }
    if (listenType === "scenes") {
      return scenes.flatMap((scene) => scene.sentences.map((sentence) => ({ title: scene.englishName, subtitle: scene.name, text: sentence })));
    }
    return words.slice(0, 80).map((item) => ({ title: item.word, subtitle: item.meaning, text: `${item.word}, ${item.meaning}. ${item.example}` }));
  }, [listenType]);

  const currentListen = listenItems[Math.min(listenIndex, listenItems.length - 1)] ?? listenItems[0];

  function playCurrent() {
    if (currentListen) speakText(currentListen.text, { rate });
  }

  function move(step: number) {
    stopSpeech();
    setListenIndex((current) => (current + step + listenItems.length) % listenItems.length);
  }

  function switchListenType(next: ListenType) {
    stopSpeech();
    setListenType(next);
    setListenIndex(0);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative p-6 sm:p-8">
            <span className="liquid-orb left-[-2rem] top-[-2rem] h-40 w-40 bg-sky-300/45" />
            <span className="liquid-orb bottom-[-2rem] right-[12%] h-44 w-44 bg-violet-300/35 [animation-delay:1.4s]" />
            <div className="relative">
              <Badge>Alphabet & Phonetics</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-950 dark:text-white sm:text-6xl">字母与音标</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">字母不是只看形状，还要听发音。先听，再跟读，再放进单词里记。</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">音标不是为了复杂，而是帮你知道单词怎么读。自然拼读可以帮你看到单词时，大概猜出它怎么发音。</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-black text-sky-600 dark:text-sky-200">每天听 5 分钟</p>
          <h2 className="mt-3 text-3xl font-black">比只看单词更容易形成语感</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">这里的内容面向成人零基础自学：字母、音标、自然拼读都服务于“听懂、读准、放进句子”。</p>
        </Card>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("rounded-full px-4 py-2 text-sm font-black transition", tab === item.id ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-[0_14px_34px_rgba(37,99,235,.24)]" : "liquid-chip text-slate-600 dark:text-slate-200")}>
            {item.zh} <span className="hidden sm:inline">· {item.label}</span>
          </button>
        ))}
      </div>

      {tab === "alphabet" ? (
        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-black">26 个英文字母</h2><Badge>A-Z</Badge></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {alphabetLetters.map((letter) => (
                <button key={letter.id} type="button" onClick={() => setSelectedLetter(letter)} className={cn("rounded-[1.7rem] border p-4 text-left transition hover:-translate-y-1", selectedLetter.id === letter.id ? "border-sky-300 bg-sky-50 shadow-[0_18px_45px_rgba(37,99,235,.16)] dark:border-sky-300/30 dark:bg-sky-400/10" : "border-white/50 bg-white/48 dark:border-white/10 dark:bg-white/5")}>
                  <div className="flex items-start justify-between gap-2"><span className="text-5xl font-black tracking-[-0.08em]">{letter.uppercase}</span><SpeakButton text={letter.audioText} /></div>
                  <p className="mt-1 text-3xl font-black text-slate-500 dark:text-slate-300">{letter.lowercase}</p>
                  <p className="mt-2 inline-flex rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-sky-700 dark:bg-white/10 dark:text-sky-100">{letter.phonetic}</p>
                  <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">{letter.exampleWord} · {letter.exampleMeaning}</p>
                </button>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div><Badge>Letter Detail</Badge><h2 className="mt-3 text-6xl font-black tracking-[-0.08em]">{selectedLetter.uppercase}<span className="ml-3 text-4xl text-slate-400">{selectedLetter.lowercase}</span></h2></div>
              <SpeakButton text={selectedLetter.audioText} size="md" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5"><p className="text-xs font-black text-slate-500">字母名称</p><p className="mt-1 text-xl font-black">{selectedLetter.letterName} {selectedLetter.phonetic}</p></div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5"><p className="text-xs font-black text-slate-500">示例单词</p><p className="mt-1 text-xl font-black">{selectedLetter.exampleWord}</p><p className="text-sm text-slate-500">{selectedLetter.exampleMeaning}</p></div>
            </div>
            <div className="rounded-3xl bg-violet-50 p-4 dark:bg-violet-400/10"><p className="font-black">{selectedLetter.exampleSentence}</p></div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">书写提示：{selectedLetter.writingTip}</p>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">发音提示：{selectedLetter.pronunciationTip}</p>
            <Button variant="secondary">加入复习</Button>
            <div className="rounded-3xl border border-slate-200 p-4 text-sm dark:border-white/10"><p className="font-black">大小写配对练习</p><p className="mt-2 text-slate-500">看到 {selectedLetter.uppercase}，请选择 {selectedLetter.lowercase}。下一个字母是 {alphabetLetters[(alphabetLetters.findIndex((x) => x.id === selectedLetter.id) + 1) % alphabetLetters.length].uppercase}。</p></div>
          </Card>
        </section>
      ) : null}

      {tab === "phonetics" ? (
        <section className="space-y-5">
          <Card><h2 className="text-2xl font-black">基础音标</h2><p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">先掌握常见元音和辅音，再回到单词里听、读、跟读。</p></Card>
          {(["vowel", "consonant"] as const).map((type) => (
            <div key={type} className="space-y-3"><h3 className="text-xl font-black">{type === "vowel" ? "元音 Vowels" : "辅音 Consonants"}</h3><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{phoneticSymbols.filter((item) => item.type === type).map((item) => <Card key={item.id} className="space-y-3 p-5"><div className="flex items-start justify-between"><div><p className="text-4xl font-black text-sky-600 dark:text-sky-200">{item.symbol}</p><p className="mt-1 font-black">{item.exampleWord} · {item.exampleMeaning}</p></div><SpeakButton text={item.audioText} /></div><p className="text-sm text-slate-500">{item.exampleSentence}</p><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.pronunciationTip}</p><p className="text-xs font-bold text-slate-500">口型：{item.mouthTip}</p><Badge>{item.difficulty}</Badge></Card>)}</div></div>
          ))}
          <Card><h3 className="text-xl font-black">音标对比练习</h3><div className="mt-3 flex flex-wrap gap-2">{comparePairs.map((pair) => <span key={pair} className="rounded-full bg-sky-100 px-3 py-2 text-sm font-black text-sky-700 dark:bg-sky-400/10 dark:text-sky-100">{pair}</span>)}</div></Card>
        </section>
      ) : null}

      {tab === "phonics" ? (
        <section className="grid gap-4 md:grid-cols-2">
          {phonicsRules.map((rule) => <Card key={rule.id} className="space-y-4"><div className="flex items-start justify-between gap-3"><div><Badge>{rule.pattern}</Badge><h2 className="mt-3 text-2xl font-black">{rule.title}</h2></div><SpeakButton text={rule.audioText} /></div><p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{rule.explanation}</p><div className="flex flex-wrap gap-2">{rule.examples.map((example) => <span key={example.word} className="rounded-full bg-white/65 px-3 py-2 text-sm font-black text-slate-700 dark:bg-white/10 dark:text-slate-100">{example.word}</span>)}</div><ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400">{rule.tips.map((tip) => <li key={tip}>• {tip}</li>)}</ul></Card>)}
        </section>
      ) : null}

      {tab === "listen" ? (
        <section className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <Card className="space-y-5"><h2 className="text-2xl font-black">听着学习模式</h2><p className="text-sm leading-7 text-slate-600 dark:text-slate-300">选择内容类型，连续听字母、单词、音标示例和场景短句。</p><div className="grid grid-cols-2 gap-2">{([{ id: "letters", label: "字母" }, { id: "words", label: "单词" }, { id: "phonetics", label: "音标" }, { id: "scenes", label: "场景句" }] as Array<{ id: ListenType; label: string }>).map((item) => <button key={item.id} type="button" onClick={() => switchListenType(item.id)} className={cn("rounded-3xl px-4 py-3 text-sm font-black", listenType === item.id ? "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-100" : "liquid-chip")}>{item.label}</button>)}</div><div className="flex flex-wrap gap-2">{[{ value: 0.65, label: "慢速" }, { value: 0.85, label: "标准" }, { value: 1, label: "正常" }].map((item) => <button key={item.value} type="button" onClick={() => setRate(item.value)} className={cn("rounded-full px-3 py-2 text-xs font-black", rate === item.value ? "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-100" : "liquid-chip")}>{item.label}</button>)}</div></Card>
          <Card className="space-y-5"><div className="flex items-center justify-between gap-3"><Badge>{listenIndex + 1} / {listenItems.length}</Badge><p className="text-sm font-black text-slate-500">rate {rate}</p></div><div className="rounded-[2rem] bg-slate-50 p-6 dark:bg-white/5"><p className="text-4xl font-black tracking-[-0.05em]">{currentListen?.title}</p><p className="mt-2 text-lg font-bold text-sky-600 dark:text-sky-200">{currentListen?.subtitle}</p><p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{currentListen?.text}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => move(-1)}>上一条</Button><Button onClick={playCurrent}>播放</Button><Button variant="danger" onClick={stopSpeech}>停止</Button><Button variant="secondary" onClick={() => move(1)}>下一条</Button></div></Card>
        </section>
      ) : null}
    </div>
  );
}
