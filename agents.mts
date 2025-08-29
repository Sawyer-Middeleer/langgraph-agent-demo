import dotenv from "dotenv";

dotenv.config();

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
process.env.TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

if (!process.env.OPENAI_API_KEY || !process.env.TAVILY_API_KEY) {
  throw new Error("OPENAI_API_KEY and TAVILY_API_KEY must be set");
}

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Define the tools for the agent to use
const mcpClient = new MultiServerMCPClient({
  servers: [
    {
      name: "browserAI",
      url: "https://browserai.com/mcp-example",
    },
  ],
});

const agentModel = new ChatOpenAI({ temperature: 0.2, model: "gpt-5-nano" });

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: await mcpClient.getTools(),
  checkpointSaver: agentCheckpointer,
});

const agentFinalState = await agent.invoke(
  { messages: [new HumanMessage("instructions for ai")] },
  { configurable: { thread_id: "1337" } },
);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

const agentNextState = await agent.invoke(
  { messages: [new HumanMessage("follow up on the instructions")] },
  { configurable: { thread_id: "1337" } },
);

console.log(
  agentNextState.messages[agentNextState.messages.length - 1].content,
);