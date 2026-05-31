import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { CLERK_BILLING } from "@/lib/clerk/billing";
import {
  getB2cClerkUserId,
  getPlanSlugFromSubscription,
  getPlanSlugFromSubscriptionItem,
} from "@/lib/clerk/billingWebhook";
import { NextRequest, NextResponse } from "next/server";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  }
  return new ConvexHttpClient(url);
}

function webhookSecret(): string {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SIGNING_SECRET is not configured");
  }
  return secret;
}

async function syncBilling(
  clerkId: string,
  planSlug: string,
  status: string,
  subscriptionId?: string,
) {
  await getConvex().mutation(api.webhooks.clerk.syncBillingFromClerkPublic, {
    webhookSecret: webhookSecret(),
    clerkId,
    planSlug,
    status,
    subscriptionId,
  });
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const data = evt.data;
        const username =
          data.username ??
          data.email_addresses?.[0]?.email_address?.split("@")[0];
        await getConvex().mutation(api.webhooks.clerk.upsertFromClerkPublic, {
          webhookSecret: webhookSecret(),
          clerkId: data.id,
          username: username ?? undefined,
          displayName:
            [data.first_name, data.last_name].filter(Boolean).join(" ") ||
            undefined,
          avatarUrl: data.image_url ?? undefined,
        });
        break;
      }

      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.pastDue": {
        const data = evt.data as {
          id: string;
          status: string;
          payer?: { user_id?: string };
          items?: Array<{ plan?: { slug?: string } }>;
        };
        const clerkId = getB2cClerkUserId(data.payer);
        if (clerkId) {
          await syncBilling(
            clerkId,
            getPlanSlugFromSubscription(data),
            data.status,
            data.id,
          );
        }
        break;
      }

      case "subscriptionItem.active":
      case "subscriptionItem.updated": {
        const data = evt.data as {
          status?: string;
          payer?: { user_id?: string };
          plan?: { slug?: string };
        };
        const clerkId = getB2cClerkUserId(data.payer);
        if (clerkId) {
          await syncBilling(
            clerkId,
            getPlanSlugFromSubscriptionItem(data),
            data.status ?? "active",
          );
        }
        break;
      }

      case "subscriptionItem.canceled":
      case "subscriptionItem.ended": {
        const data = evt.data as { payer?: { user_id?: string } };
        const clerkId = getB2cClerkUserId(data.payer);
        if (clerkId) {
          await syncBilling(clerkId, CLERK_BILLING.plans.free, "canceled");
        }
        break;
      }

      case "subscriptionItem.pastDue": {
        const data = evt.data as {
          payer?: { user_id?: string };
          plan?: { slug?: string };
        };
        const clerkId = getB2cClerkUserId(data.payer);
        if (clerkId) {
          await syncBilling(
            clerkId,
            getPlanSlugFromSubscriptionItem(data),
            "past_due",
          );
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    const message =
      err instanceof Error ? err.message : "Webhook verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
