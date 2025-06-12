import { google } from "googleapis";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(`${baseUrl}/auth?error=no_code`);
  }

  try {
    console.log("Received code:", code);
    console.log("State:", state);
    console.log("Redirect URI:", process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI);
    console.log("Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

    const client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    try {
      const { tokens } = await client.getToken({
        code,
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
      });

      console.log("Successfully got tokens");

      client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: client,
        version: "v2",
      });

      const userInfo = await oauth2.userinfo.get();
      console.log("Successfully got user info");

      // Save or update user in database
      const users = await prisma.user.upsert({
        where: { email: userInfo.data.email! },
        update: {
          name: userInfo.data.name!,
          picture: userInfo.data.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        create: {
          email: userInfo.data.email!,
          name: userInfo.data.name!,
          picture: userInfo.data.picture,
          googleId: userInfo.data.id!,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      });

      console.log("User saved or updated:", users);

      const baseUrl = new URL(request.url).origin;
      const response = NextResponse.redirect(`${baseUrl}/`);

      // Store tokens in HTTP-only cookies
      response.cookies.set("access_token", tokens.access_token!, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: tokens.expiry_date
          ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
          : 3600,
      });

      if (tokens.refresh_token) {
        response.cookies.set("refresh_token", tokens.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
      }

      // Store user info in a session cookie
      response.cookies.set("user_info", JSON.stringify(userInfo.data), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: tokens.expiry_date
          ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
          : 3600,
      });

      return response;
    } catch (tokenError: unknown) {
      const error = tokenError as Error & {
        code?: string;
        response?: { data?: unknown };
      };
      console.error("Token error details:", {
        error: error.message,
        code: error.code,
        response: error.response?.data,
      });
      throw error;
    }
  } catch (error: unknown) {
    const err = error as Error & {
      code?: string;
      response?: { data?: unknown };
    };
    console.error("Error in callback:", {
      message: err.message,
      code: err.code,
      response: err.response?.data,
    });
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(
      `${baseUrl}/auth?error=callback_failed&details=${err.message}`
    );
  }
}
