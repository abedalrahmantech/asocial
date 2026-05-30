import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";
import { createNotification } from "../lib/notifications";

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        likeCount: Math.max(0, post.likeCount - 1),
      });
      return { liked: false };
    }

    await ctx.db.insert("likes", {
      userId: user._id,
      postId: args.postId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.postId, { likeCount: post.likeCount + 1 });

    if (post.authorId !== user._id) {
      await createNotification(ctx, {
        recipientId: post.authorId,
        actorId: user._id,
        type: "like",
        postId: args.postId,
      });
    }

    return { liked: true };
  },
});

export const toggleRepost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const existing = await ctx.db
      .query("reposts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        repostCount: Math.max(0, post.repostCount - 1),
      });
      return { reposted: false };
    }

    await ctx.db.insert("reposts", {
      userId: user._id,
      postId: args.postId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.postId, { repostCount: post.repostCount + 1 });

    if (post.authorId !== user._id) {
      await createNotification(ctx, {
        recipientId: post.authorId,
        actorId: user._id,
        type: "repost",
        postId: args.postId,
      });
    }

    return { reposted: true };
  },
});

export const toggleBookmark = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        bookmarkCount: Math.max(0, post.bookmarkCount - 1),
      });
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: user._id,
      postId: args.postId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.postId, {
      bookmarkCount: post.bookmarkCount + 1,
    });
    return { bookmarked: true };
  },
});

export const toggleFollow = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    if (user._id === args.userId) throw new Error("Cannot follow yourself");

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", user._id).eq("followingId", args.userId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(user._id, {
        followingCount: Math.max(0, user.followingCount - 1),
      });
      await ctx.db.patch(args.userId, {
        followerCount: Math.max(0, target.followerCount - 1),
      });
      return { following: false };
    }

    await ctx.db.insert("follows", {
      followerId: user._id,
      followingId: args.userId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(user._id, { followingCount: user.followingCount + 1 });
    await ctx.db.patch(args.userId, {
      followerCount: target.followerCount + 1,
    });

    await createNotification(ctx, {
      recipientId: args.userId,
      actorId: user._id,
      type: "follow",
    });

    return { following: true };
  },
});
