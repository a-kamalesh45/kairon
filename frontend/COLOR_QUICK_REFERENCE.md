# KAIRON Color Quick Reference

> **Institutional Trading Terminal Palette**  
> Cold. Focused. Unforgiving.

---

## 🎨 Color Tokens at a Glance

### Backgrounds
```css
#000000  --color-bg-app        /* Main background */
#0A0B0D  --color-bg-panel      /* Panels, cards */
#12141A  --color-bg-hover      /* Hover states */
#1A1C23  --color-bg-elevated   /* Modals, dropdowns */
```

### Text (White → Gray Gradient)
```css
#FFFFFF  --color-text-primary    /* Prices, headers */
#B4BCC8  --color-text-secondary  /* Labels, metadata */
#6B7280  --color-text-tertiary   /* Timestamps, IDs */
#3F4449  --color-text-disabled   /* Inactive elements */
```

### Accent (Cyan - Use Sparingly!)
```css
#00D9E8  --color-accent-primary       /* CTAs, active states */
#00B8CC  --color-accent-primary-hover /* Hover */
#004D55  --color-accent-primary-muted /* Disabled */
```

### P&L (Analytical, Not Emotional)
```css
#00C896  --color-success     /* Gains (cyan-tinted green) */
#002820  --color-success-bg  /* Success background */
#D63031  --color-danger      /* Losses (deep red) */
#2A1416  --color-danger-bg   /* Danger background */
```

### Borders
```css
#1F2128  --color-border        /* Default */
#2A2D38  --color-border-hover  /* Interactive */
#00D9E8  --color-border-focus  /* Focus (cyan) */
```

---

## 🚦 When to Use Cyan

### ✅ DO Use Cyan For:
- Primary CTAs ("Launch Terminal", "Trade Now")
- Active tabs or filters
- Live indicators (connection status, real-time price pings)
- Focus states (form inputs)
- Important status messages

### ❌ DON'T Use Cyan For:
- Decorative dividers
- Passive UI elements
- Generic text labels
- Background accents
- Anything not signaling action or importance

**Rule of Thumb:** If it's not clickable, active, or live, it shouldn't be cyan.

---

## 📊 Text Hierarchy Rules

| Priority | Color | When to Use | Example |
|----------|-------|-------------|---------|
| **P1** | White (`#FFFFFF`) | Critical data | `$88,077.50` |
| **P2** | Light Gray (`#B4BCC8`) | Supporting info | `"Last Price"` |
| **P3** | Mid Gray (`#6B7280`) | Metadata | `"2s ago"` |
| **P4** | Dark Gray (`#3F4449`) | Disabled | `"Unavailable"` |

**Principle:** The more important the data, the whiter the text.

---

## 🔨 Tailwind Classes (Quick Copy-Paste)

### Backgrounds
```html
<div class="bg-theme-app">        <!-- Main background -->
<div class="bg-theme-panel">      <!-- Panel background -->
<div class="bg-theme-hover">      <!-- Hover state -->
<div class="bg-theme-elevated">   <!-- Modal/dropdown -->
```

### Text
```html
<h1 class="text-theme-primary">     <!-- Critical data -->
<p class="text-theme-secondary">    <!-- Labels -->
<span class="text-theme-tertiary">  <!-- Metadata -->
<span class="text-theme-disabled">  <!-- Inactive -->
```

### Accent
```html
<button class="bg-theme-accent text-black">   <!-- Primary CTA -->
<a class="text-theme-accent">                 <!-- Accent text link -->
<div class="border-theme-accent">             <!-- Accent border -->
```

### P&L
```html
<span class="text-theme-success">   <!-- +2.34% -->
<span class="text-theme-danger">    <!-- -1.12% -->
<div class="bg-theme-success">      <!-- Success background -->
<div class="bg-theme-danger">       <!-- Danger background -->
```

### Borders
```html
<div class="border border-theme">         <!-- Default -->
<div class="border border-theme-hover">   <!-- Interactive -->
<input class="border border-theme-focus"> <!-- Focus -->
```

---

## 🎯 Common Patterns

### Primary CTA Button
```tsx
<button className="bg-theme-accent text-black font-bold px-6 py-3 rounded hover:bg-theme-accent-hover transition-colors">
  Launch Terminal
</button>
```

### Secondary Button
```tsx
<button className="bg-theme-panel text-theme-secondary border border-theme hover:bg-theme-hover hover:text-theme-primary transition-colors">
  Initialize Session
</button>
```

### Active Tab
```tsx
<button className={`px-4 py-2 ${active ? 'text-theme-accent border-b-2 border-theme-accent' : 'text-theme-secondary'}`}>
  Chart
</button>
```

### P&L Indicator
```tsx
<span className={`font-mono ${change > 0 ? 'text-theme-success' : 'text-theme-danger'}`}>
  {change > 0 ? '+' : ''}{change.toFixed(2)}%
</span>
```

### Card with Hover
```tsx
<div className="bg-theme-panel border border-theme hover:border-theme-hover transition-colors p-6 rounded">
  {/* Content */}
</div>
```

### Live Status Indicator
```tsx
<div className="flex items-center gap-2">
  <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
  <span className="text-theme-tertiary text-xs">SYSTEM ONLINE</span>
</div>
```

---

## ⚠️ Common Mistakes

### ❌ Mistake: Using hardcoded colors
```tsx
<div className="bg-black text-white border-gray-800">
```

### ✅ Correct: Using theme tokens
```tsx
<div className="bg-theme-app text-theme-primary border-theme">
```

---

### ❌ Mistake: Cyan everywhere
```tsx
<div className="border-l-2 border-[#00E5FF]"> <!-- Decorative -->
<p className="text-[#00E5FF]">Volume</p>      <!-- Label -->
```

### ✅ Correct: Cyan only for action/active
```tsx
<div className="border-l-2 border-theme">          <!-- Decorative -->
<p className="text-theme-secondary">Volume</p>     <!-- Label -->
<button className="bg-theme-accent">Trade</button> <!-- CTA -->
```

---

### ❌ Mistake: No text hierarchy
```tsx
<div className="text-white">Price: $88,077.50 (2s ago)</div>
```

### ✅ Correct: Clear hierarchy
```tsx
<div>
  <span className="text-theme-secondary">Price: </span>
  <span className="text-theme-primary">$88,077.50</span>
  <span className="text-theme-tertiary"> (2s ago)</span>
</div>
```

---

## 🔍 Visual Debugging

**Not sure which color tier to use?** Ask yourself:

1. **Is this the most important data on the screen?**  
   → Yes: `text-theme-primary` (White)

2. **Is this a label or supporting info?**  
   → Yes: `text-theme-secondary` (Light Gray)

3. **Is this metadata, timestamp, or ID?**  
   → Yes: `text-theme-tertiary` (Mid Gray)

4. **Is this inactive or disabled?**  
   → Yes: `text-theme-disabled` (Dark Gray)

**For cyan:** Is this an action button or active state?  
→ Yes: Use cyan  
→ No: Don't use cyan

---

## 📖 Full Documentation

- **Comprehensive Guide:** [COLOR_SYSTEM.md](./COLOR_SYSTEM.md)
- **Before/After Analysis:** [COLOR_REFINEMENT.md](./COLOR_REFINEMENT.md)
- **Source Code:** [globals.css](./app/globals.css)

---

**Last Updated:** February 1, 2026  
**System Status:** ✅ Fully Implemented
