import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { auth } from "@clerk/nextjs";

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get("sort") || "desc";

    // Get sessions where user is either the owner or participant
    const sessionsResult = await sql`
      SELECT * FROM chat_sessions 
      WHERE user_id = ${userId} OR owner_id = ${userId}
      ORDER BY updated_at ${sort === "asc" ? sql`ASC` : sql`DESC`}
    `;

    return NextResponse.json({ data: sessionsResult.rows });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create new chat session
    const sessionResult = await sql`
      INSERT INTO chat_sessions (user_id, owner_id, title)
      VALUES (${userId}, ${userId}, ${title})
      RETURNING *
    `;

    return NextResponse.json({ data: sessionResult.rows[0] });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
