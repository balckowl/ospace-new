import { NuqsAdapter } from "nuqs/adapters/next/app";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "OSPACE",
    template: `%s | OSPACE`,
  },
  description: "Create your very own OS on the web.",
  openGraph: {
    title: {
      default: "OSPACE",
      template: `%s | OSPACE`,
    },
    description: "Create your very own OS on the web.",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body className={cn(inter.className, "bg-black")}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
