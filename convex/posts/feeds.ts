import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getCurrentUser } from "../lib/auth";
import { Doc } from "../_generated/dataModel";
import { enrichPost } from "../lib/enrichPost";

function scorePost(post: Doc<"posts">, authorPremium: boolean): number {
  const engagement =
    post.likeCount * 3 + post.repostCount * 5 + post.replyCount * 2;
  const recency = post.createdAt / 1_000_000;
  const premiumBoost = authorPremium ? 50 : 0;
  return engagement + recency + premiumBoost;
}

export const forYouFeed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    const result = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .paginate(args.paginationOpts);

    const topLevel = result.page.filter((p) => !p.parentPostId);

    const enriched = await Promise.all(
      topLevel.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        if (!author) return null;
        const item = await enrichPost(ctx, post, current?._id);
        if (!item) return null;
        return {
          ...item,
          score: scorePost(post, author.subscriptionTier === "premium"),
        };
      }),
    );

    enriched.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));

    return { ...result, page: enriched.filter(Boolean) };
  },
});

export const followingFeed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    if (!current) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", current._id))
      .collect();

    const followingIds = new Set(follows.map((f) => f.followingId));
    followingIds.add(current._id);

    const result = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .paginate(args.paginationOpts);

    const filtered = result.page.filter(
      (p) => !p.parentPostId && followingIds.has(p.authorId),
    );

    const page = await Promise.all(
      filtered.map((p) => enrichPost(ctx, p, current._id)),
    );

    return { ...result, page: page.filter(Boolean) };
  },
});
