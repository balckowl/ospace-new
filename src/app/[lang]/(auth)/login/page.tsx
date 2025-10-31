import type { Metadata, Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginWrapper from "@/components/onboarding/LoginWrapper";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login",
};

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <LoginWrapper lang={lang} />;
  }

  if (!session.user.osName) {
    redirect("/enter/callback/welcome" as Route);
  }

  redirect(`/os/${session.user.osName}` as Route);
}
