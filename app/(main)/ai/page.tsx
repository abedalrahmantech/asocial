"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { CLERK_BILLING } from "@/lib/clerk/billing";

export default function AIPage() {
  const { has, isLoaded } = useAuth();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<Id<"aiSessions"> | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sessions = useQuery(api.ai.queries.listSessions);
  const messages = useQuery(
    api.ai.queries.getSessionMessagesPublic,
    sessionId ? { sessionId } : "skip",
  );
  const createSession = useMutation(api.ai.mutations.createSession);
  const sendMessage = useMutation(api.ai.mutations.sendChatMessage);

  useEffect(() => {
    if (isLoaded && !has?.({ feature: CLERK_BILLING.features.aiChat })) {
      router.replace("/pricing");
    }
  }, [isLoaded, has, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (!isLoaded || !has?.({ feature: CLERK_BILLING.features.aiChat })) {
    return <Skeleton className="m-4 h-96 w-full" />;
  }

  async function handleNewSession() {
    const id = await createSession({});
    setSessionId(id);
  }

  async function handleSend() {
    if (!input.trim()) return;
    let sid = sessionId;
    if (!sid) {
      sid = await createSession({});
      setSessionId(sid);
    }
    await sendMessage({ sessionId: sid, message: input });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-bold">Asocial AI</h1>
          <p className="text-sm text-muted-foreground">
            Grok-like assistant powered by AI Gateway
          </p>
        </div>
        <Button variant="outline" onClick={() => void handleNewSession()}>
          New chat
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-56 border-r p-2 md:block">
          {sessions?.map((s) => (
            <Button
              key={s._id}
              variant={sessionId === s._id ? "secondary" : "ghost"}
              className="mb-1 w-full justify-start truncate"
              onClick={() => setSessionId(s._id)}
            >
              {s.title ?? "Chat"}
            </Button>
          ))}
        </aside>

        <div className="flex flex-1 flex-col">
          <ScrollArea className="flex-1 p-4">
            {!messages?.length ? (
              <Card className="p-6 text-center text-muted-foreground">
                Ask about trends, threads, or anything on Asocial.
              </Card>
            ) : (
              messages.map((m) => (
                <div
                  key={m._id}
                  className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </ScrollArea>

          <div className="flex gap-2 border-t p-4">
            <Textarea
              placeholder="Message Asocial AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[44px] resize-none"
            />
            <Button onClick={() => void handleSend()}>Send</Button>
          </div>
        </div>
      </div>

      <p className="border-t p-2 text-center text-xs text-muted-foreground">
        Mention <Link href="/" className="text-primary">@AsocialAI</Link> in posts
        for automated replies (Premium)
      </p>
    </div>
  );
}
