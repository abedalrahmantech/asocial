import {
  internalQuery,
  query,
} from "../_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";

export const getPostContext = internalQuery({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    let context = "";
    if (post.parentPostId) {
      const parent = await ctx.db.get(post.parentPostId);
      if (parent) context += `Parent: ${parent.content}\n`;
    }

    return { content: post.content, context, authorId: post.authorId };
  },
});

export const getSessionMessages = internalQuery({
  args: { sessionId: v.id("aiSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiMessages")
      .withIndex("by_session_created", (q) =>
        q.eq("sessionId", args.sessionId),
      )
      .order("asc")
      .take(20);
  },
});

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("aiSessions")
      .withIndex("by_user_updated", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const getSessionMessagesPublic = query({
  args: { sessionId: v.id("aiSessions") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) return [];

    return await ctx.db
      .query("aiMessages")
      .withIndex("by_session_created", (q) =>
        q.eq("sessionId", args.sessionId),
      )
      .order("asc")
      .collect();
  },
});
