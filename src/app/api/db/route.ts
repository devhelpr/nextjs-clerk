import { NextResponse } from "next/server";
import sql from "../../../lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await auth.protect();
    // This is a sample query - adjust the table name and columns according to your database
    const data = await sql`SELECT * FROM users LIMIT 100`;
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch data", details: (error as string).toString() },
      { status: 500 }
    );
  }
}
