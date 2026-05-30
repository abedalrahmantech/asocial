import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "../lib/auth";
import { paginationOptsValidator } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { enrichPost } from "../lib/enrichPost";

export const getById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    const current = await getCurrentUser(ctx);
    return await enrichPost(ctx, post, current?._id);
  },
});

export const getThread = query({
  args: {
    postId: v.id("posts"),
    repliesPaginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const current = await getCurrentUser(ctx);
    const rootId = post.rootPostId ?? post._id;

    const ancestors: Doc<"posts">[] = [];
    let currentPost: Doc<"posts"> | null = post;
    let depth = 0;
    while (currentPost?.parentPostId && depth < 50) {
      const parent: Doc<"posts"> | null = await ctx.db.get(
        currentPost.parentPostId,
      );
      if (!parent) break;
      ancestors.unshift(parent);
      currentPost = parent;
      depth += 1;
    }

    const repliesResult = await ctx.db
      .query("posts")
      .withIndex("by_root_created", (q) => q.eq("rootPostId", rootId))
      .order("desc")
      .paginate(args.repliesPaginationOpts);

    const enrichedAncestors = await Promise.all(
      ancestors.map((p) => enrichPost(ctx, p, current?._id)),
    );
    const mainPost = await enrichPost(ctx, post, current?._id);
    const enrichedReplies = await Promise.all(
      repliesResult.page
        .filter((p) => p._id !== post._id)
        .map((p) => enrichPost(ctx, p, current?._id)),
    );

    enrichedReplies.sort((a, b) => {
      if (!a || !b) return 0;
      const aBoost = a.author.subscriptionTier === "premium" ? 1000 : 0;
      const bBoost = b.author.subscriptionTier === "premium" ? 1000 : 0;
      return b.post.createdAt + bBoost - (a.post.createdAt + aBoost);
    });

    return {
      ancestors: enrichedAncestors.filter(Boolean),
      mainPost,
      replies: { ...repliesResult, page: enrichedReplies.filter(Boolean) },
    };
  },
});

export const getByUsername = query({
  args: {
    username: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return null;

    const current = await getCurrentUser(ctx);
    const result = await ctx.db
      .query("posts")
      .withIndex("by_author_created", (q) => q.eq("authorId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page
        .filter((p) => !p.parentPostId)
        .map((p) => enrichPost(ctx, p, current?._id)),
    );

    return { user, posts: { ...result, page: page.filter(Boolean) } };
  },
});

export const getInteractionState = query({
  args: { postIds: v.array(v.id("posts")) },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    if (!current) return {};

    const state: Record<
      string,
      { isLiked: boolean; isReposted: boolean; isBookmarked: boolean }
    > = {};

    for (const postId of args.postIds) {
      const [like, repost, bookmark] = await Promise.all([
        ctx.db
          .query("likes")
          .withIndex("by_user_post", (q) =>
            q.eq("userId", current._id).eq("postId", postId),
          )
          .unique(),
        ctx.db
          .query("reposts")
          .withIndex("by_user_post", (q) =>
            q.eq("userId", current._id).eq("postId", postId),
          )
          .unique(),
        ctx.db
          .query("bookmarks")
          .withIndex("by_user_post", (q) =>
            q.eq("userId", current._id).eq("postId", postId),
          )
          .unique(),
      ]);
      state[postId] = {
        isLiked: !!like,
        isReposted: !!repost,
        isBookmarked: !!bookmark,
      };
    }
    return state;
  },
});
