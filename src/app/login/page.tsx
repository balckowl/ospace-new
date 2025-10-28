"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const signInToGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/enter/callback/welcome",
  });
};

export default function Page() {
  return (
    <div>
      <h1>ログインページ</h1>
      <Button onClick={signInToGoogle}>googleでログイン</Button>
    </div>
  );
}
