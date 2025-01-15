import { NextResponse } from "next/server";
import sql from "../../../lib/db";

export async function GET() {
  try {
    // This is a sample query - adjust the table name and columns according to your database
    const data = await sql`SELECT * FROM users LIMIT 100`;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
