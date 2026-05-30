"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const markRead = useMutation(api.notifications.mutations.markAllRead);
  const { results, status } = usePaginatedQuery(
    api.notifications.queries.listNotifications,
    {},
    { initialNumItems: 30 },
  );

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Button variant="ghost" size="sm" onClick={() => void markRead()}>
          Mark all read
        </Button>
      </div>
      {status === "LoadingFirstPage" ? (
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          No notifications yet
        </p>
      ) : (
        results.map((item) => {
          if (!item.actor) return null;
          const href = item.post
            ? `/${item.actor.username}/status/${item.post._id}`
            : `/${item.actor.username}`;
          return (
            <Link
              key={item.notification._id}
              href={href}
              className={`flex gap-3 border-b p-4 hover:bg-muted/50 ${!item.notification.read ? "bg-primary/5" : ""}`}
            >
              <Avatar>
                <AvatarImage src={item.actor.avatarUrl} />
                <AvatarFallback>{item.actor.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p>
                  <span className="font-bold">{item.actor.displayName}</span>{" "}
                  {item.notification.type}d
                  {item.notification.type === "follow" ? " you" : " your post"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(item.notification.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
