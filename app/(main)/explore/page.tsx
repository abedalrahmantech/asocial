"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/feed/PostCard";
import Link from "next/link";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const trends = useQuery(api.explore.queries.trendingTopics, { limit: 10 });
  const searchResults = useQuery(
    api.explore.queries.searchPosts,
    query.trim() ? { query, limit: 20 } : "skip",
  );
  const hashtagResults = useQuery(
    api.explore.queries.searchHashtags,
    query.trim().startsWith("#") || !query.includes(" ")
      ? { tag: query.replace(/^#/, "") }
      : "skip",
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold px-2">Explore</h1>
      <Input
        placeholder="Search posts or #hashtags"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!query.trim() && (
        <Card>
          <CardHeader>
            <h2 className="font-bold">Trending</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {trends?.map((t) => (
              <Link
                key={t._id}
                href={`/explore?q=${t.tag}`}
                className="flex items-center justify-between rounded-lg p-2 hover:bg-muted"
              >
                <span className="font-bold">#{t.tag}</span>
                <Badge variant="secondary">{t.postCount} posts</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {query.trim() && searchResults?.map((item) =>
        item.author ? (
          <PostCard
            key={item.post._id}
            item={{
              post: item.post,
              author: item.author,
              isLiked: false,
              isReposted: false,
              isBookmarked: false,
            }}
          />
        ) : null,
      )}

      {hashtagResults?.posts?.map((item) =>
        item.author ? (
          <PostCard
            key={item.post._id}
            item={{
              post: item.post,
              author: item.author,
              isLiked: false,
              isReposted: false,
              isBookmarked: false,
            }}
          />
        ) : null,
      )}
    </div>
  );
}
