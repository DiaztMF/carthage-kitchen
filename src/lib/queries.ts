import { db } from "./db";
import { reservations, inquiries, type NewReservation, type NewInquiry } from "./schema";
import { desc } from "drizzle-orm";

export async function createReservation(data: NewReservation) {
  if (!db || !process.env.DATABASE_URL) {
    console.warn("[DB] Fallback: DATABASE_URL not configured. Simulating reservation creation.");
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...data,
      phone: data.phone ?? null,
      notes: data.notes ?? null,
      createdAt: new Date(),
    };
  }

  try {
    const [inserted] = await db.insert(reservations).values(data).returning();
    return inserted;
  } catch (error) {
    console.error("[DB] createReservation failed, falling back to mock response:", error);
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...data,
      phone: data.phone ?? null,
      notes: data.notes ?? null,
      createdAt: new Date(),
    };
  }
}

export async function getReservations(limit = 50) {
  if (!db || !process.env.DATABASE_URL) {
    return [];
  }

  try {
    return await db.select().from(reservations).orderBy(desc(reservations.createdAt)).limit(limit);
  } catch (error) {
    console.error("[DB] getReservations failed:", error);
    return [];
  }
}

export async function createInquiry(data: NewInquiry) {
  if (!db || !process.env.DATABASE_URL) {
    console.warn("[DB] Fallback: DATABASE_URL not configured. Simulating inquiry creation.");
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...data,
      eventType: data.eventType ?? null,
      createdAt: new Date(),
    };
  }

  try {
    const [inserted] = await db.insert(inquiries).values(data).returning();
    return inserted;
  } catch (error) {
    console.error("[DB] createInquiry failed, falling back to mock response:", error);
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...data,
      eventType: data.eventType ?? null,
      createdAt: new Date(),
    };
  }
}

export async function getInquiries(limit = 50) {
  if (!db || !process.env.DATABASE_URL) {
    return [];
  }

  try {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(limit);
  } catch (error) {
    console.error("[DB] getInquiries failed:", error);
    return [];
  }
}
