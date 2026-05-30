"use client";

import { useEffect, useRef } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

type FeedType = "forYou" | "following";

export function InfiniteFeed({ feedType }: { feedType: FeedType }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const query =
    feedType === "forYou"
      ? api.posts.feeds.forYouFeed
      : api.posts.feeds.followingFeed;

  const { results, status, loadMore } = usePaginatedQuery(
    query,
    {},
    { initialNumItems: 20 },
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && status === "CanLoadMore") {
          loadMore(20);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {feedType === "following"
          ? "Follow people to see their posts here."
          : "No posts yet. Be the first to post!"}
      </div>
    );
  }

  return (
    <div>
      {results.map((item) =>
        item ? <PostCard key={item.post._id} item={item} /> : null,
      )}
      <div ref={sentinelRef} className="h-8" />
      {status === "LoadingMore" && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading more...
        </p>
      )}
    </div>
  );
}
