import { query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { getCurrentUser } from "../lib/auth";
import { enrichPost } from "../lib/enrichPost";

export const getProfilePosts = query({
  args: {
    username: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    const current = await getCurrentUser(ctx);
    const result = await ctx.db
      .query("posts")
      .withIndex("by_author_created", (q) => q.eq("authorId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page
        .filter((p) => !p.parentPostId)
        .map((p) => enrichPost(ctx, p, current?._id)),
    );

    return { ...result, page: page.filter(Boolean) };
  },
});
