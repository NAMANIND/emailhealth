import crypto from "crypto";
import { redirect } from "next/navigation";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  const scopes = ["profile", "email"];

  scopes.push("https://www.googleapis.com/auth/gmail.send");
  scopes.push("https://www.googleapis.com/auth/gmail.readonly");

  const client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
    state,
    include_granted_scopes: true,
    ...(process.env.VERCEL_ENV !== "production" && { prompt: "consent" }),
  });

  return redirect(url);
}
