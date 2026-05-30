import { query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireCurrentUser } from "../lib/auth";

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const participations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const conversations = await Promise.all(
      participations.map(async (p) => {
        const conversation = await ctx.db.get(p.conversationId);
        if (!conversation) return null;

        const otherUserId = conversation.participantIds.find(
          (id) => id !== user._id,
        );
        const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;
        const unread = conversation.lastMessageAt > p.lastReadAt ? 1 : 0;

        return { conversation, otherUser, unread, lastReadAt: p.lastReadAt };
      }),
    );

    return conversations
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b?.conversation.lastMessageAt ?? 0) -
          (a?.conversation.lastMessageAt ?? 0),
      );
  },
});

export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id),
      )
      .unique();

    if (!participation) throw new Error("Not a participant");

    const result = await ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (m) => {
        const sender = await ctx.db.get(m.senderId);
        return { message: m, sender };
      }),
    );

    return { ...result, page };
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const otherUserId = conversation.participantIds.find(
      (id) => id !== user._id,
    );
    const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;
    return { conversation, otherUser, currentUser: user };
  },
});
