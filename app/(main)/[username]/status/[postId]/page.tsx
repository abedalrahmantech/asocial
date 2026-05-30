"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PostCard } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function ThreadPage() {
  const params = useParams();
  const postId = params.postId as Id<"posts">;
  const thread = useQuery(api.posts.queries.getThread, {
    postId,
    repliesPaginationOpts: { numItems: 50, cursor: null },
  });

  if (thread === undefined) {
    return (
      <div className="p-4">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!thread?.mainPost) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">Post not found</h1>
        <Link href="/" className="text-primary underline">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur">
        <Link href="/" className="text-sm">
          ← Post
        </Link>
      </div>
      {thread.ancestors.map((item) =>
        item ? <PostCard key={item.post._id} item={item} /> : null,
      )}
      {thread.mainPost && <PostCard item={thread.mainPost} />}
      <PostComposer parentPostId={postId} placeholder="Post your reply" />
      {thread.replies.page.map((item) =>
        item ? <PostCard key={item.post._id} item={item} /> : null,
      )}
    </div>
  );
}
