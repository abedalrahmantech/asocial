import { query } from "../_generated/server";
import { v } from "convex/values";

export const trendingTopics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query("hashtags")
      .withIndex("by_score")
      .order("desc")
      .take(args.limit ?? 10);
    return tags;
  },
});

export const searchPosts = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];
    const posts = await ctx.db
      .query("posts")
      .withSearchIndex("search_content", (q) => q.search("content", args.query))
      .take(args.limit ?? 20);

    return await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { post, author };
      }),
    );
  },
});

export const searchHashtags = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.tag.replace(/^#/, "").toLowerCase();
    const hashtag = await ctx.db
      .query("hashtags")
      .withIndex("by_tag", (q) => q.eq("tag", normalized))
      .unique();

    if (!hashtag) return { hashtag: null, posts: [] };

    const allPosts = await ctx.db.query("posts").order("desc").take(100);
    const posts = allPosts.filter((p) => p.hashtags.includes(normalized));

    const enriched = await Promise.all(
      posts.slice(0, 30).map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { post, author };
      }),
    );

    return { hashtag, posts: enriched };
  },
});
