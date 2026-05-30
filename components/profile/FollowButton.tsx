"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FollowButton({ userId }: { userId: Id<"users"> }) {
  const router = useRouter();
  const stats = useQuery(api.users.queries.getProfileStats, { userId });
  const toggleFollow = useMutation(api.interactions.mutations.toggleFollow);
  const startConversation = useMutation(
    api.messages.mutations.startConversation,
  );

  if (!stats) return null;

  async function handleFollow() {
    try {
      await toggleFollow({ userId });
    } catch {
      toast.error("Failed to update follow");
    }
  }

  async function handleMessage() {
    try {
      const id = await startConversation({ otherUserId: userId });
      router.push(`/messages/${id}`);
    } catch {
      toast.error("Failed to start conversation");
    }
  }

  if (stats.isOwnProfile) return null;

  return (
    <div className="flex gap-2">
      <Button
        variant={stats.isFollowing ? "outline" : "default"}
        className="rounded-full font-bold"
        onClick={() => void handleFollow()}
      >
        {stats.isFollowing ? "Following" : "Follow"}
      </Button>
      <Button
        variant="outline"
        className="rounded-full font-bold"
        onClick={() => void handleMessage()}
      >
        Message
      </Button>
    </div>
  );
}
