import { NextResponse } from "next/server";
import sql from "../../../../lib/db";
import { auth } from "@clerk/nextjs/server";

interface ChatMessage {
  id: string;
  session_id: string;
  sender: "user" | "owner";
  message: string;
  created_at: string;
  files?: {
    id: string;
    file_url: string;
    file_name: string;
    uploaded_at: string;
  }[];
}

// GET - List messages for a session with pagination and sorting
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const [chatSession] = await sql`
      SELECT id FROM chat_sessions
      WHERE id = ${sessionId}::uuid AND user_id = ${session.userId}
    `;

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found or unauthorized" },
        { status: 404 }
      );
    }

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "50"))
    );
    const sortOrder = searchParams.get("sort") === "asc" ? "ASC" : "DESC";
    const offset = (page - 1) * limit;

    // Get total count
    const [{ total }] = await sql`
      SELECT COUNT(*) as total 
      FROM chat_messages 
      WHERE session_id = ${sessionId}::uuid
    `;

    // Get messages with their associated files
    const messages = await sql<ChatMessage[]>`
      SELECT 
        m.id,
        m.session_id,
        m.sender,
        m.message,
        m.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'file_url', f.file_url,
              'file_name', f.file_name,
              'uploaded_at', f.uploaded_at
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) as files
      FROM chat_messages m
      LEFT JOIN file_uploads f ON m.id = f.message_id
      WHERE m.session_id = ${sessionId}::uuid
      GROUP BY m.id
      ORDER BY m.created_at ${sql(sortOrder)}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return NextResponse.json({
      data: messages,
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
      { error: "Failed to fetch messages", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Create new message
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session_id, message, files } = await request.json();
    if (!session_id || !message) {
      return NextResponse.json(
        { error: "Session ID and message are required" },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const [chatSession] = await sql`
      SELECT id FROM chat_sessions
      WHERE id = ${session_id}::uuid AND user_id = ${session.userId}
    `;

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found or unauthorized" },
        { status: 404 }
      );
    }

    // Start a transaction to handle message and file uploads
    const newMessage = await sql.begin(async (sql) => {
      // Insert message
      const [message_record] = await sql<ChatMessage[]>`
        INSERT INTO chat_messages (session_id, sender, message)
        VALUES (${session_id}::uuid, 'user', ${message})
        RETURNING id, session_id, sender, message, created_at
      `;

      // Insert files if any
      if (files && Array.isArray(files) && files.length > 0) {
        await sql`
          INSERT INTO file_uploads (message_id, file_url, file_name)
          SELECT 
            ${message_record.id}::uuid,
            file_url,
            file_name
          FROM jsonb_to_recordset(${JSON.stringify(files)}::jsonb)
          AS t(file_url text, file_name text)
        `;
      }

      // Return complete message with files
      const [complete_message] = await sql<ChatMessage[]>`
        SELECT 
          m.id,
          m.session_id,
          m.sender,
          m.message,
          m.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', f.id,
                'file_url', f.file_url,
                'file_name', f.file_name,
                'uploaded_at', f.uploaded_at
              )
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'
          ) as files
        FROM chat_messages m
        LEFT JOIN file_uploads f ON m.id = f.message_id
        WHERE m.id = ${message_record.id}
        GROUP BY m.id
      `;

      return complete_message;
    });

    return NextResponse.json({ data: newMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create message", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
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
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Verify message belongs to user's session
    const [deletedMessage] = await sql<ChatMessage[]>`
      DELETE FROM chat_messages m
      USING chat_sessions s
      WHERE m.id = ${id}::uuid
      AND m.session_id = s.id
      AND s.user_id = ${session.userId}
      RETURNING m.id
    `;

    if (!deletedMessage) {
      return NextResponse.json(
        { error: "Message not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete message", details: (error as Error).message },
      { status: 500 }
    );
  }
}
