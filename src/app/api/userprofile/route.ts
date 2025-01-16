import { NextResponse } from "next/server";
import sql from "../../../lib/db";
import { auth } from "@clerk/nextjs/server";

interface UserProfile {
  full_name: string;
  location: string | null;
  phone_number: string | null;
  created_at: string;
}

// GET - Retrieve user profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const [profile] = await sql<UserProfile[]>`
      SELECT full_name, location, phone_number, created_at
      FROM user_profiles
      WHERE user_id = ${session.userId}
    `;

    // Return default empty data if no profile exists
    return NextResponse.json({
      data: profile || {
        full_name: "",
        location: null,
        phone_number: null,
        created_at: new Date().toISOString(),
      },
      exists: !!profile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update or create user profile
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, location, phone_number } = body;

    if (!full_name) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Upsert the profile
    const [updatedProfile] = await sql<UserProfile[]>`
      INSERT INTO user_profiles (user_id, full_name, location, phone_number)
      VALUES (${session.userId}, ${full_name}, ${location}, ${phone_number})
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        location = EXCLUDED.location,
        phone_number = EXCLUDED.phone_number
      RETURNING full_name, location, phone_number, created_at
    `;

    return NextResponse.json({
      data: updatedProfile,
      exists: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile", details: (error as Error).message },
      { status: 500 }
    );
  }
}
