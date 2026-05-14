"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function EmailTemplatePreview({ html }: { html: string }) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-black">邮件预览</h3>
        <div className="flex gap-2">
          <Button variant={mode === "desktop" ? "primary" : "secondary"} onClick={() => setMode("desktop")}>桌面</Button>
          <Button variant={mode === "mobile" ? "primary" : "secondary"} onClick={() => setMode("mobile")}>移动端</Button>
        </div>
      </div>
      <div className="overflow-auto rounded-[1.5rem] bg-slate-100 p-3 dark:bg-slate-950/60">
        <iframe
          title="ENXX email template preview"
          sandbox=""
          srcDoc={html}
          className="mx-auto h-[680px] rounded-[1.25rem] border border-white/70 bg-white shadow-2xl transition-all"
          style={{ width: mode === "desktop" ? "680px" : "390px", maxWidth: "100%" }}
        />
      </div>
    </Card>
  );
}
