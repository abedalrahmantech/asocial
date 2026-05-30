import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";
import {
  containsAsocialAiMention,
  extractHashtags,
  extractMentionUsernames,
} from "../lib/hashtags";
import { createNotification, upsertHashtags } from "../lib/notifications";
import {
  canEditPost,
  getMaxChars,
  requireFeature,
} from "../lib/tiers";

export const create = mutation({
  args: {
    content: v.string(),
    parentPostId: v.optional(v.id("posts")),
    quotePostId: v.optional(v.id("posts")),
    mediaIds: v.optional(v.array(v.id("_storage"))),
    mediaLayout: v.optional(
      v.union(
        v.literal("single"),
        v.literal("grid2"),
        v.literal("grid3"),
        v.literal("grid4"),
        v.literal("video"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const content = args.content.trim();
    if (!content && !args.mediaIds?.length) {
      throw new Error("Post cannot be empty");
    }

    const maxChars = getMaxChars(user);
    if (content.length > maxChars) {
      if (user.subscriptionTier === "free") {
        requireFeature(user, "long_posts");
      } else {
        throw new Error(`Post exceeds ${maxChars} character limit`);
      }
    }

    let rootPostId = undefined;
    let parentAuthorId = undefined;

    if (args.parentPostId) {
      const parent = await ctx.db.get(args.parentPostId);
      if (!parent) throw new Error("Parent post not found");
      rootPostId = parent.rootPostId ?? parent._id;
      parentAuthorId = parent.authorId;

      await ctx.db.patch(parent._id, {
        replyCount: parent.replyCount + 1,
      });
    }

    const hashtags = extractHashtags(content);
    const mentionNames = extractMentionUsernames(content);
    const mentionUserIds = [];

    for (const name of mentionNames) {
      const mentioned = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", name))
        .unique();
      if (mentioned) mentionUserIds.push(mentioned._id);
    }

    const now = Date.now();
    const postId = await ctx.db.insert("posts", {
      authorId: user._id,
      content,
      mediaIds: args.mediaIds,
      mediaLayout: args.mediaLayout,
      parentPostId: args.parentPostId,
      rootPostId,
      quotePostId: args.quotePostId,
      viewCount: 0,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      bookmarkCount: 0,
      hashtags,
      mentionUserIds,
      createdAt: now,
    });

    await ctx.db.patch(user._id, { postCount: user.postCount + 1 });
    await upsertHashtags(ctx, hashtags);

    if (parentAuthorId) {
      await createNotification(ctx, {
        recipientId: parentAuthorId,
        actorId: user._id,
        type: "reply",
        postId,
      });
    }

    for (const mentionedId of mentionUserIds) {
      await createNotification(ctx, {
        recipientId: mentionedId,
        actorId: user._id,
        type: "mention",
        postId,
      });
    }

    if (containsAsocialAiMention(content)) {
      if (user.subscriptionTier === "premium") {
        await ctx.scheduler.runAfter(0, internal.ai.actions.generateMentionReply, {
          postId,
        });
      }
    }

    return postId;
  },
});

export const edit = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireFeature(user, "edit_posts");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== user._id) throw new Error("Not authorized");

    if (!canEditPost(user, post.createdAt)) {
      throw new Error("Edit window has expired");
    }

    const content = args.content.trim();
    const maxChars = getMaxChars(user);
    if (content.length > maxChars) {
      throw new Error(`Post exceeds ${maxChars} character limit`);
    }

    await ctx.db.patch(args.postId, {
      content,
      editedAt: Date.now(),
      hashtags: extractHashtags(content),
    });
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== user._id) throw new Error("Not authorized");
    await ctx.db.delete(args.postId);
    await ctx.db.patch(user._id, {
      postCount: Math.max(0, user.postCount - 1),
    });
  },
});
