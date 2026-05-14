import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const levels = [
  {
    level: 0,
    title: "认识英语",
    goals: ["26 个英文字母大小写", "字母名称发音", "基础音标", "自然拼读入门", "什么是单词", "什么是句子", "主语、谓语、宾语基础"],
    words: 26,
    patterns: 3,
    practices: 50,
    href: "/alphabet",
    cta: "开始学习字母与音标",
  },
  { level: 1, title: "高频基础词", goals: ["100 个基础高频词", "单词 + 音标 + 例句", "单词发音试听", "例句发音试听"], words: 100, patterns: 5, practices: 60, href: "/vocabulary", cta: "开始学单词" },
  { level: 2, title: "基础句子结构", goals: ["主谓", "主谓宾", "系表结构", "把单词放进句子"], words: 150, patterns: 20, practices: 80, href: "/structures", cta: "学句子结构" },
  { level: 3, title: "常用时态", goals: ["现在", "过去", "将来", "正在进行"], words: 200, patterns: 28, practices: 100, href: "/structures", cta: "练时态" },
  { level: 4, title: "疑问句和否定句", goals: ["Do you", "Does he", "I do not", "Can I"], words: 240, patterns: 36, practices: 120, href: "/ai-tutor", cta: "用 AI 检查" },
  { level: 5, title: "生活场景表达", goals: ["日常生活", "餐厅点餐", "购物付款", "酒店入住"], words: 300, patterns: 42, practices: 150, href: "/scenes", cta: "练生活场景" },
  { level: 6, title: "工作和技术英语", goals: ["工作沟通", "项目介绍", "网络服务器", "AI 系统"], words: 360, patterns: 50, practices: 180, href: "/scenes", cta: "练工作英语" },
  { level: 7, title: "AI 英语陪练", goals: ["中文转英文", "语法检查", "主谓宾拆解", "生成练习"], words: 420, patterns: 60, practices: 220, href: "/ai-tutor", cta: "打开 AI Tutor" },
];

export default function LearnPathPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <Card>
          <Badge>Learn Path</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-950 dark:text-white sm:text-6xl">英语自学路线</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">从字母、音标、自然拼读开始，再进入高频词、基础句子结构、场景表达和 AI 陪练。</p>
        </Card>
        <Card>
          <p className="text-sm font-black text-sky-600 dark:text-sky-200">学习闭环</p>
          <h2 className="mt-3 text-3xl font-black">听 → 跟读 → 造句 → 检查 → 复习</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">不要只背单词。每个阶段都要把词放进句子和场景里。</p>
        </Card>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {levels.map((item) => (
          <Card key={item.level} className="flex h-full flex-col gap-4">
            <div>
              <Badge>Level {item.level}</Badge>
              <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {item.goals.map((goal) => <li key={goal}>• {goal}</li>)}
            </ul>
            <div className="mt-auto grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-lg font-black text-sky-600">{item.words}</p><p>单词</p></div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-lg font-black text-violet-600">{item.patterns}</p><p>句型</p></div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-lg font-black text-teal-600">{item.practices}</p><p>练习</p></div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-500" style={{ width: `${item.level === 0 ? 12 : 0}%` }} /></div>
            <Link href={item.href}><Button>{item.cta}</Button></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
