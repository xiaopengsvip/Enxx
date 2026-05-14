import { PatternCard } from "@/components/learning/PatternCard";
import { SentenceAnalyzerTool } from "@/components/learning/SentenceAnalyzerTool";
import { Badge } from "@/components/ui/Badge";
import { patterns } from "@/data/patterns";

export default function StructuresPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <Badge>Sentence Structure</Badge>
        <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">句子结构</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">先掌握 5 个基础句型，再用它们拼出自己的句子。句子结构就是英语的组装方式。</p>
      </div>
      <SentenceAnalyzerTool />
      <div className="space-y-5">
        {patterns.map((pattern) => <PatternCard key={pattern.id} pattern={pattern} />)}
      </div>
    </div>
  );
}
