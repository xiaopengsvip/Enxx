import { UserDetailClient } from "@/components/admin/user-detail-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <UserDetailClient id={id} />;
}
