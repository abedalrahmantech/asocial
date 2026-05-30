import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      ...(args.displayName !== undefined ? { displayName: args.displayName } : {}),
      ...(args.bio !== undefined ? { bio: args.bio } : {}),
      ...(args.location !== undefined ? { location: args.location } : {}),
      ...(args.website !== undefined ? { website: args.website } : {}),
    });
  },
});
