# Design System: Carthage Template

## 1. Visual Theme & Atmosphere
A refined, editorial culinary and hospitality showcase. The visual language blends high-end architectural symmetry with the warmth of an organic dining room. 
- **Density:** 4 (Airy and comfortable with generous whitespace)
- **Variance:** 7 (Offset asymmetric grids, editorial typography pairings, and varied block proportions)
- **Motion:** 5 (Fluid CSS transitions with subtle spring physics on hover and enter states)

The atmosphere is tactile and authentic: warm linen surfaces, deep graphite typography, and restrained olive-earth tones.

## 2. Color Palette & Roles
- **Warm Linen Canvas** (`#FBF9F5`) — Primary canvas background, warm off-white that reduces eye fatigue
- **Alabaster Surface** (`#FFFFFF`) — Card containers, elevated modals, and interactive surface fills
- **Charcoal Graphite** (`#141413`) — Primary typography, headers, and high-emphasis boundaries
- **Muted Earth Slate** (`#6B6A66`) — Secondary copy, ingredient notes, sub-labels, and metadata
- **Soft Border** (`#E8E3DA`) — 1px tactile borders, structural dividers, and subtle outlines
- **Deep Olive Branch** (`#444C38`) — Singular accent color for primary actions, badges, active filters, and interactive highlights
*(Total accent restraint: saturation capped below 65%. No purple or neon tints allowed.)*

## 3. Typography Rules
- **Display & Headlines:** `Fraunces` or `Cabinet Grotesk` — Tight tracking (`-0.03em`), weighted hierarchy, natural editorial presence
- **Body:** `Satoshi` — Neutral, comfortable line-height (`1.65`), max line-length of `65ch`
- **Monospace & Metadata:** `Geist Mono` — For pricing figures, reservation time slots, and menu category tags
- **Banned:** `Inter` (prohibited for luxury editorial feel), `Times New Roman`, `Georgia`, or generic web-safe serifs

## 4. Component Stylings
- **Buttons:** Tactile rectangular forms with subtle radius (`0.375rem`), flat fills, and a `-1px` transform on active click. Primary button uses Deep Olive Branch fill with pure white text; secondary buttons use 1px Soft Border with Charcoal text. No exterior box-shadow glows.
- **Cards & Menu Containers:** Flat surface with 1px Soft Border (`#E8E3DA`). Rounded corners set to `0.75rem`. Elevation conveyed through border definition rather than aggressive drop shadows.
- **Inputs & Reservation Fields:** Clean labels placed strictly above inputs, standard field height `44px`, 1px Soft Border with smooth focus transition to Deep Olive ring (`ring-1 ring-[#444C38]`).
- **Loaders & Skeletons:** Flat shimmer matching exact card proportions. Circular spinners are banned.
- **Empty States:** Composed typography with clear instructional guidance and single recovery CTA.

## 5. Layout Principles
- **Grid-First Composition:** Structured CSS Grid with max-width containment (`1400px` centered).
- **Asymmetric Menu Layouts:** 2-column zig-zag culinary cards or split-screen imagery rather than generic 3-card equal rows.
- **Hero Stance:** Asymmetric left-aligned headline with natural editorial image placement. No centered hero blocks.
- **Mobile-First Collapse:** Multi-column grids collapse cleanly into a single vertical column below `768px` viewport width. Zero horizontal overflow allowed.

## 6. Motion & Interaction
- **Physics Engine:** Framer Motion / Motion with spring physics (`stiffness: 100, damping: 20`).
- **Scroll Reveals:** Staggered opacity (`0` to `1`) and Y-translation (`16px` to `0px`) on viewport enter.
- **Hardware Acceleration:** Animations confined strictly to `transform` and `opacity`.

## 7. Anti-Patterns (Banned)
- No emojis anywhere in UI or documentation
- No `Inter` font
- No pure black (`#000000`)
- No neon button glows, gradient text badges, or oversaturated accents
- No 3-column equal card rows
- No generic copy clichés ("Elevate your taste", "Seamless dining", "Next-Gen cuisine")
- No broken external image URLs — rely on typed local modules under `src/data/`
