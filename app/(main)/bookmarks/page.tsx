"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookmarksPage() {
  const { results, status } = usePaginatedQuery(
    api.users.queries.listBookmarks,
    {},
    { initialNumItems: 20 },
  );

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">Bookmarks</h1>
      </div>
      {status === "LoadingFirstPage" ? (
        <div className="p-4">
          <Skeleton className="h-32 w-full" />
        </div>
      ) : results.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          Save posts to read them later
        </p>
      ) : (
        results.map((item) =>
          item?.author ? (
            <PostCard
              key={item.post._id}
              item={{
                post: item.post,
                author: item.author,
                isLiked: false,
                isReposted: false,
                isBookmarked: true,
              }}
            />
          ) : null,
        )
      )}
    </div>
  );
}
