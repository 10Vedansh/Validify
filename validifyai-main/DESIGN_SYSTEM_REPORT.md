# Validify Design System

## Overview

A unified, restrained design system inspired by **Linear**, **Vercel**, and **Stripe**. Dark-only theme with a single indigo accent on neutral zinc surfaces. Every component is built with Radix UI primitives and styled with Tailwind CSS v4.

---

## Design Tokens

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.13 0.004 270)` | Page background |
| `--foreground` | `oklch(0.97 0.003 250)` | Primary text |
| `--card` | `oklch(0.165 0.004 270)` | Card/surface background |
| `--popover` | `oklch(0.175 0.004 270)` | Dropdowns, tooltips |
| `--primary` | `oklch(0.68 0.18 268)` | Indigo accent |
| `--secondary` | `oklch(0.22 0.006 270)` | Secondary surfaces |
| `--muted` | `oklch(0.20 0.005 270)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.60 0.012 260)` | Secondary text |
| `--destructive` | `oklch(0.60 0.22 25)` | Error/destructive |
| `--border` | `oklch(1 0 0 / 6%)` | Subtle borders |
| `--input` | `oklch(1 0 0 / 8%)` | Input borders |
| `--ring` | `oklch(0.68 0.18 268 / 50%)` | Focus rings |
| `--sidebar` | `oklch(0.14 0.004 270)` | Sidebar background |

### Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 oklch(0 0 0 / 0.3)` |
| `--shadow-md` | `0 4px 12px -4px oklch(0 0 0 / 0.4), 0 1px 0 0 oklch(1 0 0 / 0.04) inset` |
| `--shadow-lg` | `0 8px 32px -8px oklch(0 0 0 / 0.5), 0 1px 0 0 oklch(1 0 0 / 0.04) inset` |
| `--shadow-xl` | `0 16px 48px -12px oklch(0 0 0 / 0.6), 0 1px 0 0 oklch(1 0 0 / 0.04) inset` |

### Border Radius

| Token | Value |
|-------|-------|
| `--radius-xs` | `2px` |
| `--radius-sm` | `4px` |
| `--radius-md` | `6px` |
| `--radius-lg` | `10px` (default) |
| `--radius-xl` | `14px` |
| `--radius-2xl` | `18px` |

### Typography

- **Sans**: Inter (body, 15px base)
- **Mono**: JetBrains Mono
- **Headings**: Letter-spacing `-0.02em`, font-weight `600`
- **Features**: `cv11`, `ss01`, `ss03` for Inter

### Spacing

Standard Tailwind spacing scale. Common values used across the app:

| Context | Value |
|---------|-------|
| Page padding | `px-6` (24px) |
| Card padding | `px-6 py-5` / `px-6 pb-6` |
| Gap (sections) | `gap-3`, `gap-4`, `gap-6` |
| Stack spacing | `space-y-4`, `space-y-5`, `space-y-6` |

---

## Component Library

### Button (`src/components/ui/button.tsx`)

- **Variants**: `default` (primary), `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Sizes**: `default` (h-9), `sm` (h-8), `lg` (h-10), `icon` (h-9 w-9)
- **Behavior**: `active:scale-[0.97]` press effect, `transition-all duration-150`
- **Icons**: 16px (`h-4 w-4`), shrink-0

### Card (`src/components/ui/card.tsx`)

- **Subcomponents**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Card**: `rounded-xl border border-border bg-card text-card-foreground shadow-sm`
- **Content padding**: `px-6 pb-6` (removed pt-0 pattern, unified to px/pb)
- **Header padding**: `px-6 py-5` (previously `p-6`)

### Input (`src/components/ui/input.tsx`)

- **Style**: `rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm`
- **Focus**: `focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary/50`
- **Placeholder**: `placeholder:text-muted-foreground/60` (subtler)
- **Transition**: `transition-all duration-150`

### Dialog (`src/components/ui/dialog.tsx`)

- **Overlay**: `bg-black/60 backdrop-blur-sm` (softer than `/80`)
- **Content**: Centered, `max-w-lg`, `gap-4`, `p-6`, `sm:rounded-lg`
- **Animation**: `duration-150` (faster), scale zoom on open/close
- **Close button**: `rounded-md p-1` with `focus:ring-1`

### Alert Dialog (`src/components/ui/alert-dialog.tsx`)

- Same overlay/content styling as Dialog
- Actions use `buttonVariants()`, Cancel uses `buttonVariants({ variant: "outline" })`

### Badge (`src/components/ui/badge.tsx`)

- **Style**: `rounded-md border px-2 py-0.5 text-[11px] font-medium`
- **Variants**: `default` (primary/15 bg), `secondary`, `destructive`, `outline`, `success` (emerald), `warning` (amber)
- Tinted backgrounds (e.g., `bg-primary/15 text-primary`) instead of solid fills

### Skeleton (`src/components/ui/skeleton.tsx`)

- Uses shimmer animation (gradient sweep) instead of `animate-pulse`
- Class: `shimmer rounded-md`

### Loading States (`src/components/common/LoadingScreen.tsx`)

- Centered flex layout, `min-h-[60vh]`
- `Loader2` icon with `animate-spin text-primary`
- Optional text label

### Empty State (`src/components/common/EmptyState.tsx`)

- Dashed border: `border-dashed border-border/50`
- `bg-card/30` background
- Centered icon in bordered box
- `py-14` vertical padding

### Error State (`src/components/common/ErrorState.tsx`)

- Same layout as EmptyState with `text-destructive` icon
- Retry button using `Button variant="outline"`

### Page Header (`src/components/common/PageHeader.tsx`)

- Eyebrow: `text-[11px] font-medium uppercase tracking-widest text-muted-foreground`
- Title: `text-2xl font-semibold tracking-tight sm:text-[28px]`
- Description: `text-sm text-muted-foreground leading-relaxed`

### Section Header (`src/components/common/SectionHeader.tsx`)

- Title: `text-sm font-semibold text-foreground`
- Description: `text-xs text-muted-foreground leading-relaxed`

### Search Bar (`src/components/common/SearchBar.tsx`)

- Search icon: `h-3.5 w-3.5` absolutely positioned left
- Input: `h-9 bg-card pl-8 pr-14 text-sm` (no `border-border` since Input handles it)
- Optional shortcut badge (`<kbd>`)

### Stat Card (`src/components/dashboard/StatCard.tsx`)

- Card with `hover:bg-card/80 hover:shadow-sm`
- Label: `text-[11px] font-medium uppercase tracking-wider`
- Value: `text-2xl font-semibold tracking-tight`
- Delta: emerald for up, muted for down

### Sidebar (`src/components/dashboard/Sidebar.tsx`)

- Width: `w-60`
- Nav items: `text-sm`, `rounded-md`, `px-3 py-1.5`
- Active: `bg-sidebar-accent text-foreground`
- Inactive: `text-muted-foreground hover:bg-sidebar-accent/60`
- Upgrade card: `rounded-lg border border-border bg-card p-3`

### Topbar (`src/components/dashboard/Topbar.tsx`)

- Sticky header: `bg-background/80 backdrop-blur-xl`
- Height: `h-14`
- User avatar: `rounded-full bg-primary text-primary-foreground` in 24x24

---

## Chart Theme (`src/components/charts/theme.ts`)

| Color | Value |
|-------|-------|
| `primary` | `oklch(0.68 0.18 268)` |
| `accent` | `oklch(0.64 0.14 230)` |
| `positive` | `oklch(0.70 0.14 175)` |
| `warning` | `oklch(0.76 0.12 90)` |
| `magenta` | `oklch(0.60 0.16 310)` |
| `grid` | `oklch(1 0 0 / 0.05)` |
| `axis` | `oklch(0.60 0.012 260)` |

Tooltip: popover-styled (`oklch(0.175 0.004 270)` background, `border: 1px solid oklch(1 0 0 / 0.06)`, 8px radius)

---

## Removed Inconsistencies

- Removed `animate-float`, `animate-pulse-glow` (gimmicky animations)
- Replaced `animate-pulse` on Skeleton with shimmer gradient sweep
- Removed heavy `bg-black/80` overlays → `bg-black/60 backdrop-blur-sm`
- Removed `bg-gradient-primary` text styling (unnecessary gradients)
- Unified card spacings to `px-6 pb-6` / `px-6 py-5` (was mixing `p-6 pt-0` and `p-6`)
- Standardized badge to `text-[11px] font-medium` with tinted backgrounds
- Removed `shadow-glow`, `shadow-card` → replaced with `shadow-sm`/`shadow-md`
- Fixed scattered `rounded-sm` close buttons → `rounded-md p-1`
- Removed double spaces in class strings
- Standardized `leading-relaxed` on all body text
- Unified transition timing to `duration-150`
- Made `placeholder:text-muted-foreground/60` consistent across inputs/textareas
- Updated button hover states to `hover:bg-accent/50` (subtler)
- Added `active:scale-[0.97]` press effect to all buttons
- Applied `.shimmer` animation to Skeleton component
- Focus rings: `focus-visible:ring-1` (was mixing ring-1 and ring-2)

---

## Usage Guidelines

### Do
- Use `surface-card` for custom card-like containers
- Use `shadow-sm` / `shadow-md` / `shadow-lg` for elevation
- Use Badge with tinted variants (`bg-primary/15 text-primary`)
- Use `leading-relaxed` on body/multiline text
- Use `transition-all duration-150` for interactive elements

### Don't
- Don't add custom gradient backgrounds or glow effects
- Don't use `animate-pulse` on skeletons (use `.shimmer`)
- Don't use `bg-black/80` for overlays (use `bg-black/60 backdrop-blur-sm`)
- Don't add new colors outside the OKLCH palette
- Don't mix border styles (always use `border-border`)
