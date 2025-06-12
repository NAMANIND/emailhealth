import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!accessToken) {
      return new NextResponse(null, { status: 401 });
    }

    return NextResponse.json({
      accessToken,
      refreshToken: refreshToken || "Not available",
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  } catch (error) {
    console.error("Error getting auth details:", error);
    return new NextResponse(null, { status: 500 });
  }
}
