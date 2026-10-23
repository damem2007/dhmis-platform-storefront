import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const base = (process.env.API_BASE_URL || "http://127.0.0.1:5137").replace(/\/$/, "");
  try {
    const response = await fetch(`${base}/v1/public/platform/onboarding`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Platform onboarding is unavailable" }, { status: 502 });
  }
}
