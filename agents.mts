import dotenv from "dotenv";

dotenv.config();

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set");
}

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const mcpClient = new MultiServerMCPClient({
  math: {
    transport: "http",
    url: "http://localhost:3000/mcp/"
  }
});

const agentModel = new ChatOpenAI({ temperature: 0.5, model: "gpt-5-nano" });

const agent = createReactAgent({
  llm: agentModel,
  tools: await mcpClient.getTools(),
});

const agentResponse = await agent.invoke(
  { messages: [new HumanMessage("instructions for ai")] },
  { configurable: { thread_id: "1337" } },
);

console.log(agentResponse.messages[agentResponse.messages.length - 1].content);