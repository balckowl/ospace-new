import type { Metadata, Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import WelcomeWrapper from "@/components/onboarding/WelcomeWrapper";
import { auth } from "@/lib/auth";

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

  if (!session?.user?.id) return redirect("/login");
  if (session.user.osName) redirect(`/os/${session.user?.osName}` as Route);

  return <WelcomeWrapper lang={lang} />;
}
