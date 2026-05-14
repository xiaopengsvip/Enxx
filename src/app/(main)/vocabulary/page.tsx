import { WordCard } from "@/components/learning/WordCard";
import { Badge } from "@/components/ui/Badge";
import { words } from "@/data/words";

export default function VocabularyPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <Badge>Vocabulary</Badge>
        <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">单词学习</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">每个单词都配一个简单例句、中文解释、场景联想和用户造句检查。不要孤立背词，把词放进句子里。</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {words.map((word) => <WordCard key={word.id} word={word} />)}
      </div>
    </div>
  );
}
