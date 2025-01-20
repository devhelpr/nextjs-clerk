import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Read with pagination
export async function GET() {
  //_request: Request
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany();

    return NextResponse.json({
      products,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data", details: (error as Error).message },
      { status: 500 }
    );
  }
}
