"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
} from "lucide-react";
import { useMutation } from "convex/react";
import { useOptimistic, useTransition } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { VerifiedBadge } from "@/components/user/VerifiedBadge";
import { PostMediaGrid } from "@/components/feed/PostMediaGrid";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PostItem = {
  post: {
    _id: Id<"posts">;
    content: string;
    createdAt: number;
    likeCount: number;
    repostCount: number;
    replyCount: number;
    bookmarkCount: number;
    editedAt?: number;
    mediaIds?: Id<"_storage">[];
    mediaLayout?: "single" | "grid2" | "grid3" | "grid4" | "video";
    isAiGenerated?: boolean;
  };
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
    subscriptionTier: "free" | "premium";
  };
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
};

export function PostCard({ item }: { item: PostItem }) {
  const [isPending, startTransition] = useTransition();
  const toggleLike = useMutation(api.interactions.mutations.toggleLike);
  const toggleRepost = useMutation(api.interactions.mutations.toggleRepost);
  const toggleBookmark = useMutation(api.interactions.mutations.toggleBookmark);
  const deletePost = useMutation(api.posts.mutations.remove);

  const [optimisticLiked, setOptimisticLiked] = useOptimistic(item.isLiked);
  const [optimisticReposted, setOptimisticReposted] = useOptimistic(
    item.isReposted,
  );
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    item.isBookmarked,
  );
  const [likeCount, setLikeCount] = useOptimistic(item.post.likeCount);

  function runMutation(action: () => Promise<unknown>) {
    startTransition(async () => {
      try {
        await action();
      } catch {
        toast.error("Action failed");
      }
    });
  }

  function runOptimisticMutation(
    optimisticUpdate: () => void,
    action: () => Promise<unknown>,
    rollback?: () => void,
  ) {
    startTransition(async () => {
      optimisticUpdate();
      try {
        await action();
      } catch {
        rollback?.();
        toast.error("Action failed");
      }
    });
  }

  return (
    <article className="flex gap-3 border-b p-4 transition-colors hover:bg-muted/30">
      <Link href={`/${item.author.username}`}>
        <Avatar>
          <AvatarImage src={item.author.avatarUrl} />
          <AvatarFallback>{item.author.displayName[0]}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <Link
                href={`/${item.author.username}`}
                className="truncate font-bold hover:underline"
              >
                {item.author.displayName}
              </Link>
              {item.author.subscriptionTier === "premium" && <VerifiedBadge />}
              <Link
                href={`/${item.author.username}`}
                className="truncate text-muted-foreground"
              >
                @{item.author.username}
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href={`/${item.author.username}/status/${item.post._id}`}
                className="text-muted-foreground hover:underline"
              >
                {formatDistanceToNow(item.post.createdAt, { addSuffix: true })}
              </Link>
              {item.post.editedAt && (
                <span className="text-muted-foreground text-sm">(edited)</span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  runMutation(() => deletePost({ postId: item.post._id }))
                }
              >
                Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/${item.author.username}/status/${item.post._id}`}>
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">
            {item.post.content}
          </p>
        </Link>

        {item.post.mediaIds && item.post.mediaIds.length > 0 && (
          <PostMediaGrid
            mediaIds={item.post.mediaIds}
            layout={item.post.mediaLayout ?? "single"}
          />
        )}

        <div className="mt-3 flex max-w-md justify-between text-muted-foreground">
          <Link
            href={`/${item.author.username}/status/${item.post._id}`}
            className="group flex items-center gap-1 hover:text-primary"
          >
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <span className="text-xs">{item.post.replyCount || ""}</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              optimisticReposted && "text-green-500",
            )}
            disabled={isPending}
            onClick={() => {
              runOptimisticMutation(
                () => setOptimisticReposted(!optimisticReposted),
                () => toggleRepost({ postId: item.post._id }),
                () => setOptimisticReposted(item.isReposted),
              );
            }}
          >
            <Repeat2 className="h-4 w-4" />
          </Button>

          <Toggle
            pressed={optimisticLiked}
            onPressedChange={() => {
              const next = !optimisticLiked;
              runOptimisticMutation(
                () => {
                  setOptimisticLiked(next);
                  setLikeCount(next ? likeCount + 1 : likeCount - 1);
                },
                () => toggleLike({ postId: item.post._id }),
                () => {
                  setOptimisticLiked(item.isLiked);
                  setLikeCount(item.post.likeCount);
                },
              );
            }}
            className="h-8 gap-1 px-2 data-[state=on]:text-pink-500"
          >
            <Heart
              className={cn("h-4 w-4", optimisticLiked && "fill-current")}
            />
            <span className="text-xs">{likeCount || ""}</span>
          </Toggle>

          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", optimisticBookmarked && "text-primary")}
            disabled={isPending}
            onClick={() => {
              runOptimisticMutation(
                () => setOptimisticBookmarked(!optimisticBookmarked),
                () => toggleBookmark({ postId: item.post._id }),
                () => setOptimisticBookmarked(item.isBookmarked),
              );
            }}
          >
            <Bookmark
              className={cn("h-4 w-4", optimisticBookmarked && "fill-current")}
            />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
