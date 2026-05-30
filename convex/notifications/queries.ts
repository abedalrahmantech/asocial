import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireCurrentUser } from "../lib/auth";

export const listNotifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const result = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_created", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (n) => {
        const actor = await ctx.db.get(n.actorId);
        const post = n.postId ? await ctx.db.get(n.postId) : null;
        return { notification: n, actor, post };
      }),
    );

    return { ...result, page };
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", user._id).eq("read", false),
      )
      .collect();
    return unread.length;
  },
});
