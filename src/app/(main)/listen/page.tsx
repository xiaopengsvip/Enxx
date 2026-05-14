import { ListenPlayer, type ListenTrack } from "@/components/learning/listen-player";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { scenes } from "@/data/scenes";
import { words } from "@/data/words";

const letters: ListenTrack[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({ id: `letter-${letter}`, type: "letters", title: `Letter ${letter}`, english: `${letter}, ${letter.toLowerCase()}, apple. ${letter} is for apple.`, chinese: `${letter} 字母听读。` }));
const phonetics: ListenTrack[] = ["/iː/, see. I can see it.", "/ɪ/, sit. I sit here.", "/e/, bed. The bed is clean.", "/æ/, apple. I have an apple.", "/uː/, room. The room is comfortable."].map((english, index) => ({ id: `phonetic-${index}`, type: "phonetics", title: english.split(",")[0], english, chinese: "先听音，再跟读。" }));
const wordTracks: ListenTrack[] = words.slice(0, 30).map((word) => ({ id: `word-${word.id}`, type: "words", title: word.word, english: `${word.word}. ${word.example}`, chinese: `${word.meaning}。${word.exampleMeaning}` }));
const exampleTracks: ListenTrack[] = words.slice(0, 30).map((word) => ({ id: `example-${word.id}`, type: "examples", title: word.example, english: word.example, chinese: word.exampleMeaning }));
const sceneTracks: ListenTrack[] = scenes.flatMap((scene) => scene.sentences.slice(0, 3).map((sentence, index) => ({ id: `scene-${scene.id}-${index}`, type: "scenes" as const, title: scene.name, english: sentence, chinese: scene.description })));
const tracks = [...letters, ...phonetics, ...wordTracks, ...exampleTracks, ...sceneTracks, { id: "review-empty", type: "review" as const, title: "今日复习", english: "Review one word. Speak one sentence.", chinese: "打开复习页完成你的复习卡。" }];

export default function ListenPage() {
  return <div className="space-y-6"><Card className="space-y-4"><Badge>Listen Player</Badge><h1 className="text-4xl font-black tracking-[-0.05em]">听着学习</h1><p className="text-sm leading-7 text-slate-600 dark:text-slate-300">连续听字母、音标、单词、例句和场景句。先让耳朵熟悉，再开口跟读。</p></Card><ListenPlayer tracks={tracks} /></div>;
}
