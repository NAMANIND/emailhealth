import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const tagRequestSchema = z.object({
  tagId: z.string(),
});

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { tags: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.tags);
  } catch (error) {
    console.error("Error fetching user tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch user tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { tagId } = tagRequestSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        tags: {
          connect: { id: tagId },
        },
      },
      include: { tags: true },
    });

    return NextResponse.json(user.tags);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.error("Error adding tag to user:", error);
    return NextResponse.json(
      { error: "Failed to add tag to user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { tagId } = tagRequestSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
      include: { tags: true },
    });

    return NextResponse.json(user.tags);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.error("Error removing tag from user:", error);
    return NextResponse.json(
      { error: "Failed to remove tag from user" },
      { status: 500 }
    );
  }
}
