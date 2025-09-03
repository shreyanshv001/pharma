import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admins = await db.admin.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({ 
      count: admins.length, 
      admins: admins 
    });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
