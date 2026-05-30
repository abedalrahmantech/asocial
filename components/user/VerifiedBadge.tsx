"use client";

import { Show, useAuth } from "@clerk/nextjs";
import { BadgeCheck } from "lucide-react";
import { CLERK_BILLING } from "@/lib/clerk/billing";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Show when={{ feature: CLERK_BILLING.features.verifiedBadge }}>
      <BadgeCheck
        className={cn("h-4 w-4 text-primary shrink-0", className)}
        aria-label="Verified"
      />
    </Show>
  );
}

export function useCharLimit() {
  const { has, isLoaded } = useAuth();
  if (!isLoaded) return 280;
  return has?.({ feature: CLERK_BILLING.features.longPosts }) ? 4000 : 280;
}
