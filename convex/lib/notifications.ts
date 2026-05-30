import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

type NotificationType =
  | "mention"
  | "reply"
  | "like"
  | "repost"
  | "follow";

export async function createNotification(
  ctx: MutationCtx,
  args: {
    recipientId: Id<"users">;
    actorId: Id<"users">;
    type: NotificationType;
    postId?: Id<"posts">;
  },
) {
  if (args.recipientId === args.actorId) return;

  await ctx.db.insert("notifications", {
    recipientId: args.recipientId,
    actorId: args.actorId,
    type: args.type,
    postId: args.postId,
    read: false,
    createdAt: Date.now(),
  });
}

export async function upsertHashtags(
  ctx: MutationCtx,
  tags: string[],
) {
  const now = Date.now();
  for (const tag of tags) {
    const existing = await ctx.db
      .query("hashtags")
      .withIndex("by_tag", (q) => q.eq("tag", tag))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        postCount: existing.postCount + 1,
        score: existing.score + 1,
      });
    } else {
      await ctx.db.insert("hashtags", {
        tag,
        postCount: 1,
        score: 1,
        windowStart: now,
      });
    }
  }
}
