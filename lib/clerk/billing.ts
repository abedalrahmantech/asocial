/**
 * Clerk Billing slugs — must match Dashboard → Billing → Plans (User Plans tab)
 * and Features attached per plan.
 *
 * @see https://clerk.com/docs/guides/billing/for-b2c
 */
export const CLERK_BILLING = {
  /** B2C user plans */
  plans: {
    free: "free_user",
    premium: "premium",
  },
  /** Feature slugs attached to the premium plan in Clerk Dashboard */
  features: {
    longPosts: "long_posts",
    verifiedBadge: "verified_badge",
    editPosts: "edit_posts",
    replyPriority: "reply_priority",
    aiChat: "ai_chat",
    aiMentions: "ai_mentions",
    forYouBoost: "for_you_boost",
  },
} as const;

export type ClerkPremiumFeature =
  (typeof CLERK_BILLING.features)[keyof typeof CLERK_BILLING.features];

export function isPremiumPlanSlug(slug: string): boolean {
  return slug === CLERK_BILLING.plans.premium;
}
