"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { generateText } from "ai";

const defaultModel = () => process.env.AI_MODEL ?? "openai/gpt-4o-mini";

export const generateMentionReply = internalAction({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.runQuery(internal.ai.queries.getPostContext, {
      postId: args.postId,
    });
    if (!post) return;

    const { text } = await generateText({
      model: defaultModel(),
      system:
        "You are @AsocialAI, a witty and helpful social media assistant on Asocial. Keep replies concise (under 280 chars when possible), friendly, and relevant to the thread.",
      prompt: `Thread context:\n${post.context}\n\nUser post mentioning you:\n${post.content}\n\nWrite a helpful reply.`,
    });

    await ctx.runMutation(internal.ai.mutations.insertAiReply, {
      parentPostId: args.postId,
      content: text,
    });
  },
});

export const chat = internalAction({
  args: {
    userId: v.id("users"),
    sessionId: v.id("aiSessions"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const history: Array<{ role: string; content: string }> =
      await ctx.runQuery(internal.ai.queries.getSessionMessages, {
        sessionId: args.sessionId,
      });

    const prompt = [
      ...history.map((m) => `${m.role}: ${m.content}`),
      `user: ${args.message}`,
    ].join("\n");

    const { text } = await generateText({
      model: defaultModel(),
      system:
        "You are Asocial AI, a Grok-like assistant with access to social context. Be concise, insightful, and engaging.",
      prompt,
    });

    await ctx.runMutation(internal.ai.mutations.saveChatMessages, {
      sessionId: args.sessionId,
      userMessage: args.message,
      assistantMessage: text,
    });

    return text;
  },
});
