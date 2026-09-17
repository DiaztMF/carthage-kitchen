"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { eventOfferings, programOfferings } from "@/data/offerings";
import { cuisines } from "@/data/cuisines";
import { site } from "@/lib/site";
import { img } from "@/lib/images";
import { TanitMark } from "@/components/ui/tanit-mark";
import { SmartImage } from "@/components/shared/smart-image";
import { ButtonLink, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReservationModal } from "@/components/forms/reservation-modal";

/* Header — logo lockup left (TANIT + stacked CARTHAGE/KITCHEN caps),
   nav centered, phone + quote pill right. Dropdowns mirror the two
   buyer modes (Catering / Cuisines). */

function Wordmark({ light }: { light: boolean }) {
  return (
    <span className="flex flex-col items-center leading-none" style={{ fontFamily: "var(--font-logo)" }}>
      <span className="text-[1.02rem] font-semibold tracking-[0.18em] transition-colors duration-700" style={{ marginRight: "-0.18em" }}>
        CARTHAGE
      </span>
      <span
        className={cn(
          "mt-[5px] text-[0.54rem] font-semibold tracking-[0.62em] transition-colors duration-700",
          light ? "text-ember" : "text-copper-deep"
        )}
        style={{ marginRight: "-0.62em" }}
      >
        KITCHEN
      </span>
    </span>
  );
}

const panelBase =
  "absolute left-1/2 top-full z-50 -translate-x-1/2 overflow-hidden rounded-b-[4px] border border-ink/8 border-t-2 border-t-gold bg-ivory text-ink shadow-[0_24px_70px_-24px_rgb(12_31_44/0.35)] transition-all duration-500 ease-[var(--ease-luxe)]";
const panelOpen = "visible translate-y-0 opacity-100";
const panelClosed = "pointer-events-none invisible translate-y-4 opacity-0";

const panelHeading =
  "flex items-center gap-2.5 px-4 pb-2.5 pt-1 font-sans text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-copper-deep/80 before:inline-block before:h-px before:w-4 before:bg-copper/50";

const panelLink =
  "group/pl relative block px-4 py-2 text-[0.92rem] font-medium text-ink transition-all duration-300 ease-[var(--ease-luxe)] hover:pl-6 hover:text-copper-deep before:absolute before:left-2 before:top-1/2 before:h-px before:w-0 before:bg-copper before:transition-all before:duration-300 hover:before:w-2.5";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Dropdowns open on CLICK (deliberate, touch-friendly, a11y-clean);
  // Escape, outside-click, and route changes close them.
  const [menu, setMenu] = useState<null | "catering" | "cuisines" | "company">(null);
  const [reservationOpen, setReservationOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  /* Hover with INTENT: opening requires the cursor to rest on the button
     (160ms) — passing through does nothing. While closed, the panel is
     pointer-events-none, so the trigger zone is exactly the button, never
     the invisible panel area. A 240ms grace on exit prevents flicker. */
  const hoverProps = (name: "catering" | "cuisines" | "company") => ({
    onMouseEnter: () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (menu !== name) {
        if (openTimer.current) clearTimeout(openTimer.current);
        openTimer.current = setTimeout(() => setMenu(name), 160);
      }
    },
    onMouseLeave: () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      closeTimer.current = setTimeout(
        () => setMenu((m) => (m === name ? null : m)),
        240
      );
    },
  });
  // Close a dropdown when keyboard focus leaves it (Tab past the last link).
  const blurClose = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMenu(null);
  };
  const pathname = usePathname();
  // Transparent over every hero — all pages open on the navy slab.
  const light = !scrolled && !open;

  useEffect(() => {
    // Hysteresis: engage past 48px, release under 8px — no thrashing when
    // the user hovers around the threshold.
    const onScroll = () =>
      setScrolled((prev) => (prev ? window.scrollY > 8 : window.scrollY > 48));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
    clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    // Lock scroll AND make the page behind the overlay inert — otherwise
    // Tab walks into content the overlay visually covers.
    document.documentElement.style.overflow = open ? "hidden" : "";
    const behind = [document.getElementById("main"), document.querySelector("footer")];
    for (const el of behind) {
      if (!el) continue;
      if (open) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    }
    return () => {
      document.documentElement.style.overflow = "";
      for (const el of behind) el?.removeAttribute("inert");
    };
  }, [open]);

  const topItem =
    "group/item relative flex items-center gap-1.5 py-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-opacity";
  const underline =
    "pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-[var(--ease-luxe)] group-hover/item:scale-x-100";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-700 ease-[var(--ease-luxe)]",
        light ? "text-foam" : "text-ink"
      )}
    >
      {/* Background veil — fades in, never snaps */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-all duration-700 ease-[var(--ease-luxe)]",
          light
            ? "bg-transparent shadow-none backdrop-blur-none"
            : "bg-ivory/92 shadow-[0_12px_40px_-18px_rgb(12_31_44/0.18)] backdrop-blur-md"
        )}
      />
      {/* Bottom hairline — a gradient thread that breathes in with the veil */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper/35 to-transparent transition-opacity duration-700",
          light ? "opacity-0" : "opacity-100"
        )}
      />

      <div
        className={cn(
          "relative mx-auto grid w-full max-w-[88rem] grid-cols-[1fr_auto] items-center px-5 transition-[height] duration-500 ease-[var(--ease-luxe)] sm:px-8 xl:grid-cols-[1fr_auto_1fr] lg:px-12",
          scrolled && !open ? "h-16" : "h-20"
        )}
      >
        {/* Lockup */}
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="group/logo flex w-fit items-center gap-3.5"
        >
          <TanitMark
            className={cn(
              "transition-all duration-500 ease-[var(--ease-luxe)]",
              scrolled && !open ? "h-8" : "h-9",
              light ? "text-gold" : "text-copper-deep"
            )}
          />
          <Wordmark light={light} />
        </Link>

        {/* Centered nav */}
        <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-8 xl:flex">
          <div className="relative" {...hoverProps("catering")} onBlur={blurClose}>
            <button
              type="button"
              onClick={() => { clearTimers(); setMenu(menu === "catering" ? null : "catering"); }}
              aria-haspopup="true"
              aria-expanded={menu === "catering"}
              className={cn(
                topItem,
                menu === "catering"
                  ? light ? "text-gold" : "text-copper-deep"
                  : cn("opacity-85 hover:opacity-100", light ? "hover:text-gold" : "hover:text-copper-deep")
              )}
            >
              Catering
              <ChevronDown
                aria-hidden
                className={cn("size-3 transition-transform duration-500 ease-[var(--ease-luxe)]", menu === "catering" && "rotate-180")}
              />
            </button>
            <div className={cn(panelBase, menu === "catering" ? panelOpen : panelClosed)} style={{ minWidth: "46rem" }}>
              <div className="flex">
                <div className="grid flex-1 grid-cols-2 gap-x-4 p-6">
                  <div>
                    <p className={panelHeading}>By Event</p>
                    {eventOfferings.map((o) => (
                      <Link key={o.slug} href={`/services/${o.slug}`} className={panelLink}>
                        {o.label.replace(" Catering", "")}
                      </Link>
                    ))}
                  </div>
                  <div>
                    <p className={panelHeading}>Recurring</p>
                    {programOfferings.map((o) => (
                      <Link key={o.slug} href={`/programs/${o.slug}`} className={panelLink}>
                        {o.label}
                      </Link>
                    ))}
                    <Link href="/programs" className={panelLink}>
                      All programs
                    </Link>
                    <p className={cn(panelHeading, "mt-5")}>More</p>
                    <Link href="/services" className={panelLink}>
                      All services
                    </Link>
                    <Link href="/pricing" className={panelLink}>
                      Pricing guide
                    </Link>
                  </div>
                </div>
                {/* Featured evidence card */}
                <Link
                  href="/events"
                  className="group/feat relative block w-60 shrink-0 overflow-hidden"
                >
                  <SmartImage
                    src={img.weddingTent}
                    alt="A tented estate wedding catered by Carthage Kitchen"
                    sizes="240px"
                    className="transition-transform duration-700 ease-[var(--ease-luxe)] group-hover/feat:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-sans text-[0.54rem] font-semibold uppercase tracking-[0.28em] text-gold">
                      From the Record
                    </p>
                    <p className="font-display mt-1.5 text-lg font-medium leading-snug text-foam">
                      Events we've actually catered
                    </p>
                    <p className="mt-1.5 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-foam-dim transition-colors group-hover/feat:text-gold">
                      Read the case studies →
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative" {...hoverProps("cuisines")} onBlur={blurClose}>
            <button
              type="button"
              onClick={() => { clearTimers(); setMenu(menu === "cuisines" ? null : "cuisines"); }}
              aria-haspopup="true"
              aria-expanded={menu === "cuisines"}
              className={cn(
                topItem,
                menu === "cuisines"
                  ? light ? "text-gold" : "text-copper-deep"
                  : cn("opacity-85 hover:opacity-100", light ? "hover:text-gold" : "hover:text-copper-deep")
              )}
            >
              Cuisines
              <ChevronDown
                aria-hidden
                className={cn("size-3 transition-transform duration-500 ease-[var(--ease-luxe)]", menu === "cuisines" && "rotate-180")}
              />
            </button>
            <div className={cn(panelBase, menu === "cuisines" ? panelOpen : panelClosed)} style={{ minWidth: "23rem" }}>
              <div className="p-5">
                <p className={panelHeading}>Seven Kitchens, One Roof</p>
                {cuisines.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/menus/${c.slug}`}
                    className="group/c flex items-center gap-3.5 rounded-[3px] px-3 py-2 transition-colors duration-300 hover:bg-parchment/70"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-full shadow-[var(--shadow-plate)] ring-1 ring-copper/25 ring-offset-1 ring-offset-ivory">
                      <SmartImage
                        src={c.image}
                        alt={c.imageAlt}
                        sizes="40px"
                        className="transition-transform duration-500 group-hover/c:scale-110"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="font-display block text-[1rem] font-medium leading-tight text-ink transition-colors group-hover/c:text-copper-deep">
                        {c.name}
                      </span>
                      <span className="block truncate text-[0.72rem] leading-snug text-ink-soft">
                        {c.tagline}
                      </span>
                    </span>
                  </Link>
                ))}
                <div className="mt-3 flex items-center justify-between border-t border-ink/8 px-3 pt-3">
                  <Link
                    href="/menus"
                    className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-copper-deep transition-colors hover:text-copper"
                  >
                    All menus →
                  </Link>
                  <Link
                    href="/custom-package"
                    className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-copper-deep"
                  >
                    Custom builder
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Company dropdown — brand, proof, and diligence pages */}
          <div className="relative" {...hoverProps("company")} onBlur={blurClose}>
            <button
              type="button"
              onClick={() => { clearTimers(); setMenu(menu === "company" ? null : "company"); }}
              aria-haspopup="true"
              aria-expanded={menu === "company"}
              className={cn(
                topItem,
                menu === "company"
                  ? light ? "text-gold" : "text-copper-deep"
                  : cn("opacity-85 hover:opacity-100", light ? "hover:text-gold" : "hover:text-copper-deep")
              )}
            >
              Company
              <ChevronDown
                aria-hidden
                className={cn("size-3 transition-transform duration-500 ease-[var(--ease-luxe)]", menu === "company" && "rotate-180")}
              />
            </button>
            <div className={cn(panelBase, menu === "company" ? panelOpen : panelClosed)} style={{ minWidth: "15rem" }}>
              <div className="p-5">
                <p className={panelHeading}>The Kitchen</p>
                <Link href="/about" className={panelLink}>
                  About us
                </Link>
                <Link href="/why-carthage" className={panelLink}>
                  Why Carthage
                </Link>
                <p className={cn(panelHeading, "mt-5")}>The Proof</p>
                <Link href="/events" className={panelLink}>
                  Events we've catered
                </Link>
                <Link href="/testimonials" className={panelLink}>
                  Testimonials
                </Link>
                <Link href="/gallery" className={panelLink}>
                  Gallery
                </Link>
              </div>
            </div>
          </div>

          {[
            { href: "/locations", label: "Locations" },
            { href: "/pricing", label: "Pricing" },
          ].map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  topItem,
                  active
                    ? light
                      ? "text-gold"
                      : "text-copper-deep"
                    : cn("opacity-85 hover:opacity-100", light ? "hover:text-gold" : "hover:text-copper-deep")
                )}
              >
                {link.label}
                <span className={cn(underline, active && "scale-x-100")} />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden items-center justify-end gap-4 xl:flex">
          <button
            type="button"
            onClick={() => setReservationOpen(true)}
            className={cn(
              "font-sans text-[0.7rem] font-semibold tracking-[0.14em] uppercase transition-colors",
              light ? "text-gold hover:text-foam" : "text-copper-deep hover:text-ink"
            )}
          >
            Table Reservation
          </button>
          <a
            href={site.phoneHref}
            className="group/item relative flex items-center gap-2 font-sans text-[0.7rem] font-semibold tracking-[0.08em] opacity-85 transition-opacity hover:opacity-100"
          >
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full border transition-colors duration-700",
                light ? "border-foam/30" : "border-ink/15"
              )}
            >
              <Phone aria-hidden className="size-3.5" />
            </span>
            {site.phone}
          </a>
          <ButtonLink
            href="/get-a-quote?from=header"
            variant={light ? "gold" : "primary"}
            withArrow={false}
          >
            Request Quote
          </ButtonLink>
        </div>

        {/* -m-2/p-2 grows the touch target to 44px without moving the icon */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-m-2 justify-self-end p-2 xl:hidden"
        >
          {open ? <X className="size-7" /> : <Menu className="size-7" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="slab grain fixed inset-0 top-20 z-40 overflow-y-auto xl:hidden"
          >
            <div className="space-y-8 px-7 pb-28 pt-8">
              <div>
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[var(--tracking-kicker)] text-gold">
                  Catering
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-x-4">
                  {[...eventOfferings, ...programOfferings].map((o) => (
                    <li key={o.slug}>
                      <Link
                        href={o.kind === "event" ? `/services/${o.slug}` : `/programs/${o.slug}`}
                        className="block border-b border-foam/10 py-2.5 text-[0.95rem] text-foam hover:text-gold"
                      >
                        {o.short}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[var(--tracking-kicker)] text-gold">
                  Cuisines
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-x-4">
                  {cuisines.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/menus/${c.slug}`}
                        className="block border-b border-foam/10 py-2.5 text-[0.95rem] text-foam hover:text-gold"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="space-y-1">
                {[
                  { href: "/services", label: "All Services" },
                  { href: "/programs", label: "Programs" },
                  { href: "/menus", label: "All Menus" },
                  { href: "/custom-package", label: "Custom Spread Builder" },
                  { href: "/locations", label: "Locations" },
                  { href: "/events", label: "Events We've Catered" },
                  { href: "/testimonials", label: "Testimonials" },
                  { href: "/gallery", label: "Gallery" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/about", label: "About" },
                  { href: "/why-carthage", label: "Why Carthage" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-display block py-2 text-2xl text-foam hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-start gap-4">
                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  onClick={() => {
                    setOpen(false);
                    setReservationOpen(true);
                  }}
                >
                  Table Reservation
                </Button>
                <ButtonLink href="/get-a-quote?from=mobile-menu" variant="gold" size="lg">
                  Request Quote
                </ButtonLink>
                <a href={site.phoneHref} className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-foam">
                  {site.phone}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <ReservationModal
        isOpen={reservationOpen}
        onClose={() => setReservationOpen(false)}
      />
    </header>
  );
}
