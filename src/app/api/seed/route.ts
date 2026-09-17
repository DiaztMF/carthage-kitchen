import { NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { reservations, inquiries } from "@/lib/schema";
import { getReservations, getInquiries } from "@/lib/queries";

export async function GET() {
  try {
    const resList = await getReservations(10);
    const inqList = await getInquiries(10);

    return NextResponse.json({
      status: "ok",
      connected: !!process.env.DATABASE_URL && !!db,
      schema: "carthage",
      data: {
        reservationsCount: resList.length,
        inquiriesCount: inqList.length,
        recentReservations: resList,
        recentInquiries: inqList,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Database check failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "seed";

    if (!db || !sql) {
      return NextResponse.json({
        status: "fallback",
        message: "No live database connection. Seed simulated.",
      });
    }

    // Ensure schema 'carthage' and tables exist if live connection permits DDL
    try {
      await sql`CREATE SCHEMA IF NOT EXISTS carthage;`;
      await sql`
        CREATE TABLE IF NOT EXISTS carthage.reservations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          guests INTEGER NOT NULL DEFAULT 2,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS carthage.inquiries (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          event_type TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
    } catch (ddlError) {
      console.warn("[DDL Error - might require migration permissions]:", ddlError);
    }

    // Insert sample test record
    const [sampleReservation] = await db
      .insert(reservations)
      .values({
        name: "Test Carthage VIP",
        email: "guest@carthage-kitchen.com",
        phone: "+1 310-555-0199",
        guests: 4,
        date: "2026-10-15",
        time: "19:30",
        notes: "Chef table reservation tasting menu test.",
      })
      .returning();

    const [sampleInquiry] = await db
      .insert(inquiries)
      .values({
        name: "Test Event Host",
        email: "host@carthage-kitchen.com",
        eventType: "wedding",
        message: "Inquiring for 120 guests Mediterranean banquet.",
      })
      .returning();

    return NextResponse.json({
      status: "success",
      message: "Seed data inserted successfully into schema 'carthage'",
      data: {
        reservation: sampleReservation,
        inquiry: sampleInquiry,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to seed data",
      },
      { status: 500 }
    );
  }
}
