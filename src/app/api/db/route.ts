import { NextResponse } from "next/server";
import sql from "../../../lib/db";
import { auth } from "@clerk/nextjs/server";

// GET - Read with pagination
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10"))
    );
    const offset = (page - 1) * limit;

    const [{ total }] = await sql`
      SELECT COUNT(*) as total FROM users WHERE userid = ${session.userId}
    `;

    const data = await sql`
      SELECT id, name 
      FROM users
      WHERE userid = ${session.userId} 
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

// POST - Create
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [newRecord] = await sql`
      INSERT INTO users (userid, name)
      VALUES (${session.userId}, ${name})
      RETURNING id, name
    `;

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create record", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    const [updatedRecord] = await sql`
      UPDATE users 
      SET name = ${name}
      WHERE id = ${id} AND userid = ${session.userId}
      RETURNING id, name
    `;

    if (!updatedRecord) {
      return NextResponse.json(
        { error: "Record not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRecord);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update record", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const [deletedRecord] = await sql`
      DELETE FROM users 
      WHERE id = ${id} AND userid = ${session.userId}
      RETURNING id
    `;

    if (!deletedRecord) {
      return NextResponse.json(
        { error: "Record not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete record", details: (error as Error).message },
      { status: 500 }
    );
  }
}
