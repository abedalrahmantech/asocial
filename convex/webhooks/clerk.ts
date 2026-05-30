import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { planSlugToTier } from "../lib/tiers";
import { MutationCtx } from "../_generated/server";

function verifyWebhookSecret(secret: string) {
  const expected = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Unauthorized webhook");
  }
}

function slugifyUsername(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
  return base || `user${Date.now().toString(36).slice(-6)}`;
}

async function upsertFromClerkHandler(
  ctx: MutationCtx,
  args: {
    clerkId: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  },
) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
    .unique();

  const displayName = args.displayName ?? "Asocial User";
  const username = slugifyUsername(
    args.username ?? displayName.replace(/\s+/g, "_"),
  );

  if (existing) {
    await ctx.db.patch(existing._id, {
      displayName,
      avatarUrl: args.avatarUrl,
      ...(args.username ? { username: slugifyUsername(args.username) } : {}),
    });
    return existing._id;
  }

  let finalUsername = username;
  let suffix = 0;
  while (
    await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", finalUsername))
      .unique()
  ) {
    suffix += 1;
    finalUsername = `${username}${suffix}`;
  }

  return await ctx.db.insert("users", {
    clerkId: args.clerkId,
    username: finalUsername,
    displayName,
    avatarUrl: args.avatarUrl,
    subscriptionTier: "free",
    planSlug: "free_user",
    subscriptionStatus: "active",
    joinedAt: Date.now(),
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
  });
}

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => upsertFromClerkHandler(ctx, args),
});

export const upsertFromClerkPublic = mutation({
  args: {
    webhookSecret: v.string(),
    clerkId: v.string(),
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    verifyWebhookSecret(args.webhookSecret);
    return await upsertFromClerkHandler(ctx, args);
  },
});

export const syncBillingFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    planSlug: v.string(),
    status: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => syncBillingHandler(ctx, args),
});

async function syncBillingHandler(
  ctx: MutationCtx,
  args: {
    clerkId: string;
    planSlug: string;
    status: string;
    subscriptionId?: string;
  },
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
    .unique();

  if (!user) return;

  const tier = planSlugToTier(args.planSlug);
  await ctx.db.patch(user._id, {
    subscriptionTier: tier,
    planSlug: args.planSlug,
    subscriptionStatus: args.status,
    clerkSubscriptionId: args.subscriptionId,
    subscriptionUpdatedAt: Date.now(),
  });
}

export const syncBillingFromClerkPublic = mutation({
  args: {
    webhookSecret: v.string(),
    clerkId: v.string(),
    planSlug: v.string(),
    status: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    verifyWebhookSecret(args.webhookSecret);
    await syncBillingHandler(ctx, args);
  },
});

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) return existing._id;

    const name =
      identity.name ??
      identity.nickname ??
      identity.email?.split("@")[0] ??
      "user";
    const username = slugifyUsername(name);

    let finalUsername = username;
    let suffix = 0;
    while (
      await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", finalUsername))
        .unique()
    ) {
      suffix += 1;
      finalUsername = `${username}${suffix}`;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      username: finalUsername,
      displayName: name,
      avatarUrl: identity.pictureUrl,
      subscriptionTier: "free",
      planSlug: "free_user",
      subscriptionStatus: "active",
      joinedAt: Date.now(),
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
    });
  },
});
