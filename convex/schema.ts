import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    subscriptionTier: v.union(v.literal("free"), v.literal("premium")),
    planSlug: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    clerkSubscriptionId: v.optional(v.string()),
    subscriptionUpdatedAt: v.optional(v.number()),
    joinedAt: v.number(),
    followerCount: v.number(),
    followingCount: v.number(),
    postCount: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"])
    .searchIndex("search_username", { searchField: "username" })
    .searchIndex("search_displayName", { searchField: "displayName" }),

  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    mediaIds: v.optional(v.array(v.id("_storage"))),
    mediaLayout: v.optional(
      v.union(
        v.literal("single"),
        v.literal("grid2"),
        v.literal("grid3"),
        v.literal("grid4"),
        v.literal("video"),
      ),
    ),
    parentPostId: v.optional(v.id("posts")),
    rootPostId: v.optional(v.id("posts")),
    quotePostId: v.optional(v.id("posts")),
    viewCount: v.number(),
    likeCount: v.number(),
    repostCount: v.number(),
    replyCount: v.number(),
    bookmarkCount: v.number(),
    hashtags: v.array(v.string()),
    mentionUserIds: v.array(v.id("users")),
    isAiGenerated: v.optional(v.boolean()),
    editedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_author_created", ["authorId", "createdAt"])
    .index("by_parent_created", ["parentPostId", "createdAt"])
    .index("by_root_created", ["rootPostId", "createdAt"])
    .index("by_created", ["createdAt"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["authorId"],
    }),

  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_user_post", ["userId", "postId"])
    .index("by_post", ["postId"]),

  reposts: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_user_post", ["userId", "postId"])
    .index("by_post", ["postId"])
    .index("by_user_created", ["userId", "createdAt"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_post", ["userId", "postId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower_following", ["followerId", "followingId"])
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"]),

  notifications: defineTable({
    recipientId: v.id("users"),
    actorId: v.id("users"),
    type: v.union(
      v.literal("mention"),
      v.literal("reply"),
      v.literal("like"),
      v.literal("repost"),
      v.literal("follow"),
    ),
    postId: v.optional(v.id("posts")),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient_created", ["recipientId", "createdAt"])
    .index("by_recipient_unread", ["recipientId", "read"]),

  conversations: defineTable({
    participantIds: v.array(v.id("users")),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
  }).index("by_lastMessageAt", ["lastMessageAt"]),

  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    mediaId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_conversation_created", ["conversationId", "createdAt"]),

  hashtags: defineTable({
    tag: v.string(),
    postCount: v.number(),
    score: v.number(),
    windowStart: v.number(),
  })
    .index("by_tag", ["tag"])
    .index("by_score", ["score"]),

  feedRankings: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    score: v.number(),
    computedAt: v.number(),
  }).index("by_user_score", ["userId", "score"]),

  aiSessions: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_updated", ["userId", "updatedAt"]),

  aiMessages: defineTable({
    sessionId: v.id("aiSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session_created", ["sessionId", "createdAt"]),
});
