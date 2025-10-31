import { headers } from "next/headers";
import VirtualDesktopTab from "@/components/os/VirtualDesktopTab";
import { pubHono } from "@/lib/hono-client";

interface Props {
  params: Promise<{ osName: string }>;
}

export default async function Page({ params }: Props) {
  const { osName } = await params;
  const res = await pubHono.api.desktop[":osName"].state.$get(
    {
      param: {
        osName,
      },
    },
    {
      init: {
        cache: "force-cache",
        next: { tags: ["desktop"] },
        headers: await headers(),
      },
    },
  );

  if (res.status === 404) {
    return <div>ありません。</div>;
  }

  if (res.status === 500) {
    return <div>バリデーショエラー</div>;
  }

  const data = await res.json();

  const { desktopList, isEdit, currentUser } = data;

  return (
    <VirtualDesktopTab
      desktopList={desktopList}
      osName={osName}
      isEdit={isEdit}
      currentUser={currentUser}
    />
  );
}
