import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="场景管理" status="beta" description="管理生活场景英语内容，例如酒店、机场、餐厅、购物、问路、电话等。" plans={['场景词汇', '常用表达', '场景对话', '按 Level 管理']} />;
}
