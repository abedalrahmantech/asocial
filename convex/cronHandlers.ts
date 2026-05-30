import { internalMutation } from "./_generated/server";

export const refreshTrending = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    const hashtags = await ctx.db.query("hashtags").collect();

    for (const tag of hashtags) {
      if (now - tag.windowStart > windowMs) {
        await ctx.db.patch(tag._id, {
          score: tag.postCount,
          windowStart: now,
        });
      }
    }
  },
});
