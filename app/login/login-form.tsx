"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";
import { signInWithGoogle } from "./actions";

export function LoginForm() {
  return (
    <form action={signInWithGoogle} className="mt-8">
      <Button
        type="submit"
        className="relative w-full h-14 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 rounded-none"
      >
        <HugeiconsIcon icon={GoogleIcon} className="size-7" />
        Continue with Google
      </Button>
    </form>
  );
}
