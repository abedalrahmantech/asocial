"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function FeedTabs() {
  const pathname = usePathname();
  const isFollowing = pathname === "/home/following";

  return (
    <div className="sticky top-0 z-10 grid grid-cols-2 border-b bg-background/80 backdrop-blur">
      <Link
        href="/"
        className={cn(
          "py-4 text-center font-semibold hover:bg-muted/50 transition-colors",
          !isFollowing && "border-b-4 border-primary",
        )}
      >
        For you
      </Link>
      <Link
        href="/home/following"
        className={cn(
          "py-4 text-center font-semibold hover:bg-muted/50 transition-colors",
          isFollowing && "border-b-4 border-primary",
        )}
      >
        Following
      </Link>
    </div>
  );
}
