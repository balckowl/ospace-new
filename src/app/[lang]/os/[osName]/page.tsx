import { headers } from "next/headers";
import MobileLockView from "@/components/os/MobileLockView";
import VirtualDesktopTab from "@/components/os/VirtualDesktopTab";
import { LanguageProvider } from "@/i18n/client";
import { pubHono } from "@/lib/hono-client";

interface Props {
  params: Promise<{ osName: string; lang: string }>;
}

export default async function Page({ params }: Props) {
  const { osName, lang } = await params;
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
    <>
      <div className="block lg:hidden">
        <MobileLockView isEdit={isEdit} lang={lang} />
      </div>
      <div className="bg-white hidden lg:block">
        <LanguageProvider initialLanguage={lang}>
          <VirtualDesktopTab
            desktopList={desktopList}
            osName={osName}
            isEdit={isEdit}
            currentUser={currentUser}
          />
        </LanguageProvider>
      </div>
    </>
  );
}
