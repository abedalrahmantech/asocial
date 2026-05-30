import { FeedTabs } from "@/components/feed/FeedTabs";
import { PostComposer } from "@/components/feed/PostComposer";
import { InfiniteFeed } from "@/components/feed/InfiniteFeed";

export default function HomePage() {
  return (
    <>
      <FeedTabs />
      <PostComposer />
      <InfiniteFeed feedType="forYou" />
    </>
  );
}
