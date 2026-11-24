---
name: Optical Atelier
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#564338'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#897267'
  outline-variant: '#ddc1b3'
  surface-tint: '#9b4500'
  primary: '#903f00'
  on-primary: '#ffffff'
  primary-container: '#b45309'
  on-primary-container: '#fff1eb'
  inverse-primary: '#ffb68e'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#5c5651'
  on-tertiary: '#ffffff'
  tertiary-container: '#756e69'
  on-tertiary-container: '#fcf2ec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb68e'
  on-primary-fixed: '#331200'
  on-primary-fixed-variant: '#763300'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#eae1da'
  tertiary-fixed-dim: '#cec5bf'
  on-tertiary-fixed: '#1f1b17'
  on-tertiary-fixed-variant: '#4b4641'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display:
    fontFamily: EB Garamond
    fontSize: 3.5rem
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: EB Garamond
    fontSize: 2.25rem
    fontWeight: '400'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 2.5rem
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 1.75rem
    fontWeight: '400'
    lineHeight: '1.25'
    letterSpacing: 0em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 1.75rem
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0em
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 1.25rem
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: '1.55'
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.04em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the intimacy, precision, and craftsmanship of a bespoke optical atelier. Merging classical editorial typography with modernist minimal discipline, the interface mirrors the experience of handling finely crafted spectacle frames: weightless, intentional, and perfectly proportioned.

The visual approach leverages a stark, pure-white foundation paired with deep ink-black text to deliver high-contrast legibility reminiscent of printed luxury lookbooks. Subtle amber accents evoke tortoiseshell acetate, vintage brass hardware, and warm studio lighting, offering discerning focal points without overwhelming the product showcase. 

The aesthetic sits at the intersection of haute editorial minimalism and architectural precision. Expansive whitespace, quiet border lines, and seamless pill-shaped controls establish an understated luxury that elevates eyeglasses from medical utility to essential personal adornment.

## Colors

The palette relies on pure white (`#FFFFFF`) as the foundational canvas, establishing uncompromised clarity and high dynamic range. 

- **Primary (`#B45309`)**: A refined amber-gold drawn from hand-polished tortoiseshell and vintage hinge rivets. Used sparingly for curated badging, active states, key conversion triggers, and focused highlights.
- **Secondary (`#111827`)**: Deep ink black. Provides maximum typographical contrast, anchoring structural dividers and foundational interactive elements such as primary pill actions.
- **Tertiary (`#78716C`)**: Warm taupe-gray. Used for secondary metadata, frame dimension specs, and understated supporting icons.
- **Neutral Surface Palette**: Warm white and soft alabaster tiers (`#F9FAFB`, `#F3F4F6`, `#E5E7EB`, `#D1D5DB`) provide quiet framing for product photography, modular spec panels, and input boundaries.

Never use pure black (`#000000`) for text. The deep ink black (`#111827`) provides high contrast without harsh digital fatigue.

## Typography

The typographic hierarchy pairs the literary grace of **EB Garamond** with the technical clarity of **Hanken Grotesk**.

- **EB Garamond** directs primary visual anchors, collection titles, and editorial narratives. It lends the gravitas of bespoke optical history and intellectual composure. It is rendered at medium to light weights with tight line heights to maintain an editorial tone.
- **Hanken Grotesk** handles functional UI layers: optical metrics (bridge width, temple length, lens diameter), form inputs, interactive triggers, and body prose. Its contemporary neutral geometry ensures readability across optical specifications and complex prescription builder workflows.
- **Micro-labels and badging** apply uppercase tracking (`letterSpacing: 0.06em` to `0.08em`) in Hanken Grotesk to mimic precision engineering stamps found inside spectacle temples.

## Layout & Spacing

The layout employs a responsive 12-column fluid grid on desktop (8-column on tablet, 4-column on mobile) with generous perimeter margins that frame the viewport like a gallery matboard.

- **Breakpoints**: Mobile (0–639px), Tablet (640–1023px), Desktop (1024px+), Wide Display (1440px+).
- **Rhythm**: Vertical rhythm follows an 8px base increment. Grid gutters expand from `1.5rem` on mobile/tablet to `2rem` on desktop to allow high-resolution silhouette cutouts of frames to breathe.
- **Containment**: Product showcases use generous vertical padding (`space-xl` and higher) to preserve an airy, boutique atmosphere where frames are displayed as individual sculptures rather than stacked inventory.

## Elevation & Depth

This system avoids heavy drop shadows and dramatic skeuomorphism in favor of structural clarity:

- **Surface Layers**: Subtle contrast shifts between `#FFFFFF` and neutral tint `#F9FAFB` create separation without elevation breaks.
- **Low-Contrast Hairlines**: Divisions rely on razor-thin 1px borders in `#E5E7EB` or `#F3F4F6`.
- **Atmospheric Floating Depth**: Hovered cards, floating quick-cart draws, and prescription tooltips employ a single diffused ambient shadow: `0 12px 32px -8px rgba(17, 24, 39, 0.06)`. This mimics soft, overhead diffuse studio daylight rather than artificial directional lighting.
- **Optical Lens Reflection**: Subtle overlays for lens visualization use ultra-thin borders with low-opacity white-to-amber gradients (`rgba(180, 83, 9, 0.08)` to `transparent`) to signify polished acetate and anti-reflective lens coatings.

## Shapes

The geometric signature is defined by level 3 roundedness, creating full-pill shapes across primary and secondary controls:

- **Buttons, badges, and chips** use complete circular ends (`border-radius: 9999px` or minimum `1rem`), echoing the curvature of eyewear rims and rounded lenses.
- **Cards and modular containers** adopt a softer, controlled radius (`rounded-lg` at 1.5rem to 2rem) to hold high-resolution imagery securely while maintaining organic softness.
- **Text inputs and search bars** adhere to clean pill silhouettes, reinforcing tactile continuity across both discovery and checkout flows.

## Components

### Buttons
- **Primary**: Full pill silhouette. Background `#111827`, text `#FFFFFF`. On hover, transitions cleanly to `#000000` with subtle ambient lift.
- **Accent Primary**: Full pill silhouette. Background `#B45309`, text `#FFFFFF`. Reserved for final prescription confirmation and "Book Optical Consultation."
- **Secondary / Outlined**: Full pill silhouette. Transparent background with 1px border `#E5E7EB`, text `#111827`. On hover, background shifts to `#F9FAFB` and border shifts to `#111827`.

### Product Cards
- Built on a clean `#FFFFFF` ground with an optional `#F9FAFB` image reservoir.
- Hairline border `#F3F4F6` that deepens to `#E5E7EB` on hover.
- Includes integrated top-tier metadata: Frame model in `headline-sm` (EB Garamond), optical sizing (e.g., `49-20-145`) in `label-sm` (Hanken Grotesk).
- Dedicated frame swatch pills at the bottom allow inline material previews (e.g., Japanese Titanium, Champagne Acetate, Vintage Tortoise).

### Wishlist Micro-Interaction
- Positioned floating at the top-right corner of the product card inside a 36px circular button (`#FFFFFF` with 1px border `#E5E7EB`).
- Heart icon rendered in stroke `#111827`.
- **Interaction**: On tap/click, the stroke scales slightly (1.15x), fills instantly with `#B45309`, and settles back with a smooth mechanical ease, accompanied by an ultra-subtle amber pulse halo.

### Badge Tags
- Full pill tags with internal padding `0.25rem 0.75rem`.
- **Editorial / New**: Background `#F9FAFB`, text `#111827`, hairline border `#E5E7EB`.
- **Atelier Exclusive**: Background `rgba(180, 83, 9, 0.08)`, text `#B45309`, border `1px solid rgba(180, 83, 9, 0.2)`.

### Form Inputs & Prescription Selectors
- **Input Fields**: Full pill container, 1px border `#E5E7EB`, background `#FFFFFF`, text `#111827` using `body-md`. Focus state tightens to 1px border `#111827` with no offset ring.
- **Prescription Segmented Controls**: Pill-shaped horizontal selector rail (`#F3F4F6`), containing sliding pill segments (`#FFFFFF` with subtle shadow) indicating SPH, CYL, AXIS, and ADD optical values.

### Checkboxes & Radio Buttons
- **Radio Buttons**: Concentric circles. Outer ring 20px, unselected `#E5E7EB`, selected `#111827` enclosing a 10px `#111827` center point or `#B45309` for custom lens tints.
- **Checkboxes**: 20px rounded squares (`rounded-sm` at 4px) with crisp 1.5px ink checks, pairing architectural restraint with precision feedback.