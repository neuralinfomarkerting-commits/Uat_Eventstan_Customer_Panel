import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 8 * 1024 * 1024;

function allowedHosts(): string[] {
  const hosts = [".amazonaws.com", ".cloudfront.net", ".eventstan.com", "eventstan.com"];
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    if (base) hosts.push(new URL(base).hostname);
  } catch {
  }
  return hosts;
}

function isAllowed(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return allowedHosts().some((rule) => (rule.startsWith(".") ? h.endsWith(rule) : h === rule));
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }
  if (!isAllowed(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), { cache: "force-cache", redirect: "error" });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }
    const type = upstream.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 });
    }
    const buf = await upstream.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Too large" }, { status: 413 });
    }
    return new NextResponse(buf, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}