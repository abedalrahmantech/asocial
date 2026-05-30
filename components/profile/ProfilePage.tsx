"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/user/VerifiedBadge";
import { FollowButton } from "@/components/profile/FollowButton";
import { PostCard } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function ProfileHeader({ username }: { username: string }) {
  const profile = useQuery(api.users.queries.getByUsername, { username });

  if (profile === undefined) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">User not found</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="h-32 bg-muted" />
      <div className="relative px-4 pb-4">
        <Avatar className="-mt-12 h-24 w-24 border-4 border-background">
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback className="text-2xl">
            {profile.displayName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold">{profile.displayName}</h1>
              {profile.subscriptionTier === "premium" && <VerifiedBadge />}
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          <FollowButton userId={profile._id} />
        </div>
        {profile.bio && <p className="mt-3">{profile.bio}</p>}
        <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{profile.followingCount}</strong>{" "}
            Following
          </span>
          <span>
            <strong className="text-foreground">{profile.followerCount}</strong>{" "}
            Followers
          </span>
          <span>
            Joined {format(profile.joinedAt, "MMM yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProfilePosts({ username }: { username: string }) {
  const { results, status } = usePaginatedQuery(
    api.posts.profileFeed.getProfilePosts,
    { username },
    { initialNumItems: 20 },
  );

  if (status === "LoadingFirstPage") {
    return <Skeleton className="m-4 h-32 w-full" />;
  }

  if (results.length === 0) {
    return (
      <p className="p-8 text-center text-muted-foreground">No posts yet</p>
    );
  }

  return results.map((item) =>
    item ? <PostCard key={item.post._id} item={item} /> : null,
  );
}

export function ProfilePage({ username }: { username: string }) {
  return (
    <Tabs defaultValue="posts">
      <ProfileHeader username={username} />
      <TabsList className="w-full rounded-none border-b bg-transparent">
        <TabsTrigger value="posts" className="flex-1 rounded-none">
          Posts
        </TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-0">
        <ProfilePosts username={username} />
      </TabsContent>
    </Tabs>
  );
}
