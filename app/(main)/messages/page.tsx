"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const conversations = useQuery(api.messages.queries.listConversations);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      <div className="p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Start a conversation from a user profile, or open an existing thread
          below.
        </p>
      </div>
      {conversations === undefined ? (
        <p className="p-4 text-muted-foreground">Loading...</p>
      ) : conversations.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          No messages yet. Visit a profile and click Message.
        </p>
      ) : (
        conversations.map((c) =>
          c?.otherUser ? (
            <Link
              key={c.conversation._id}
              href={`/messages/${c.conversation._id}`}
              className="flex items-center gap-3 border-b p-4 hover:bg-muted/50"
            >
              <Avatar>
                <AvatarImage src={c.otherUser.avatarUrl} />
                <AvatarFallback>{c.otherUser.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{c.otherUser.displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {c.conversation.lastMessagePreview ?? "No messages yet"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(c.conversation.lastMessageAt, {
                  addSuffix: true,
                })}
              </p>
            </Link>
          ) : null,
        )
      )}
    </div>
  );
}
