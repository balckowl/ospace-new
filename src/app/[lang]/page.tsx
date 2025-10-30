import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LpWrapper from "../../components/lp/layout/LpWrapper";
import { auth } from "../../lib/auth";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function Page({ params }: Props) {
  const { lang } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <LpWrapper lang={lang} />;
  }

  if (!session.user.osName) {
    redirect("/enter/callback/welcome" as any);
  }
  redirect(`/os/${session.user.osName}` as any);
}
