"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/use-auth";
import { AuthenticatedShell } from "@/layout/authenticated-shell";
import { RealCallProvider } from "@/layout/real-call-context";
import {
  InstagramLoadingSplash,
  FromMetaBadge,
} from "@/shared/ui/instagram-loading-splash";
import { styled } from "@/src/shared/utils/emotion";

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255);
  position: relative;
`;

const LoadingContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <LoadingScreen>
        <LoadingContent>
          <InstagramLoadingSplash logoSize={64} />
        </LoadingContent>
        <FromMetaBadge />
      </LoadingScreen>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <RealCallProvider>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </RealCallProvider>
  );
}
