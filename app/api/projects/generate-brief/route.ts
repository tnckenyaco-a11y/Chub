import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentProfile } from "@/lib/current-user";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Nyx, helping a brand write a creative brief for a project they're posting on Nyx Creators Hub, a marketplace connecting African creative talent with brands.

Expand the brand's short description into a clear, concise creative brief a creative professional could act on directly. Cover: the objective, concrete deliverables, tone/style notes, and a rough timeline expectation if one can reasonably be inferred — skip any section that doesn't apply rather than padding it out.

Write it as plain text sized for a text box (no markdown headers, no bullet-heavy formatting) — short paragraphs are fine. Do not invent specifics the brand didn't imply (exact budget figures, dates, or names) — stay general where the brand's prompt was general.`;

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (profile.role !== "brand") {
    return NextResponse.json({ error: "Only brands can generate a brief." }, { status: 403 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "The assistant isn't configured yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";

  if (!prompt) {
    return NextResponse.json({ error: "Describe what you need first." }, { status: 400 });
  }

  const context = [
    title ? `Project title: ${title}` : null,
    category ? `Category: ${category}` : null,
    `What the brand said they need: ${prompt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: context }],
    });

    const brief = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!brief) {
      return NextResponse.json({ error: "Couldn't generate a brief — try rephrasing." }, { status: 502 });
    }

    return NextResponse.json({ brief });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the assistant. Try again." }, { status: 502 });
  }
}
