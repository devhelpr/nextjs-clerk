import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  const prisma = new PrismaClient();
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const userProfile = await prisma.user_profiles.findUnique({
      where: {
        user_id: session.userId,
      },
      select: {
        user_id: true,
        full_name: true,
      },
    });

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user profile",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
