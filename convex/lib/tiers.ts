import { Doc } from "../_generated/dataModel";

export const TIER_LIMITS = {
  free: { maxChars: 280, canEdit: false, editWindowMs: 0 },
  premium: {
    maxChars: 4000,
    canEdit: true,
    editWindowMs: 30 * 60 * 1000,
  },
} as const;

export type TierFeature = "long_posts" | "edit_posts" | "ai_chat" | "ai_mentions";

export function planSlugToTier(slug: string): "free" | "premium" {
  // Clerk User Plan slugs: free_user (default), premium
  return slug === "premium" ? "premium" : "free";
}

export function getTierLimits(tier: "free" | "premium") {
  return TIER_LIMITS[tier];
}

export function requireFeature(
  user: Doc<"users">,
  feature: TierFeature,
): void {
  const tier = user.subscriptionTier;
  if (tier === "premium") return;

  const premiumFeatures: TierFeature[] = [
    "long_posts",
    "edit_posts",
    "ai_chat",
    "ai_mentions",
  ];
  if (premiumFeatures.includes(feature)) {
    throw new Error("Premium subscription required");
  }
}

export function getMaxChars(user: Doc<"users">): number {
  return getTierLimits(user.subscriptionTier).maxChars;
}

export function canEditPost(user: Doc<"users">, createdAt: number): boolean {
  const limits = getTierLimits(user.subscriptionTier);
  if (!limits.canEdit) return false;
  return Date.now() - createdAt <= limits.editWindowMs;
}
