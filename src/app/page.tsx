import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div>
      <h1>LP</h1>
      <Button asChild>
        <Link href="/login">ログインへ</Link>
      </Button>
    </div>
  );
}
