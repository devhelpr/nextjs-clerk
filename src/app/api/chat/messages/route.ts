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
    const sessionId = searchParams.get("session_id");
    const sort = searchParams.get("sort") || "desc";

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify that the user has access to this chat session
    const sessionResult = await sql`
      SELECT * FROM chat_sessions 
      WHERE id = ${sessionId} 
      AND (user_id = ${userId} OR owner_id = ${userId})
    `;

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Get messages with files
    const messagesResult = await sql`
      SELECT 
        m.id,
        m.message,
        m.created_at,
        CASE 
          WHEN m.sender_id = ${userId} THEN 'user'
          ELSE 'owner'
        END as sender,
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
      LEFT JOIN message_files f ON m.id = f.message_id
      WHERE m.session_id = ${sessionId}
      GROUP BY m.id, m.message, m.created_at, m.sender_id
      ORDER BY m.created_at ${sort === "asc" ? sql`ASC` : sql`DESC`}
    `;

    return NextResponse.json({ data: messagesResult.rows });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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

    const { session_id, message, files } = await request.json();

    if (!session_id || !message) {
      return NextResponse.json(
        { error: "Session ID and message are required" },
        { status: 400 }
      );
    }

    // Verify that the user has access to this chat session
    const sessionResult = await sql`
      SELECT * FROM chat_sessions 
      WHERE id = ${session_id} 
      AND (user_id = ${userId} OR owner_id = ${userId})
    `;

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Insert message
    const messageResult = await sql`
      INSERT INTO chat_messages (session_id, sender_id, message)
      VALUES (${session_id}, ${userId}, ${message})
      RETURNING id, message, created_at
    `;

    const newMessage = messageResult.rows[0];

    // Insert files if any
    let messageFiles = [];
    if (files && files.length > 0) {
      const fileValues = files.map(
        (file: { file_url: string; file_name: string }) => ({
          message_id: newMessage.id,
          file_url: file.file_url,
          file_name: file.file_name,
        })
      );

      const filesResult = await sql`
        INSERT INTO message_files ${sql(fileValues)}
        RETURNING id, file_url, file_name, uploaded_at
      `;

      messageFiles = filesResult.rows;
    }

    return NextResponse.json({
      data: {
        ...newMessage,
        sender: "user",
        files: messageFiles,
      },
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
