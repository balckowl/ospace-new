import WelcomeWrapper from "@/components/onboarding/WelcomeWrapper";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Welcome",
};

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  //ログインしてないのならログインページへ
  if (!session?.user?.id) return redirect("/login");
  //OSNameが設定されているのなら、それぞれのOSへ
  if (session.user.osName) redirect(`/os/${session.user.osName}` as any);

  return <WelcomeWrapper lang={lang} />;
}
