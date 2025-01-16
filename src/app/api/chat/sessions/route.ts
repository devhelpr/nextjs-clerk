import { NextResponse } from "next/server";
import sql from "../../../../lib/db";
import { auth } from "@clerk/nextjs/server";

interface ChatSession {
  id: string;
  user_id: string;
  session_name: string;
  created_at: string;
}

// GET - List chat sessions with pagination and sorting
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10"))
    );
    const sortOrder = searchParams.get("sort") === "asc" ? "ASC" : "DESC";
    const offset = (page - 1) * limit;

    // Get total count
    const [{ total }] = await sql`
      SELECT COUNT(*) as total 
      FROM chat_sessions 
      WHERE user_id = ${session.userId}
    `;

    // Get paginated data
    const data = await sql<ChatSession[]>`
      SELECT id, user_id, session_name, created_at
      FROM chat_sessions
      WHERE user_id = ${session.userId}
      ORDER BY created_at ${sql(sortOrder)}
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
      {
        error: "Failed to fetch chat sessions",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new chat session
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session_name } = await request.json();
    if (!session_name) {
      return NextResponse.json(
        { error: "Session name is required" },
        { status: 400 }
      );
    }

    const [newSession] = await sql<ChatSession[]>`
      INSERT INTO chat_sessions (user_id, session_name)
      VALUES (${session.userId}, ${session_name})
      RETURNING id, user_id, session_name, created_at
    `;

    return NextResponse.json({ data: newSession }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create chat session",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update chat session
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, session_name } = await request.json();
    if (!id || !session_name) {
      return NextResponse.json(
        { error: "Session ID and name are required" },
        { status: 400 }
      );
    }

    const [updatedSession] = await sql<ChatSession[]>`
      UPDATE chat_sessions
      SET session_name = ${session_name}
      WHERE id = ${id}::uuid AND user_id = ${session.userId}
      RETURNING id, user_id, session_name, created_at
    `;

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedSession });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update chat session",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete chat session
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const [deletedSession] = await sql<ChatSession[]>`
      DELETE FROM chat_sessions
      WHERE id = ${id}::uuid AND user_id = ${session.userId}
      RETURNING id
    `;

    if (!deletedSession) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Chat session deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete chat session",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
