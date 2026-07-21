import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { TOOL_DEFINITIONS, runTool } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_TOOL_ROUNDS = 5;
const MAX_HISTORY_MESSAGES = 20;

function systemPrompt(profile: { role: string; first_name: string | null; username: string | null }) {
  const name = profile.first_name || profile.username || "there";
  return `You are Nyx, the in-dashboard assistant for Nyx Creators Hub, a marketplace connecting African creative talent with brands. You're talking to ${name}, who is signed in as a ${profile.role}.

Only help with this account's own orders, proposals, and earnings — you have no visibility into other users' data. Use the tools to look up real data before answering; never guess or make up numbers, statuses, or ids.

For submit_proposal, look up the project_id with search_open_projects first — never invent one.

For approve_and_release_order: this moves real M-Pesa money and cannot be undone. Always call it first with confirm=false to preview the amount, tell the user exactly what will happen, and only call it again with confirm=true after they explicitly say to proceed in this conversation. Never skip straight to confirm=true.

Keep replies short and conversational — this is a chat widget, not a report.`;
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "The assistant isn't configured yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const incoming = Array.isArray(body?.messages) ? body.messages : null;
  if (!incoming || incoming.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const supabase = await createClient();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let conversation: Anthropic.MessageParam[] = incoming.slice(-MAX_HISTORY_MESSAGES);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: systemPrompt(profile),
      tools: TOOL_DEFINITIONS,
      messages: conversation,
    });

    conversation = [...conversation, { role: "assistant", content: response.content }];

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      return NextResponse.json({ reply: text, messages: conversation });
    }

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = await runTool(block.name, block.input as Record<string, unknown>, {
        supabase,
        profile,
      });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    conversation = [...conversation, { role: "user", content: toolResults }];
  }

  return NextResponse.json({
    reply: "That took more steps than I could finish — try asking in a simpler way.",
    messages: conversation,
  });
}
