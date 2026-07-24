import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  max_tokens?: number;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: "assistant"; content: string };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

const MODEL = "claude-sonnet-4-5";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!ENV.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: ENV.anthropicApiKey });
  }
  return _client;
}

/**
 * Thin Anthropic-backed replacement for Manus's forge/_core/llm.ts.
 * Keeps the same invokeLLM(params) -> { choices: [{ message: { content } }] }
 * shape callers already rely on, so emailDrip.generateEmail and
 * coaching.generate didn't need to change.
 */
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const client = getClient();
  const maxTokens = params.maxTokens ?? params.max_tokens ?? 2048;
  const responseFormat = params.responseFormat ?? params.response_format;

  const systemMessages = params.messages.filter((m) => m.role === "system").map((m) => m.content);
  const conversation = params.messages
    .filter((m): m is Message & { role: "user" | "assistant" } => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const system = systemMessages.join("\n\n") || undefined;

  // Structured JSON output: force a single tool matching the schema and read
  // its parsed input back out, since Anthropic has no direct response_format param.
  if (responseFormat?.type === "json_schema") {
    const { name, schema } = responseFormat.json_schema;
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: conversation,
      tools: [{ name, description: `Return data matching the ${name} schema.`, input_schema: schema as Anthropic.Tool.InputSchema }],
      tool_choice: { type: "tool", name },
    });

    const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
    const content = toolUse ? JSON.stringify(toolUse.input) : "{}";

    return {
      id: response.id,
      created: Math.floor(Date.now() / 1000),
      model: response.model,
      choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: response.stop_reason }],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: conversation,
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");

  return {
    id: response.id,
    created: Math.floor(Date.now() / 1000),
    model: response.model,
    choices: [{ index: 0, message: { role: "assistant", content: textBlock?.text ?? "" }, finish_reason: response.stop_reason }],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}
