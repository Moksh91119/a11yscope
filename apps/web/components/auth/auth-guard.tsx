"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { getToken } from "@/lib/auth/storage";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        await getMe(token);
        setChecking(false);
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">Loading workspace...</div>
      </div>
    );
  }

  return <>{children}</>;
}
