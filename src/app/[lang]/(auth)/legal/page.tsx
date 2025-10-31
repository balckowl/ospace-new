import type { Metadata } from "next";
import LegalWrapper from "@/components/onboarding/LegalWrapper";

export const metadata: Metadata = {
  title: "Legal",
};

export default function Page() {
  return (
      <LegalWrapper />
  );
}
