import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireCurrentUser } from "../lib/auth";
import { paginationOptsValidator } from "convex/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

export const searchUsers = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];
    return await ctx.db
      .query("users")
      .withSearchIndex("search_username", (q) =>
        q.search("username", args.query),
      )
      .take(args.limit ?? 10);
  },
});

export const getSuggestedUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    const users = await ctx.db.query("users").order("desc").take(20);

    if (!current) return users.slice(0, args.limit ?? 3);

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", current._id))
      .collect();
    const followingIds = new Set(following.map((f) => f.followingId));

    return users
      .filter((u) => u._id !== current._id && !followingIds.has(u._id))
      .slice(0, args.limit ?? 3);
  },
});

export const getProfileStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    const current = await getCurrentUser(ctx);
    let isFollowing = false;
    if (current) {
      const follow = await ctx.db
        .query("follows")
        .withIndex("by_follower_following", (q) =>
          q.eq("followerId", current._id).eq("followingId", args.userId),
        )
        .unique();
      isFollowing = !!follow;
    }
    return {
      user,
      isFollowing,
      isOwnProfile: current?._id === args.userId,
    };
  },
});

export const listBookmarks = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const posts = await Promise.all(
      bookmarks.page.map(async (b) => {
        const post = await ctx.db.get(b.postId);
        if (!post) return null;
        const author = await ctx.db.get(post.authorId);
        return { post, author, bookmarkedAt: b.createdAt };
      }),
    );

    return {
      ...bookmarks,
      page: posts.filter(Boolean),
    };
  },
});
