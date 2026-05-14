import { LoginForm } from "@/components/auth/login-form";

type LoginSearchParams = Record<string, string | string[] | undefined>;

type LoginPageProps = {
  searchParams?: LoginSearchParams | Promise<LoginSearchParams>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirect = firstParam(params.redirect) || firstParam(params.next) || "/";
  const registered = firstParam(params.registered) === "1";
  const reset = firstParam(params.reset) === "1";
  const initialSuccess = registered ? "注册成功，请登录。" : reset ? "密码已重置，请登录。" : "";

  return <LoginForm redirect={redirect} initialSuccess={initialSuccess} />;
}
