import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { createGateway } from "@ai-sdk/gateway";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export async function POST(req: Request) {
  const { has, userId } = await auth();
  if (!userId || !has?.({ feature: "ai_chat" })) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();
  const model = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

  const result = streamText({
    model: gateway(model),
    system:
      "You are Asocial AI, a helpful social media assistant. Be concise and engaging.",
    messages,
  });

  return result.toTextStreamResponse();
}
