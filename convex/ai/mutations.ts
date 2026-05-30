import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { requirePremium } from "../lib/auth";
import { internal } from "../_generated/api";
import { createNotification } from "../lib/notifications";

export const insertAiReply = internalMutation({
  args: {
    parentPostId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const parent = await ctx.db.get(args.parentPostId);
    if (!parent) return;

    const aiUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "asocialai"))
      .unique();

    let authorId = aiUser?._id;
    if (!authorId) {
      authorId = await ctx.db.insert("users", {
        clerkId: "system_asocialai",
        username: "asocialai",
        displayName: "Asocial AI",
        subscriptionTier: "premium",
        planSlug: "premium",
        joinedAt: Date.now(),
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
      });
    }

    const rootPostId = parent.rootPostId ?? parent._id;
    const now = Date.now();

    const replyId = await ctx.db.insert("posts", {
      authorId,
      content: args.content,
      parentPostId: args.parentPostId,
      rootPostId,
      viewCount: 0,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      bookmarkCount: 0,
      hashtags: [],
      mentionUserIds: [],
      isAiGenerated: true,
      createdAt: now,
    });

    await ctx.db.patch(parent._id, { replyCount: parent.replyCount + 1 });

    await createNotification(ctx, {
      recipientId: parent.authorId,
      actorId: authorId,
      type: "reply",
      postId: replyId,
    });
  },
});

export const saveChatMessages = internalMutation({
  args: {
    sessionId: v.id("aiSessions"),
    userMessage: v.string(),
    assistantMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("aiMessages", {
      sessionId: args.sessionId,
      role: "user",
      content: args.userMessage,
      createdAt: now,
    });
    await ctx.db.insert("aiMessages", {
      sessionId: args.sessionId,
      role: "assistant",
      content: args.assistantMessage,
      createdAt: now + 1,
    });
    await ctx.db.patch(args.sessionId, { updatedAt: now });
  },
});

export const createSession = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requirePremium(ctx);
    const now = Date.now();
    return await ctx.db.insert("aiSessions", {
      userId: user._id,
      title: args.title ?? "New chat",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const sendChatMessage = mutation({
  args: {
    sessionId: v.id("aiSessions"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requirePremium(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    await ctx.scheduler.runAfter(0, internal.ai.actions.chat, {
      userId: user._id,
      sessionId: args.sessionId,
      message: args.message,
    });
  },
});
