import { SceneCard } from "@/components/learning/SceneCard";
import { Badge } from "@/components/ui/Badge";
import { scenes } from "@/data/scenes";

export default function ScenesPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <Badge>Scene Practice</Badge>
        <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">场景学习</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">用真实生活和酒店客控场景学习英语。词汇、短句、动作句型、小测试和复习计划放在一起。</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {scenes.map((scene) => <SceneCard key={scene.id} scene={scene} />)}
      </div>
    </div>
  );
}
