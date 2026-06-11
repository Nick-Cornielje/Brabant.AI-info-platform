import { NextRequest, NextResponse } from "next/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const from = (formData.get("from") as string) || "/";

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword || password !== sitePassword) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", from);
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const hash = await hashPassword(sitePassword);
  const response = NextResponse.redirect(new URL(from, request.url), {
    status: 303,
  });

  response.cookies.set("brabant_auth", hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
