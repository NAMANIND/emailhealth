import { google } from "googleapis";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    const query = searchParams.get("q") || "";

    // Get all users from the database
    const users = await prisma.user.findMany({
      where: {
        accessToken: {
          not: null,
        },
      },
    });

    const userEmails = await Promise.all(
      users.map(async (user) => {
        try {
          const auth = new google.auth.OAuth2();
          const accessToken = user.accessToken;

          try {
            auth.setCredentials({ access_token: accessToken });
            const gmail = google.gmail({ version: "v1", auth });

            // Search in spam folder
            const spamResponse = await gmail.users.messages.list({
              userId: "me",
              maxResults: 200,
              q: `in:spam from:${query}`,
            });

            // Search in non-spam folders (inbox, sent, etc.)
            const nonSpamResponse = await gmail.users.messages.list({
              userId: "me",
              maxResults: 200,
              q: `-in:spam from:${query}`,
            });

            // Get full details for spam emails
            const spamEmailDetails = await Promise.all(
              spamResponse.data.messages?.map(async (message) => {
                const email = await gmail.users.messages.get({
                  userId: "me",
                  id: message.id!,
                });
                return {
                  ...email.data,
                  location: "spam",
                };
              }) || []
            );

            // Get full details for non-spam emails
            const nonSpamEmailDetails = await Promise.all(
              nonSpamResponse.data.messages?.map(async (message) => {
                const email = await gmail.users.messages.get({
                  userId: "me",
                  id: message.id!,
                });
                return {
                  ...email.data,
                  location: "inbox",
                };
              }) || []
            );

            // Combine both spam and non-spam emails
            const emailDetails = [...spamEmailDetails, ...nonSpamEmailDetails];

            return emailDetails;
          } catch (error: unknown) {
            // If the error is due to an expired token and we have a refresh token
            if (
              error &&
              typeof error === "object" &&
              "code" in error &&
              error.code === 401 &&
              user.refreshToken
            ) {
              try {
                // Refresh the access token
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

                // Search in spam folder
                const spamResponse = await gmail.users.messages.list({
                  userId: "me",
                  maxResults: 5,
                  q: `in:spam from:${query}`,
                });

                // Search in non-spam folders (inbox, sent, etc.)
                const nonSpamResponse = await gmail.users.messages.list({
                  userId: "me",
                  maxResults: 5,
                  q: `-in:spam from:${query}`,
                });

                // Get full details for spam emails
                const spamEmailDetails = await Promise.all(
                  spamResponse.data.messages?.map(async (message) => {
                    const email = await gmail.users.messages.get({
                      userId: "me",
                      id: message.id!,
                    });
                    return {
                      ...email.data,
                      location: "spam",
                    };
                  }) || []
                );

                // Get full details for non-spam emails
                const nonSpamEmailDetails = await Promise.all(
                  nonSpamResponse.data.messages?.map(async (message) => {
                    const email = await gmail.users.messages.get({
                      userId: "me",
                      id: message.id!,
                    });
                    return {
                      ...email.data,
                      location: "inbox",
                    };
                  }) || []
                );

                // Combine both spam and non-spam emails
                const emailDetails = [
                  ...spamEmailDetails,
                  ...nonSpamEmailDetails,
                ];

                // Create response with new cookie
                const apiResponse = NextResponse.json({
                  messages: emailDetails,
                });
                if (newAccessToken) {
                  apiResponse.cookies.set("access_token", newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    maxAge: 3600, // 1 hour
                  });
                }

                return emailDetails;
              } catch (refreshError) {
                console.error("Error refreshing token:", refreshError);
                return [];
              }
            }
            throw error;
          }
        } catch (error) {
          console.error(
            `Error searching emails for user ${user.email}:`,
            error
          );
          return [];
        }
      })
    );

    // Flatten the array of email arrays
    const allEmails = userEmails.flat();

    return NextResponse.json({ messages: allEmails });
  } catch (error) {
    console.error("Error searching emails:", error);
    return new NextResponse(null, { status: 500 });
  }
}
