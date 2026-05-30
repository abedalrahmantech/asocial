import { PostComposer } from "@/components/feed/PostComposer";
import { InfiniteFeed } from "@/components/feed/InfiniteFeed";
import { FeedTabs } from "@/components/feed/FeedTabs";

export default function FollowingPage() {
  return (
    <>
      <FeedTabs />
      <PostComposer />
      <InfiniteFeed feedType="following" />
    </>
  );
}
