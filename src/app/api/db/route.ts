import { NextResponse } from "next/server";
import sql from "../../../lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    // This is a sample query - adjust the table name and columns according to your database
    const data = await sql`SELECT id,name FROM users LIMIT 100`;
    return NextResponse.json({ data });
  } catch (error) {
    // For other errors, return 500
    return NextResponse.json(
      { error: "Failed to fetch data", details: (error as Error).message },
      { status: 500 }
    );
  }
}
