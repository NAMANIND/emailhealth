import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

async function refreshAccessToken(userId: string, refreshToken: string) {
  const client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const { credentials } = await client.refreshAccessToken();

    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: credentials.access_token!,
        ...(credentials.refresh_token && {
          refreshToken: credentials.refresh_token,
        }),
      },
    });

    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Find all users
    const users = await prisma.user.findMany({
      where: {
        tags: {
          none: {
            name: "admin",
          },
        },
      },
      select: {
        id: true,
        email: true,
        accessToken: true,
        refreshToken: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    const results = [];
    let totalSpamCount = 0;

    for (const user of users) {
      if (!user.accessToken) {
        results.push({
          email: user.email,
          error: "Not authenticated with Gmail",
          healthStatus: "unknown",
        });
        continue;
      }

      // Initialize Gmail API
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: user.accessToken });
      const gmail = google.gmail({ version: "v1", auth });

      try {
        // Get spam emails
        const response = await gmail.users.messages.list({
          userId: "me",
          maxResults: 100,
          q: `in:spam from:${email}`,
        });

        const spamCount = response.data.messages?.length || 0;
        totalSpamCount += spamCount;
        const healthStatus = spamCount > 0 ? "bad" : "good";

        results.push({
          email: user.email,
          spamCount,
          healthStatus,
          message:
            healthStatus === "good"
              ? "No spam emails found"
              : `Found ${spamCount} spam emails`,
        });
      } catch (error: unknown) {
        const err = error as Error & { code?: string | number };
        // Handle token refresh if needed
        if (err.code === "401" && user.refreshToken) {
          try {
            const newAccessToken = await refreshAccessToken(
              user.id,
              user.refreshToken
            );

            // Update the user's access token in the database
            await prisma.user.update({
              where: { id: user.id },
              data: { accessToken: newAccessToken },
            });

            // Retry the request with the new token
            auth.setCredentials({ access_token: newAccessToken });
            const gmail = google.gmail({ version: "v1", auth });

            const response = await gmail.users.messages.list({
              userId: "me",
              maxResults: 100,
              q: `in:spam from:${email}`,
            });

            const spamCount = response.data.messages?.length || 0;
            totalSpamCount += spamCount;
            const healthStatus = spamCount > 0 ? "bad" : "good";

            results.push({
              email: user.email,
              spamCount,
              healthStatus,
              message:
                healthStatus === "good"
                  ? "No spam emails found"
                  : `Found ${spamCount} spam emails`,
            });
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            results.push({
              email: user.email,
              error: "Failed to refresh authentication",
              healthStatus: "unknown",
            });
          }
        } else {
          results.push({
            email: user.email,
            error: "Failed to check email health",
            healthStatus: "unknown",
          });
        }
      }
    }

    return NextResponse.json({
      totalUsers: users.length,
      totalSpamCount,
      status: totalSpamCount > 0 ? "bad" : "good",
      results: results,
    });
  } catch (error) {
    console.error("Error checking email health:", error);
    return NextResponse.json(
      { error: "Failed to check email health" },
      { status: 500 }
    );
  }
}
