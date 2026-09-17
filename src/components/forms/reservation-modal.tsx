"use client";

import { useActionState } from "react";
import { submitReservation } from "@/actions/reservation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/forms/field";

export function ReservationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(submitReservation, null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-[4px] border-t-2 border-t-gold bg-ivory p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-soft hover:text-ink text-sm font-semibold uppercase"
        >
          ✕ Close
        </button>

        <h3 className="font-display text-2xl font-medium text-ink">
          Reserve a <em className="italic text-gold">Chef's Table</em>
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Intimate dining and bespoke tasting reservations.
        </p>

        {state?.success ? (
          <div className="mt-6 rounded border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-semibold">{state.message}</p>
            <p className="mt-1 text-xs">
              We look forward to hosting you. A confirmation email has been sent.
            </p>
            <Button
              type="button"
              variant="primary"
              className="mt-4 w-full"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            {state?.message && !state.success && (
              <p className="text-xs font-semibold text-rose-600">{state.message}</p>
            )}

            <div>
              <Label htmlFor="res-name">Full Name *</Label>
              <Input id="res-name" name="name" required placeholder="Marcus Aurelius" />
              {state?.errors?.name && (
                <p className="mt-1 text-xs text-rose-600">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="res-email">Email *</Label>
                <Input
                  id="res-email"
                  name="email"
                  type="email"
                  required
                  placeholder="marcus@carthage.com"
                />
                {state?.errors?.email && (
                  <p className="mt-1 text-xs text-rose-600">{state.errors.email[0]}</p>
                )}
              </div>
              <div>
                <Label htmlFor="res-phone">Phone</Label>
                <Input id="res-phone" name="phone" type="tel" placeholder="+1 310-555-0100" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="res-guests">Guests *</Label>
                <Input
                  id="res-guests"
                  name="guests"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={2}
                  required
                />
              </div>
              <div>
                <Label htmlFor="res-date">Date *</Label>
                <Input id="res-date" name="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="res-time">Time *</Label>
                <Input id="res-time" name="time" type="time" defaultValue="19:00" required />
              </div>
            </div>

            <div>
              <Label htmlFor="res-notes">Dietary Notes / Requests</Label>
              <Textarea
                id="res-notes"
                name="notes"
                rows={2}
                placeholder="Vegetarian preferences, anniversary celebration, etc."
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Submitting..." : "Confirm Reservation"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
