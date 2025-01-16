import { NextResponse } from "next/server";
import sql from "../../../../lib/db";
import { auth } from "@clerk/nextjs/server";

interface FileUpload {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

// GET - List files for a message
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("message_id");
    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Verify message belongs to user's session
    const files = await sql<FileUpload[]>`
      SELECT f.id, f.message_id, f.file_url, f.file_name, f.uploaded_at
      FROM file_uploads f
      JOIN chat_messages m ON f.message_id = m.id
      JOIN chat_sessions s ON m.session_id = s.id
      WHERE f.message_id = ${messageId}::uuid
      AND s.user_id = ${session.userId}
      ORDER BY f.uploaded_at DESC
    `;

    return NextResponse.json({ data: files });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch files", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Add file to message
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message_id, file_url, file_name } = await request.json();
    if (!message_id || !file_url) {
      return NextResponse.json(
        { error: "Message ID and file URL are required" },
        { status: 400 }
      );
    }

    // Verify message belongs to user's session
    const [chatMessage] = await sql`
      SELECT m.id
      FROM chat_messages m
      JOIN chat_sessions s ON m.session_id = s.id
      WHERE m.id = ${message_id}::uuid
      AND s.user_id = ${session.userId}
    `;

    if (!chatMessage) {
      return NextResponse.json(
        { error: "Message not found or unauthorized" },
        { status: 404 }
      );
    }

    const [newFile] = await sql<FileUpload[]>`
      INSERT INTO file_uploads (message_id, file_url, file_name)
      VALUES (${message_id}::uuid, ${file_url}, ${file_name})
      RETURNING id, message_id, file_url, file_name, uploaded_at
    `;

    return NextResponse.json({ data: newFile }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add file", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Remove file
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
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Verify file belongs to user's message/session
    const [deletedFile] = await sql<FileUpload[]>`
      DELETE FROM file_uploads f
      USING chat_messages m, chat_sessions s
      WHERE f.id = ${id}::uuid
      AND f.message_id = m.id
      AND m.session_id = s.id
      AND s.user_id = ${session.userId}
      RETURNING f.id
    `;

    if (!deletedFile) {
      return NextResponse.json(
        { error: "File not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete file", details: (error as Error).message },
      { status: 500 }
    );
  }
}
