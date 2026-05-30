/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_actions from "../ai/actions.js";
import type * as ai_mutations from "../ai/mutations.js";
import type * as ai_queries from "../ai/queries.js";
import type * as cronHandlers from "../cronHandlers.js";
import type * as crons from "../crons.js";
import type * as explore_queries from "../explore/queries.js";
import type * as interactions_mutations from "../interactions/mutations.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_enrichPost from "../lib/enrichPost.js";
import type * as lib_hashtags from "../lib/hashtags.js";
import type * as lib_notifications from "../lib/notifications.js";
import type * as lib_tiers from "../lib/tiers.js";
import type * as media_mutations from "../media/mutations.js";
import type * as media_queries from "../media/queries.js";
import type * as messages_mutations from "../messages/mutations.js";
import type * as messages_queries from "../messages/queries.js";
import type * as notifications_mutations from "../notifications/mutations.js";
import type * as notifications_queries from "../notifications/queries.js";
import type * as posts_feeds from "../posts/feeds.js";
import type * as posts_mutations from "../posts/mutations.js";
import type * as posts_profileFeed from "../posts/profileFeed.js";
import type * as posts_queries from "../posts/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as webhooks_clerk from "../webhooks/clerk.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/actions": typeof ai_actions;
  "ai/mutations": typeof ai_mutations;
  "ai/queries": typeof ai_queries;
  cronHandlers: typeof cronHandlers;
  crons: typeof crons;
  "explore/queries": typeof explore_queries;
  "interactions/mutations": typeof interactions_mutations;
  "lib/auth": typeof lib_auth;
  "lib/enrichPost": typeof lib_enrichPost;
  "lib/hashtags": typeof lib_hashtags;
  "lib/notifications": typeof lib_notifications;
  "lib/tiers": typeof lib_tiers;
  "media/mutations": typeof media_mutations;
  "media/queries": typeof media_queries;
  "messages/mutations": typeof messages_mutations;
  "messages/queries": typeof messages_queries;
  "notifications/mutations": typeof notifications_mutations;
  "notifications/queries": typeof notifications_queries;
  "posts/feeds": typeof posts_feeds;
  "posts/mutations": typeof posts_mutations;
  "posts/profileFeed": typeof posts_profileFeed;
  "posts/queries": typeof posts_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  "webhooks/clerk": typeof webhooks_clerk;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
