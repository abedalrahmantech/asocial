import { GenericQueryCtx } from "convex/server";
import { Doc, Id, DataModel } from "../_generated/dataModel";

type QueryCtx = GenericQueryCtx<DataModel>;

export async function enrichPost(
  ctx: QueryCtx,
  post: Doc<"posts">,
  currentUserId?: Id<"users">,
) {
  const author = await ctx.db.get(post.authorId);
  if (!author) return null;

  let isLiked = false;
  let isReposted = false;
  let isBookmarked = false;

  if (currentUserId) {
    const [like, repost, bookmark] = await Promise.all([
      ctx.db
        .query("likes")
        .withIndex("by_user_post", (q) =>
          q.eq("userId", currentUserId).eq("postId", post._id),
        )
        .unique(),
      ctx.db
        .query("reposts")
        .withIndex("by_user_post", (q) =>
          q.eq("userId", currentUserId).eq("postId", post._id),
        )
        .unique(),
      ctx.db
        .query("bookmarks")
        .withIndex("by_user_post", (q) =>
          q.eq("userId", currentUserId).eq("postId", post._id),
        )
        .unique(),
    ]);
    isLiked = !!like;
    isReposted = !!repost;
    isBookmarked = !!bookmark;
  }

  let quotedPost = null;
  if (post.quotePostId) {
    const quoted = await ctx.db.get(post.quotePostId);
    if (quoted) {
      const quotedAuthor = await ctx.db.get(quoted.authorId);
      quotedPost = { post: quoted, author: quotedAuthor };
    }
  }

  return {
    post,
    author,
    isLiked,
    isReposted,
    isBookmarked,
    quotedPost,
  };
}

export type EnrichedPost = NonNullable<Awaited<ReturnType<typeof enrichPost>>>;
