# UI/UX & Design System Guide: Hicejo

This document defines the brand identity, design tokens, spacing rules, motion directives, and component patterns for Hicejo to ensure a premium, modern, and accessible software product.

---

## 1. Brand Identity & Design Philosophy

### Brand Personality
* **Premium & Sophisticated**: Elite startup feel; polished, clean, and intentional.
* **Intelligent & Helpful**: Smooth assistance from AI without being distracting.
* **Calm & Confident**: Minimalist aesthetics using lots of white space to ease job-seeking anxiety.

### Design Philosophy
Our goal is to create a sleek dashboard that feels organic, responsive, and incredibly fast. We rely on high contrast, consistent visual hierarchy, large modern typography, soft drop-shadows, and micro-animations to highlight key interactions.

---

## 2. Design Tokens & Color Palette

We implement a sophisticated dark-mode-first system. The color palette focuses on deep slates, cool greys, and luminous neon accents to signify interactive states.

### Core CSS Variables (Tailwind Configuration)

```css
:root {
  /* Slate/Neutral Scale */
  --background: 220 33% 98%;      /* Very light cool grey */
  --foreground: 224 71.4% 4.1%;   /* Dark grey-slate */
  
  --card: 0 0% 100%;
  --card-foreground: 224 71.4% 4.1%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 224 71.4% 4.1%;
  
  /* Primary Accent: Deep Violet Indigo */
  --primary: 263.4 70% 50.4%;
  --primary-foreground: 210 20% 98%;
  
  /* Secondary Accent: Luminous Teal */
  --secondary: 173.4 80% 40%;
  --secondary-foreground: 224 71.4% 4.1%;
  
  --muted: 220 14.3% 95.9%;
  --muted-foreground: 220 8.9% 46.1%;
  
  --accent: 262.2 47% 95%;
  --accent-foreground: 263.4 70% 50.4%;
  
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 20% 98%;
  
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 262.2 80% 50.4%;
  
  --radius: 0.75rem; /* 12px rounded corners */
}

.dark {
  /* Premium Dark Mode Slate */
  --background: 224 71.4% 4.1%;   /* Deep cosmic grey */
  --foreground: 210 20% 98%;       /* Soft white */
  
  --card: 224 71.4% 6%;
  --card-foreground: 210 20% 98%;
  
  --popover: 224 71.4% 6%;
  --popover-foreground: 210 20% 98%;
  
  /* Primary Accent: Electrifying Purple-Indigo */
  --primary: 263.4 90% 60%;
  --primary-foreground: 210 20% 98%;
  
  /* Secondary Accent: Vibrant Mint Teal */
  --secondary: 172.4 90% 55%;
  --secondary-foreground: 224 71.4% 4.1%;
  
  --muted: 224 71.4% 12%;
  --muted-foreground: 215.4 16.3% 70%;
  
  --accent: 262.2 80% 15%;
  --accent-foreground: 210 20% 98%;
  
  --border: 224 71.4% 16%;
  --input: 224 71.4% 16%;
  --ring: 263.4 90% 60%;
}
```

---

## 3. Typography & Grids

### Typography
We use **Inter** or **Outfit** as our main typeface via `next/font`.
* **Headings (`h1`, `h2`, `h3`)**: Large, bold, wide tracking. High contrast contrast. Font weight `700` or `800`.
* **Subtitles**: Muted colors (`--muted-foreground`), medium weight (`500`).
* **Body text**: Font weight `400` or `500`, tracking normal, line-height 1.6 for enhanced reading comfort.

### Grids & Spacing
We adhere strictly to an **8px spacing grid** (`space-y-2`, `space-y-4`, `space-y-8`, `p-4`, `p-6`, `p-8` in Tailwind CSS).
* **Page Layouts**: 12-column grid system on desktop, collapsing to 4-column on tablet and 1-column on mobile devices.
* **Content Width**: Max width is restricted to `1400px` (`max-w-7xl` in Tailwind) to prevent layout bloating on ultra-wide screens.

---

## 4. UI Component Guidelines

### Buttons
Buttons must feel clicky and tactile. They should feature subtle micro-hover scaling and slight shadow transformations:
* **Primary**: Filled with `--primary` gradient, white text. Hover scales by `1.02` with an expanded glow shadow.
* **Secondary**: Outlined border with `--border`. Hover scales down/up slightly and highlights background.
* **Destructive**: Filled with `--destructive`. Used specifically for data deletion.

### Cards
* Rounded borders (`rounded-xl` / `12px`).
* Solid clean backgrounds (`bg-card`) with a thin border (`border-border`).
* No heavy drop shadows. Hover states use a delicate lift (`-translate-y-1`) accompanied by a soft colored border match.

### Inputs & Forms
* Minimalist forms. Focus styles highlight borders with `--ring` using an outline offset of `0px` and no default browser glow.
* Real-time field validation with slide-down error blocks (`text-destructive`).

---

## 5. Motion Guidelines (Framer Motion)

Animations should feel snappy and deliberate. Avoid long durations; aim for **150ms to 300ms** curves.

### Standard Framer Motion Presets

```typescript
// Smooth Spring fade-in for page transitions
export const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2, ease: "easeInOut" }
};

// Subtle hover scale-up for interactive elements
export const HOVER_SCALE = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 15 }
};

// Layout animation presets
export const LAYOUT_TRANSITION = {
  layout: true,
  transition: { type: "spring", stiffness: 350, damping: 25 }
};
```

---

## 6. Loading States, Empty States, & Accessibility

### Loading States
* Use modern, shimmering skeleton loaders matching the exact card/form shapes instead of basic loading spinners.
* The shimmer should be a subtle gradient from `--background` to `--muted` and back.

### Empty States
* Minimalist illustrations created using vector paths.
* A clear, secondary call-to-action button (e.g., "Create your first resume draft" or "Upload PDF to begin").

### Accessibility (a11y)
* Contrast ratios must respect WCAG AAA guidelines (at least 4.5:1 for body copy).
* Keyboard navigability (use proper focus-visible rings).
* Correct ARIA attributes (`aria-expanded`, `aria-label`, `aria-describedby`) for custom dashboard overlays and dialog portals.
