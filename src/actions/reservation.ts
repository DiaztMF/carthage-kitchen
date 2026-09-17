"use server";

import { z } from "zod";
import { createReservation, createInquiry } from "@/lib/queries";

const reservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  guests: z.coerce.number().int().min(1, "Minimum 1 guest").default(2),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export async function submitReservation(prevState: unknown, formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    guests: formData.get("guests") || 2,
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = reservationSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed. Please check form inputs.",
    };
  }

  try {
    const result = await createReservation(parsed.data);
    return {
      success: true,
      data: result,
      message: "Reservation successfully received!",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to create reservation",
    };
  }
}

// Quote / Contact Inquiry Schema
const quoteInquirySchema = z.object({
  name: z.string().min(1, "Name is required").default("Guest"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  eventType: z.string().optional(),
  message: z.string().min(1, "Message or event details required"),
  guestCount: z.string().optional(),
  eventDate: z.string().optional(),
  cuisine: z.string().optional(),
});

export type QuoteInquiryInput = z.infer<typeof quoteInquirySchema>;

export async function submitQuoteInquiry(input: QuoteInquiryInput) {
  const parsed = quoteInquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed. Please provide a valid email and details.",
    };
  }

  try {
    const { name, email, phone, eventType, message, guestCount, eventDate, cuisine } = parsed.data;
    
    // Also save as inquiry
    const fullMessage = [
      message,
      eventDate ? `Date: ${eventDate}` : null,
      guestCount ? `Guests: ${guestCount}` : null,
      cuisine ? `Cuisine: ${cuisine}` : null,
      phone ? `Phone: ${phone}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const inquiryRecord = await createInquiry({
      name,
      email,
      eventType: eventType ?? "catering_quote",
      message: fullMessage,
    });

    // If reservation details (date, time, guests) are provided, also create reservation entry
    if (eventDate) {
      await createReservation({
        name,
        email,
        phone: phone ?? null,
        guests: guestCount ? parseInt(guestCount, 10) || 2 : 2,
        date: eventDate,
        time: "18:00", // Default event dinner time
        notes: fullMessage,
      });
    }

    return {
      success: true,
      inquiry: inquiryRecord,
      message: "Quote request successfully submitted!",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to process quote request",
    };
  }
}
