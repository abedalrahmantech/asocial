import { CLERK_BILLING, isPremiumPlanSlug } from "@/lib/clerk/billing";

type BillingPayer = {
  user_id?: string;
  organization_id?: string;
};

type SubscriptionPayload = {
  id: string;
  status: string;
  payer?: BillingPayer;
  items?: Array<{ plan?: { slug?: string } }>;
};

type SubscriptionItemPayload = {
  id?: string;
  status?: string;
  payer?: BillingPayer;
  plan?: { slug?: string };
};

export function getB2cClerkUserId(payer?: BillingPayer): string | undefined {
  if (!payer) return undefined;
  return payer.user_id;
}

export function getPlanSlugFromSubscription(
  data: SubscriptionPayload,
): string {
  return data.items?.[0]?.plan?.slug ?? CLERK_BILLING.plans.free;
}

export function getPlanSlugFromSubscriptionItem(
  data: SubscriptionItemPayload,
): string {
  return data.plan?.slug ?? CLERK_BILLING.plans.free;
}

export function tierFromPlanSlug(slug: string): "free" | "premium" {
  return isPremiumPlanSlug(slug) ? "premium" : "free";
}

export const BILLING_WEBHOOK_EVENTS = [
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.pastDue",
  "subscriptionItem.updated",
  "subscriptionItem.active",
  "subscriptionItem.canceled",
  "subscriptionItem.ended",
  "subscriptionItem.pastDue",
  "subscriptionItem.expired",
] as const;
