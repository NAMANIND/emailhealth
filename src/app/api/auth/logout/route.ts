import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ success: true });

  // Clear all auth-related cookies
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("user_info");
  return response;
}
