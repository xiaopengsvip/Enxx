import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetSearchParams = Record<string, string | string[] | undefined>;

type ResetPasswordPageProps = {
  searchParams?: ResetSearchParams | Promise<ResetSearchParams>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = (await searchParams) ?? {};
  const token = firstParam(params.token) ?? "";

  return (
    <AuthShell
      badge="Reset Password"
      title="设置新的账号密码"
      subtitle="请输入新密码，完成后重新登录。"
      description="新密码至少 8 位。链接过期或已使用后，需要重新申请找回密码。"
      benefits={["新密码立即生效", "重置后需要重新登录", "重置链接 30 分钟有效"]}
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
