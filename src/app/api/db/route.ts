import { NextResponse } from "next/server";
import sql from "../../../lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10"))
    );
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [{ total }] = await sql`
      SELECT COUNT(*) as total FROM users
    `;

    // Get paginated data
    const data = await sql`
      SELECT id, name 
      FROM users 
      ORDER BY id 
      LIMIT ${limit} 
      OFFSET ${offset}
    `;

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data", details: (error as Error).message },
      { status: 500 }
    );
  }
}
