import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminListeningPage() {
  return <AdminComingSoon title="听力内容" status="developing" description="管理听力播放器内容、播放队列、场景句和连续播放材料。" plans={['听力材料库','播放队列','音频标注']} />;
}
