"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";

const loadingSteps = ["搭建单词零件", "连接句子结构", "唤醒 AI Tutor"];

export function BrandIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyPlayed = window.sessionStorage.getItem("enxx-brand-intro-played") === "yes";
    if (alreadyPlayed) {
      return undefined;
    }

    const showTimer = window.setTimeout(() => setVisible(true), 16);
    const hideTimer = window.setTimeout(() => {
      window.sessionStorage.setItem("enxx-brand-intro-played", "yes");
      setVisible(false);
    }, 3300);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="brand-intro"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050a18] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
          transition={{ duration: 0.72, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,.42),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.38),transparent_34%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,.24),transparent_40%)]" />
          <div className="absolute inset-0 bg-learning-grid bg-[size:42px_42px] opacity-20" />
          <motion.div
            className="liquid-panel mx-6 flex w-full max-w-lg flex-col items-center rounded-[2.5rem] px-8 py-9 text-center"
            initial={{ y: 26, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative h-32 w-32" style={{ animation: "introPulse 900ms ease-out both" }}>
              <span className="absolute inset-[-18px] rounded-full border border-sky-300/35" style={{ animation: "introOrbit 5s linear infinite" }} />
              <span className="absolute inset-[-34px] rounded-full border border-violet-300/25 border-dashed" style={{ animation: "introOrbit 8s linear infinite reverse" }} />
              <Image src="/logo.png" alt={siteConfig.fullName} fill priority sizes="128px" className="brand-glow-ring rounded-[2rem] object-cover" />
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.34em] text-sky-200">{siteConfig.name}</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">英语自学网站正在启动</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">{siteConfig.slogan}</p>
            <div className="mt-7 w-full space-y-3">
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-left text-sm font-bold text-slate-100"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.24 }}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,.9)]" />
                  {step}
                </motion.div>
              ))}
            </div>
            <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full origin-left rounded-full bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400" style={{ animation: "introProgress 2.55s ease-in-out forwards" }} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
