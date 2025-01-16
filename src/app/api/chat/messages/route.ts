import { NextRequest, NextResponse } from "next/server";
import sql from "../../../../lib/db";
import { auth } from "@clerk/nextjs/server";

interface MessageFile {
  id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");
    //const sort = searchParams.get("sort") || "desc";

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
      AND (user_id = ${session.userId} OR owner_id = ${session.userId})
    `;

    if (sessionResult.length === 0) {
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
          WHEN m.sender_id = ${session.userId} THEN 'user'
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
      ORDER BY m.created_at desc
    `;

    //const messagesResult = await sql.query(query, [session.userId, sessionId]);

    // Return empty array if no messages found
    return NextResponse.json({
      data: messagesResult || [],
    });
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

    // Verify that the user has access to this chat session
    const sessionResult = await sql`
      SELECT * FROM chat_sessions 
      WHERE id = ${session_id} 
      AND (user_id = ${session.userId} OR owner_id = ${session.userId})
    `;

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Insert message
    const messageResult = await sql`
      INSERT INTO chat_messages (session_id, sender_id, message)
      VALUES (${session_id}, ${session.userId}, ${message})
      RETURNING id, message, created_at
    `;

    const newMessage = messageResult[0];

    // Insert files if any
    const messageFiles: MessageFile[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileResult = await sql`
          INSERT INTO message_files (message_id, file_url, file_name)
          VALUES (${newMessage.id}, ${file.file_url}, ${file.file_name})
          RETURNING id, file_url, file_name, uploaded_at
        `;
        messageFiles.push(fileResult[0] as MessageFile);
      }
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
