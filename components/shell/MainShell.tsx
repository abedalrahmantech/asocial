"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppSidebar, MobileNav } from "@/components/shell/AppSidebar";
import { RightRail } from "@/components/shell/RightRail";
import { Separator } from "@/components/ui/separator";

export function MainShell({ children }: { children: React.ReactNode }) {
  const ensureUser = useMutation(api.webhooks.clerk.ensureCurrentUser);

  useEffect(() => {
    void ensureUser().catch(() => undefined);
  }, [ensureUser]);

  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      <div className="mx-auto flex max-w-7xl">
        <AppSidebar />
        <main className="min-h-screen flex-1 border-x max-w-[600px]">
          {children}
        </main>
        <RightRail />
      </div>
      <Separator className="lg:hidden" />
    </div>
  );
}
