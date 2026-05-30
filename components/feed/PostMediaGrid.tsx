"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

function MediaItem({ storageId }: { storageId: Id<"_storage"> }) {
  const url = useQuery(api.media.queries.getUrl, { storageId });
  if (!url) {
    return <div className="aspect-video animate-pulse bg-muted" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-full w-full object-cover" />
  );
}

export function PostMediaGrid({
  mediaIds,
  layout,
}: {
  mediaIds: Id<"_storage">[];
  layout: "single" | "grid2" | "grid3" | "grid4" | "video";
}) {
  const ids = mediaIds.slice(0, 4);
  const gridClass =
    layout === "single"
      ? "grid-cols-1"
      : layout === "grid2"
        ? "grid-cols-2"
        : "grid-cols-2";

  return (
    <div
      className={cn(
        "mt-3 grid gap-1 overflow-hidden rounded-2xl border",
        gridClass,
      )}
    >
      {ids.map((id, i) => (
        <div
          key={id}
          className={cn(
            "relative aspect-video bg-muted overflow-hidden",
            layout === "grid3" && i === 0 && "row-span-2",
          )}
        >
          <MediaItem storageId={id} />
        </div>
      ))}
    </div>
  );
}
