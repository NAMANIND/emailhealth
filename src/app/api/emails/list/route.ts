import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        tags: {
          none: {
            name: "admin",
          },
        },
      },
      select: {
        email: true,
      },
    });

    const emails = users.map((user) => user.email);

    return NextResponse.json({ emails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
