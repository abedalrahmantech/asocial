"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { useCharLimit } from "@/components/user/VerifiedBadge";
import { ImageIcon } from "lucide-react";

export function PostComposer({
  parentPostId,
  placeholder = "What is happening?!",
  onPosted,
}: {
  parentPostId?: Id<"posts">;
  placeholder?: string;
  onPosted?: () => void;
}) {
  const [content, setContent] = useState("");
  const [mediaIds, setMediaIds] = useState<Id<"_storage">[]>([]);
  const [uploading, setUploading] = useState(false);
  const charLimit = useCharLimit();
  const { isLoaded } = useAuth();
  const currentUser = useQuery(api.users.queries.getCurrent);
  const createPost = useMutation(api.posts.mutations.create);
  const generateUploadUrl = useMutation(api.media.mutations.generateUploadUrl);

  const progress = Math.min(100, (content.length / charLimit) * 100);
  const canPost =
    (content.trim().length > 0 || mediaIds.length > 0) &&
    content.length <= charLimit;

  async function handleMediaUpload(file: File) {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setMediaIds((prev) => [...prev, storageId]);
    } catch {
      toast.error("Failed to upload media");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!canPost) return;
    try {
      let mediaLayout: "single" | "grid2" | "grid3" | "grid4" | undefined;
      if (mediaIds.length === 1) mediaLayout = "single";
      else if (mediaIds.length === 2) mediaLayout = "grid2";
      else if (mediaIds.length === 3) mediaLayout = "grid3";
      else if (mediaIds.length >= 4) mediaLayout = "grid4";

      await createPost({
        content,
        parentPostId,
        mediaIds: mediaIds.length ? mediaIds.slice(0, 4) : undefined,
        mediaLayout,
      });
      setContent("");
      setMediaIds([]);
      toast.success(parentPostId ? "Reply posted" : "Post sent");
      onPosted?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post");
    }
  }

  if (!isLoaded) return null;

  return (
    <div className="flex gap-3 border-b p-4">
      <Avatar>
        <AvatarImage src={currentUser?.avatarUrl} />
        <AvatarFallback>
          {currentUser?.displayName?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-3">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-lg shadow-none focus-visible:ring-0"
        />
        {mediaIds.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {mediaIds.length} media attached
          </p>
        )}
        <Progress value={progress} className="h-1" />
        <div className="flex items-center justify-between">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleMediaUpload(file);
              }}
            />
            <Button type="button" variant="ghost" size="icon" asChild>
              <span>
                <ImageIcon className="h-5 w-5 text-primary" />
              </span>
            </Button>
          </label>
          <div className="flex items-center gap-3">
            <span
              className={
                content.length > charLimit
                  ? "text-destructive text-sm"
                  : "text-muted-foreground text-sm"
              }
            >
              {content.length}/{charLimit}
            </span>
            <Button
              onClick={() => void handleSubmit()}
              disabled={!canPost || uploading}
              className="rounded-full font-bold"
            >
              {parentPostId ? "Reply" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
