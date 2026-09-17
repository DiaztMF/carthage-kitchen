"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Pencil } from "lucide-react";
import { offerings } from "@/data/offerings";
import { cuisines } from "@/data/cuisines";
import { attributePages } from "@/data/attributes";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/forms/field";
import { cn } from "@/lib/utils";
import { submitQuoteInquiry } from "@/actions/reservation";

/* Five-step lead capture. Only two required fields: event type + email.
   Steps 2–4 are honestly skippable; a review summary with jump-back edits
   precedes send. URL-prefilled (?event/?menu/?diet) with from= attribution;
   draft persists in localStorage. Program offerings make the form
   cadence-aware (frequency + start date). */

const STORAGE_KEY = "ck-quote-draft";
const TOTAL_STEPS = 5;

interface Draft {
  event_type: string;
  event_date: string;
  date_flexibility: string;
  frequency: string;
  guest_count: string;
  venue_name: string;
  venue_type: string;
  cuisine: string;
  diets: string[];
  service_format: string;
  budget_tier: string;
  name: string;
  email: string;
  phone: string;
  vision: string;
}

const empty: Draft = {
  event_type: "",
  event_date: "",
  date_flexibility: "exact",
  frequency: "weekly",
  guest_count: "",
  venue_name: "",
  venue_type: "",
  cuisine: "",
  diets: [],
  service_format: "",
  budget_tier: "",
  name: "",
  email: "",
  phone: "",
  vision: "",
};

const stepTitles = ["What & when", "Guests & venue", "Cuisine & diet", "Service & budget", "Contact & review"];

export function QuoteWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [sending, setSending] = useState(false);

  // Restore the localStorage draft, then apply URL prefill on top.
  useEffect(() => {
    let base = empty;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) base = { ...empty, ...JSON.parse(stored) };
    } catch {}
    const event = params.get("event");
    const menu = params.get("menu");
    const diet = params.get("diet");
    // ?vision= carries the spread-builder's picked dishes into the notes
    // field — append once, even if the draft is reloaded with the same URL.
    const vision = params.get("vision");
    const visionNote = vision ? `Dishes picked in the spread builder: ${vision}` : null;
    setDraft({
      ...base,
      event_type: event ?? base.event_type,
      cuisine: menu ?? base.cuisine,
      diets: diet ? Array.from(new Set([...base.diets, diet])) : base.diets,
      vision:
        visionNote && !base.vision.includes(visionNote)
          ? [base.vision, visionNote].filter(Boolean).join("\n\n")
          : base.vision,
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, hydrated]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const offering = offerings.find((o) => o.slug === draft.event_type);
  const isRecurring = offering?.kind === "program";

  const stepValid: Record<number, boolean> = {
    1: draft.event_type !== "",
    2: true,
    3: true,
    4: true,
    5: /.+@.+\..+/.test(draft.email),
  };
  const stepEmpty: Record<number, boolean> = {
    2: !draft.guest_count && !draft.venue_name && !draft.venue_type,
    3: !draft.cuisine && draft.diets.length === 0,
    4: !draft.service_format && !draft.budget_tier,
  };

  const summary = useMemo(() => {
    const rows: { step: number; label: string; value: string }[] = [];
    if (offering) {
      const when = draft.event_date
        ? ` · ${draft.event_date}${draft.date_flexibility === "flexible" ? " (flexible)" : ""}`
        : "";
      rows.push({ step: 1, label: isRecurring ? "Program" : "Event", value: `${offering.label}${when}${isRecurring ? ` · ${draft.frequency}` : ""}` });
    }
    if (draft.guest_count) rows.push({ step: 2, label: "Guests", value: draft.guest_count });
    if (draft.venue_name || draft.venue_type)
      rows.push({ step: 2, label: "Venue", value: [draft.venue_name, draft.venue_type].filter(Boolean).join(" · ") });
    if (draft.cuisine)
      rows.push({ step: 3, label: "Cuisine", value: cuisines.find((c) => c.slug === draft.cuisine)?.name ?? draft.cuisine });
    if (draft.diets.length)
      rows.push({ step: 3, label: "Dietary", value: draft.diets.map((d) => attributePages.find((a) => a.tag === d)?.name ?? d).join(", ") });
    if (draft.service_format) rows.push({ step: 4, label: "Service", value: draft.service_format });
    if (draft.budget_tier) rows.push({ step: 4, label: "Budget", value: draft.budget_tier });
    return rows;
  }, [draft, offering, isRecurring]);

  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || !stepValid[5] || !stepValid[1]) return;
    setSending(true);

    try {
      await submitQuoteInquiry({
        name: draft.name || "Guest",
        email: draft.email,
        phone: draft.phone,
        eventType: draft.event_type,
        message: draft.vision || "Catering quote request via QuoteWizard",
        guestCount: draft.guest_count,
        eventDate: draft.event_date,
        cuisine: draft.cuisine,
      });
    } catch (err) {
      console.error("Quote submission error:", err);
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    router.push("/thank-you");
  }

  const fieldset = "grid gap-6 sm:grid-cols-2";

  return (
    <div className="rounded-[4px] border-t-2 border-t-gold bg-ivory p-7 shadow-[0_24px_70px_-28px_rgb(12_31_44/0.35)] ring-1 ring-ink/8 sm:p-10">
      {/* Progress bar with jump-back */}
      <ol className="flex gap-1.5" aria-label="Form progress">
        {stepTitles.map((title, i) => {
          const n = i + 1;
          const reachable = n < step;
          return (
            <li key={title} className="flex-1">
              {/* Visual bar is 4px; the button itself is a 20px touch target */}
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && setStep(n)}
                className="group -my-2 flex h-5 w-full items-center"
                aria-label={`Step ${n}: ${title}${reachable ? " (edit)" : ""}`}
              >
                <span
                  className={cn(
                    "block h-1 w-full rounded-full transition-colors duration-200 ease-out",
                    n === step ? "bg-copper" : n < step ? "bg-copper/50 group-hover:bg-copper" : "bg-ink/10"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-copper-deep">
        Step {step} of {TOTAL_STEPS} — {stepTitles[step - 1]}
      </p>

      <form onSubmit={submit} className="mt-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="event_type">What are we catering? *</Label>
                  <Select
                    id="event_type"
                    value={draft.event_type}
                    onChange={(e) => set({ event_type: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Choose an event or program
                    </option>
                    {offerings.filter((o) => o.kind !== "tool").map((o) => (
                      <option key={o.slug} value={o.slug}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={fieldset}>
                  <div>
                    <Label htmlFor="event_date">{isRecurring ? "Ideal start date" : "Event date"}</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={draft.event_date}
                      onChange={(e) => set({ event_date: e.target.value })}
                    />
                  </div>
                  {isRecurring ? (
                    <div>
                      <Label htmlFor="frequency">How often?</Label>
                      <Select id="frequency" value={draft.frequency} onChange={(e) => set({ frequency: e.target.value })}>
                        <option value="weekly">Weekly</option>
                        <option value="twice-weekly">Twice a week</option>
                        <option value="daily">Every workday</option>
                        <option value="monthly">Monthly</option>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="date_flexibility">Date flexibility</Label>
                      <Select
                        id="date_flexibility"
                        value={draft.date_flexibility}
                        onChange={(e) => set({ date_flexibility: e.target.value })}
                      >
                        <option value="exact">This exact date</option>
                        <option value="flexible">Flexible by a few days</option>
                        <option value="exploring">Still exploring dates</option>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={fieldset}>
                <div>
                  <Label htmlFor="guest_count">Guest count (estimate is fine)</Label>
                  <Input
                    id="guest_count"
                    type="number"
                    min={1}
                    placeholder="120"
                    value={draft.guest_count}
                    onChange={(e) => set({ guest_count: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="venue_type">Venue type</Label>
                  <Select id="venue_type" value={draft.venue_type} onChange={(e) => set({ venue_type: e.target.value })}>
                    <option value="">Not sure yet</option>
                    <option>Private home / estate</option>
                    <option>Office / campus</option>
                    <option>Event venue / ballroom</option>
                    <option>Outdoor / garden / beach</option>
                    <option>Studio / stage</option>
                    <option>School / institution</option>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="venue_name">Venue name or neighborhood</Label>
                  <Input
                    id="venue_name"
                    placeholder="e.g. private estate in Pasadena"
                    value={draft.venue_name}
                    onChange={(e) => set({ venue_name: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="cuisine">Cuisine direction</Label>
                  <Select id="cuisine" value={draft.cuisine} onChange={(e) => set({ cuisine: e.target.value })}>
                    <option value="">Open to suggestions</option>
                    {cuisines.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <fieldset>
                  <legend className="mb-3 block font-sans text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-ink-soft">
                    Dietary needs (pick any)
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {attributePages.filter((a) => !["boxed-lunch", "breakfast"].includes(a.tag)).map((a) => {
                      const on = draft.diets.includes(a.tag);
                      return (
                        <button
                          key={a.tag}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            set({ diets: on ? draft.diets.filter((d) => d !== a.tag) : [...draft.diets, a.tag] })
                          }
                          className={cn(
                            "border px-4 py-2 font-sans text-[0.7rem] font-semibold tracking-wide transition-all duration-300",
                            on
                              ? "border-copper bg-copper text-ivory"
                              : "border-ink/20 text-ink-soft hover:border-copper hover:text-copper-deep"
                          )}
                        >
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 4 && (
              <div className={fieldset}>
                <div>
                  <Label htmlFor="service_format">Service style</Label>
                  <Select
                    id="service_format"
                    value={draft.service_format}
                    onChange={(e) => set({ service_format: e.target.value })}
                  >
                    <option value="">Recommend one for me</option>
                    <option>Drop-off</option>
                    <option>Buffet / chef stations</option>
                    <option>Plated full-service</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget_tier">Budget range (total)</Label>
                  <Select id="budget_tier" value={draft.budget_tier} onChange={(e) => set({ budget_tier: e.target.value })}>
                    <option value="">Prefer your estimate first</option>
                    <option>Under $2,500</option>
                    <option>$2,500 – $7,500</option>
                    <option>$7,500 – $20,000</option>
                    <option>$20,000 – $50,000</option>
                    <option>Above $50,000</option>
                  </Select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-7">
                {summary.length > 0 && (
                  <div className="border border-ink/10 bg-parchment/50 p-5">
                    <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-copper-deep">
                      Your request so far
                    </p>
                    <ul className="mt-3 space-y-2">
                      {summary.map((row) => (
                        <li key={`${row.label}-${row.value}`} className="flex items-baseline justify-between gap-4 text-sm">
                          <span>
                            <span className="font-semibold text-ink">{row.label}:</span>{" "}
                            <span className="text-ink-soft">{row.value}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(row.step)}
                            className="flex shrink-0 items-center gap-1 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-copper-deep hover:text-copper"
                          >
                            <Pencil aria-hidden className="size-3" /> Edit
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className={fieldset}>
                  <div>
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" autoComplete="name" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={draft.email}
                      onChange={(e) => set({ email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" type="tel" autoComplete="tel" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vision">Anything else we should know?</Label>
                  <Textarea
                    id="vision"
                    placeholder="Family recipes, the mood you're after, venue quirks…"
                    value={draft.vision}
                    onChange={(e) => set({ vision: e.target.value })}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-9 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-copper-deep"
            >
              <ArrowLeft aria-hidden className="size-4" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              variant="primary"
              withArrow
              disabled={!stepValid[step]}
              onClick={() => stepValid[step] && setStep((s) => s + 1)}
            >
              {stepEmpty[step] ? "Skip for now" : "Next"}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              withArrow={!sending}
              disabled={!stepValid[5] || sending}
              aria-busy={sending}
            >
              {sending ? "Sending…" : "Send Request"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
