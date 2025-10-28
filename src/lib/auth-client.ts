import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/enter/callback/welcome",
  });
};

export const signOut = async (isPublic: boolean) => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.reload();
        if (!isPublic) {
          window.location.href = "/";
        }
      },
    },
  });
};
