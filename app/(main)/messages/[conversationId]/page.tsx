"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations">;
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const meta = useQuery(api.messages.queries.getConversation, {
    conversationId,
  });
  const sendMessage = useMutation(api.messages.mutations.sendMessage);
  const markRead = useMutation(api.messages.mutations.markRead);
  const { results, status } = usePaginatedQuery(
    api.messages.queries.listMessages,
    { conversationId },
    { initialNumItems: 50 },
  );

  useEffect(() => {
    void markRead({ conversationId });
  }, [conversationId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [results.length]);

  async function handleSend() {
    if (!message.trim()) return;
    await sendMessage({ conversationId, content: message });
    setMessage("");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <Link href="/messages" className="text-sm text-muted-foreground">
          ← Back
        </Link>
        {meta?.otherUser && (
          <>
            <Avatar>
              <AvatarImage src={meta.otherUser.avatarUrl} />
              <AvatarFallback>{meta.otherUser.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{meta.otherUser.displayName}</p>
              <p className="text-sm text-muted-foreground">
                @{meta.otherUser.username}
              </p>
            </div>
          </>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {status === "LoadingFirstPage" ? (
          <p className="text-muted-foreground">Loading messages...</p>
        ) : (
          [...results].reverse().map((item) =>
            item.sender ? (
              <div
                key={item.message._id}
                className={`mb-3 flex ${item.message.senderId === meta?.currentUser._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    item.message.senderId === meta?.currentUser._id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {item.message.content}
                </div>
              </div>
            ) : null,
          )
        )}
        <div ref={bottomRef} />
      </ScrollArea>

      <div className="flex gap-2 border-t p-4">
        <Textarea
          placeholder="Start a new message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[44px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button onClick={() => void handleSend()}>Send</Button>
      </div>
    </div>
  );
}
