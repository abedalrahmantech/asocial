import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";
import { Id } from "../_generated/dataModel";

function sortParticipantIds(ids: Id<"users">[]): Id<"users">[] {
  return [...ids].sort();
}

export const startConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    if (user._id === args.otherUserId) {
      throw new Error("Cannot message yourself");
    }

    const participantIds = sortParticipantIds([user._id, args.otherUserId]);

    const existingConversations = await ctx.db.query("conversations").collect();
    const existing = existingConversations.find(
      (c) =>
        c.participantIds.length === 2 &&
        sortParticipantIds(c.participantIds).every(
          (id, i) => id === participantIds[i],
        ),
    );

    if (existing) return existing._id;

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      participantIds,
      lastMessageAt: now,
    });

    for (const userId of participantIds) {
      await ctx.db.insert("conversationParticipants", {
        conversationId,
        userId,
        lastReadAt: now,
      });
    }

    return conversationId;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    mediaId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const content = args.content.trim();
    if (!content && !args.mediaId) throw new Error("Message cannot be empty");

    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id),
      )
      .unique();
    if (!participation) throw new Error("Not a participant");

    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content,
      mediaId: args.mediaId,
      createdAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: content.slice(0, 100),
    });

    await ctx.db.patch(participation._id, { lastReadAt: now });
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id),
      )
      .unique();
    if (!participation) return;

    await ctx.db.patch(participation._id, { lastReadAt: Date.now() });
  },
});
