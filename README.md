# Carthage Template

A production-grade culinary hospitality and catering marketing platform built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Motion.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

## Installation

Clone the repository and install dependencies using `pnpm`:

```bash
git clone https://github.com/DiaztMF/carthage-template.git
cd carthage-template
pnpm install
```

## Quick Start

Start the local development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

## What

Carthage Template is a full-featured marketing platform designed for luxury catering businesses, chef collectives, and fine dining establishments. It provides structured menus, multi-location showcases, and customer inquiry management using a modular block-based architecture.

## Why

Traditional hospitality websites frequently suffer from rigid monolithic page builders, poor performance scores, and unmaintainable content coupling. Carthage solves this by decoupling content into typed modules under `src/data/`, leveraging Next.js 16 App Router Server Components for instantaneous loads, and utilizing Tailwind CSS v4 for zero-runtime styling.

## API & Routes

| Route | Type | Description |
|---|---|---|
| `/` | Page (RSC) | Master hospitality landing featuring hero presentation, philosophy, and culinary highlights |
| `/menu` | Page (RSC) | Dynamic culinary menu categorized with typed ingredient modules and dietary filters |
| `/locations` | Page (RSC) | Physical venue directory with hours, parking details, and interactive map cards |
| `/about` | Page (RSC) | Brand narrative, culinary team profiles, and certifications |
| `/contact` | Page (Client) | Reservation request and event booking inquiry form |

## Examples

### Customizing Menu Items
Edit the typed menu definitions in `src/data/menu.ts` without touching presentation code:

```typescript
export const menuData = [
  {
    id: "wood-fired-octopus",
    title: "Wood-Fired Octopus",
    description: "Charred tender octopus, smoked paprika emulsion, fingerling potatoes",
    price: "$28",
    category: "Appetizers"
  }
];
```

## Architecture & Development Guides

```
carthage-template/
├── src/
│   ├── app/                 # Next.js 16 App Router pages and layouts
│   ├── components/          # Reusable UI primitives and section blocks
│   │   ├── sections/        # Domain-specific page sections
│   │   └── ui/              # Base design system primitives
│   └── data/                # Typed data modules (menus, locations, testimonials)
├── public/                  # Static assets and brand imagery
├── DESIGN.md                # Semantic Design System specification
├── package.json             # Scripts and dependencies
└── tsconfig.json            # TypeScript configuration
```

For detailed UI rules, color roles, and typography standards, refer to [DESIGN.md](DESIGN.md).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.
