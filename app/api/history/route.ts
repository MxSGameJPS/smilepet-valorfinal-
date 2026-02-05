import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM valorideal ORDER BY created_at DESC",
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
