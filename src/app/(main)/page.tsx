"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { siteConfig } from "@/config/site";
import { patterns } from "@/data/patterns";
import { scenes } from "@/data/scenes";
import { sentences } from "@/data/sentences";
import { words } from "@/data/words";
import { clamp } from "@/lib/utils";
import { useLearningStore } from "@/store/learning-store";

const quickLinks = [
  { href: "/daily-plan", label: "今日 10 分钟学习", detail: "听、学、练、查、复习", icon: "Plan" },
  { href: "/dictionary", label: "英语字典", detail: "查词即学习：音标、例句、复习、笔记", icon: "Dict" },
  { href: "/listen", label: "听着学习", detail: "字母、音标、单词、例句连续听", icon: "Listen" },
  { href: "/grammar", label: "语法路线", detail: "从主谓宾到时态和从句", icon: "Grammar" },
  { href: "/analyzer", label: "句子拆解", detail: "主语、谓语、宾语一眼看清", icon: "SVO" },
  { href: "/ai-tutor", label: "AI 陪练", detail: "中文转英文与语法检查", icon: "AI" },
  { href: "/review", label: "今日复习", detail: "1-3-7-15 复习法", icon: "1·3·7" },
  { href: "/progress", label: "查看进度", detail: "等级、打卡、徽章和统计", icon: "Data" },
];

const pathSteps = ["单词", "短句", "结构", "场景", "AI 检查", "复习"];
const heroCnName = siteConfig.cnName.split(" ").slice(1).join(" ") || siteConfig.cnName;

export default function DashboardPage() {
  const studiedWordIds = useLearningStore((state) => state.studiedWordIds);
  const masteredWordIds = useLearningStore((state) => state.masteredWordIds);
  const masteredPatternIds = useLearningStore((state) => state.masteredPatternIds);
  const completedSceneIds = useLearningStore((state) => state.completedSceneIds);
  const practiceRecords = useLearningStore((state) => state.practiceRecords);
  const streakDays = useLearningStore((state) => state.streakDays);
  const dueReviewsCount = useLearningStore((state) => state.dueReviewsCount);
  const dueCount = dueReviewsCount();
  const totalUnits = words.length + patterns.length + scenes.length + sentences.length;
  const completedUnits = masteredWordIds.length + masteredPatternIds.length + completedSceneIds.length + practiceRecords.length;
  const progress = clamp(Math.round((completedUnits / totalUnits) * 100), 0, 100);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative min-h-[520px] p-6 sm:p-9 lg:p-10">
            <span className="liquid-orb left-[-3rem] top-[-2rem] h-44 w-44 bg-sky-300/50" />
            <span className="liquid-orb right-[8%] top-[8%] h-52 w-52 bg-violet-300/40 [animation-delay:1.2s]" />
            <span className="liquid-orb bottom-[6%] right-[28%] h-36 w-36 bg-teal-300/35 [animation-delay:2s]" />
            <span className="liquid-sheen" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
              <div>
                <Badge>Liquid Glass · {siteConfig.subtitle}</Badge>
                <motion.h1
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 max-w-4xl text-5xl font-black tracking-[-0.075em] text-slate-950 dark:text-white sm:text-7xl lg:text-8xl"
                >
                  ENXX
                  <span className="block bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">{heroCnName}</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.6 }}
                  className="mt-6 max-w-2xl text-xl font-black leading-8 text-slate-800 dark:text-slate-100"
                >
                  {siteConfig.slogan}
                </motion.p>
                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">{siteConfig.description} 每天跟着计划学，不用自己找内容。查词、听发音、造句、复习，形成完整闭环。</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/daily-plan"><Button>开始今日计划</Button></Link>
                  <Link href="/dictionary"><Button variant="secondary">打开英语字典</Button></Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {pathSteps.map((step, index) => (
                    <motion.span
                      key={step}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + index * 0.05 }}
                      className="liquid-chip rounded-full px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-200"
                    >
                      {step}
                    </motion.span>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto flex h-[360px] w-full max-w-[360px] items-center justify-center"
              >
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-sky-300/35 via-blue-400/20 to-violet-400/35 blur-2xl" />
                <div className="liquid-panel relative flex h-full w-full flex-col items-center justify-center rounded-[3rem] p-8 text-center">
                  <div className="relative h-32 w-32 overflow-hidden rounded-[2.2rem] brand-glow-ring">
                    <Image src="/logo.png" alt={`${siteConfig.cnName} 徽标`} fill priority sizes="128px" className="object-cover" />
                  </div>
                  <p className="mt-7 text-xs font-black uppercase tracking-[0.34em] text-sky-600 dark:text-sky-200">{siteConfig.subtitle}</p>
                  <p className="mt-3 text-2xl font-black tracking-[-0.05em]">Word → Sentence</p>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">把每个单词装进真实场景，让 AI 老师帮你检查。</p>
                </div>
              </motion.div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <Badge>今日学习任务</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">今天只做三件事</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li className="liquid-chip rounded-2xl px-4 py-3">1. 学 8 个高频基础词，并写 2 个句子。</li>
              <li className="liquid-chip rounded-2xl px-4 py-3">2. 练 1 个句子结构，看清主语和谓语。</li>
              <li className="liquid-chip rounded-2xl px-4 py-3">3. 完成 {dueCount || 3} 个复习卡片。</li>
            </ul>
          </div>
          <div className="liquid-panel mt-6 rounded-[2rem] p-5 text-slate-950 dark:text-white">
            <p className="text-sm font-black text-slate-500 dark:text-slate-400">学习进度</p>
            <p className="mt-2 bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 bg-clip-text text-6xl font-black text-transparent">{progress}%</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
              <div className="h-3 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="今日单词数量" value={studiedWordIds.length || 8} hint="建议每天先学少量高频词" />
        <StatCard label="今日句型" value={masteredPatternIds.length || 1} hint="先理解句子骨架" />
        <StatCard label="今日复习数量" value={dueCount} hint="来自 1-3-7-15 复习法" />
        <StatCard label="连续学习天数" value={streakDays} hint="每天 10 分钟也有效" />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <Badge>快速入口</Badge>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em]">按路径学习，不靠死背</h2>
          </div>
          <p className="hidden text-sm font-bold text-slate-500 dark:text-slate-400 sm:block">固定顶部品牌栏 + 手机底部主导航</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item, index) => (
            <motion.div key={item.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Link href={item.href}>
                <Card className="group h-full transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(37,99,235,0.22)]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="liquid-chip rounded-2xl px-3 py-2 text-xs font-black text-sky-700 dark:text-sky-100">{item.icon}</span>
                    <span className="text-xl text-slate-300 transition group-hover:translate-x-1 dark:text-slate-600">→</span>
                  </div>
                  <p className="mt-5 text-xl font-black text-slate-950 dark:text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
