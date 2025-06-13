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

async function checkUserEmailHealth(
  user: {
    id: string;
    email: string;
    accessToken: string | null;
    refreshToken: string | null;
  },
  email: string
) {
  if (!user.accessToken) {
    return {
      email: user.email,
      healthStatus: "unknown",
    };
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: user.accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
      q: `in:spam from:${email}`,
    });

    const hasSpam = (response.data.messages?.length ?? 0) > 0;
    return {
      email: user.email,
      healthStatus: hasSpam ? "bad" : "good",
      hasSpam,
    };
  } catch (error: unknown) {
    const err = error as Error & { code?: string | number };
    if (err.code === "401" && user.refreshToken) {
      try {
        const newAccessToken = await refreshAccessToken(
          user.id,
          user.refreshToken
        );
        await prisma.user.update({
          where: { id: user.id },
          data: { accessToken: newAccessToken },
        });

        auth.setCredentials({ access_token: newAccessToken });
        const gmail = google.gmail({ version: "v1", auth });

        const response = await gmail.users.messages.list({
          userId: "me",
          maxResults: 1,
          q: `in:spam from:${email}`,
        });

        const hasSpam = (response.data.messages?.length ?? 0) > 0;
        return {
          email: user.email,
          healthStatus: hasSpam ? "bad" : "good",
          hasSpam,
        };
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        return {
          email: user.email,
          healthStatus: "unknown",
          hasSpam: false,
        };
      }
    }
    return {
      email: user.email,
      healthStatus: "unknown",
      hasSpam: false,
    };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

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
    let foundSpam = false;

    // Process users sequentially until we find spam
    for (const user of users) {
      const result = await checkUserEmailHealth(user, email!);
      results.push(result);

      if (result.hasSpam) {
        foundSpam = true;
        // Add remaining users as unknown since we don't need to check them
        for (let i = results.length; i < users.length; i++) {
          results.push({
            email: users[i].email,
            healthStatus: "unknown",
            hasSpam: false,
          });
        }
        break;
      }
    }

    return NextResponse.json({
      health: foundSpam ? "bad" : "good",
    });
  } catch (error) {
    console.error("Error checking email health:", error);
    return NextResponse.json(
      { error: "Failed to check email health" },
      { status: 500 }
    );
  }
}
