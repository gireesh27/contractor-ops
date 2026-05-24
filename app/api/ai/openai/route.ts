import { NextRequest, NextResponse } from "next/server";
import { POST as genericAiPost } from "@/app/api/ai/route";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return genericAiPost(new NextRequest(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({ ...body, provider: "openai" })
  }));
}
