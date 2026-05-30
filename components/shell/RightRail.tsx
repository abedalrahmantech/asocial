"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export function RightRail() {
  const trends = useQuery(api.explore.queries.trendingTopics, { limit: 5 });
  const suggested = useQuery(api.users.queries.getSuggestedUsers, { limit: 3 });

  return (
    <aside className="hidden lg:block lg:w-80 lg:px-4 lg:py-2">
      <div className="sticky top-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search Asocial" className="pl-10" />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-xl font-bold">Trends for you</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {trends === undefined ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : trends.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trends yet</p>
            ) : (
              trends.map((tag) => (
                <Link
                  key={tag._id}
                  href={`/explore?q=${encodeURIComponent(tag.tag)}`}
                  className="block hover:bg-muted/50 rounded-lg p-2 -mx-2"
                >
                  <p className="text-sm text-muted-foreground">Trending</p>
                  <p className="font-bold">#{tag.tag}</p>
                  <p className="text-sm text-muted-foreground">
                    {tag.postCount} posts
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-xl font-bold">Who to follow</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggested?.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between gap-2"
              >
                <Link href={`/${user.username}`} className="min-w-0">
                  <p className="truncate font-bold">{user.displayName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                </Link>
                <Link href={`/${user.username}`}>
                  <Button size="sm">Follow</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 px-2 text-xs text-muted-foreground">
          <Link href="/pricing">Premium</Link>
          <span>·</span>
          <Badge variant="outline">Asocial v1</Badge>
        </div>
      </div>
    </aside>
  );
}
