# F0 Editorial Light — Полная документация дизайн-системы

> **Версия:** 1.0  
> **Дата:** Январь 2026  
> **Концепция:** Premium Editorial с яркими акцентами на светлом фоне

---

## 📋 Содержание

1. [Философия дизайна](#1-философия-дизайна)
2. [Цветовая палитра](#2-цветовая-палитра)
3. [Типографика](#3-типографика)
4. [Сетка и отступы](#4-сетка-и-отступы)
5. [Компоненты](#5-компоненты)
6. [Паттерны секций](#6-паттерны-секций)
7. [Анимации и Motion](#7-анимации-и-motion)
8. [Доступность](#8-доступность)
9. [CSS Variables](#9-css-variables)
10. [Примеры кода](#10-примеры-кода)

---

## 1. Философия дизайна

### Концепция
**Editorial Light (F0)** — это дизайн-система, вдохновлённая премиальными редакционными изданиями и современными tech-журналами. Ключевая идея: **типографика как главный визуальный герой**, а не декоративная графика.

### Ключевые принципы

| Принцип | Описание |
|---------|----------|
| **Воздух** | Generous whitespace, минимум визуального шума |
| **Типографика-first** | Крупные serif-заголовки как главный элемент |
| **Яркие акценты** | Сдержанный светлый фон + яркий Pink accent |
| **Структурированность** | Чёткая модульная сетка, нумерация секций |
| **Премиальность** | High-end ощущение через quality over quantity |

### Ощущение
- Чистый, светлый, профессиональный
- Элегантный, но не скучный (яркие акценты добавляют энергию)
- Доверительный и экспертный
- Современный редакционный стиль (как хороший tech-blog)

---

## 2. Цветовая палитра

### Brand Colors

```css
/* Primary Accent — Hot Pink */
--color-brand-primary: #FF006E;
--color-brand-primary-hover: #E00062;

/* Secondary Accent — Softer Pink */
--color-brand-secondary: #EC4899;
--color-brand-secondary-hover: #DB2777;
```

| Название | HEX | RGB | Использование |
|----------|-----|-----|---------------|
| **Hot Pink** | `#FF006E` | `rgb(255, 0, 110)` | CTA кнопки, ключевые акценты, точки в заголовках |
| **Pink Hover** | `#E00062` | `rgb(224, 0, 98)` | Hover состояния primary кнопок |
| **Pink Secondary** | `#EC4899` | `rgb(236, 72, 153)` | Вторичные акценты |
| **Pink Secondary Hover** | `#DB2777` | `rgb(219, 39, 119)` | Hover для вторичных элементов |

### Background Colors

```css
/* Background Scale */
--color-bg-primary: #ffffff;     /* Основной фон страницы */
--color-bg-secondary: #fafafa;   /* Альтернативные секции */
--color-bg-elevated: #f5f5f5;    /* Elevated элементы (badges, tags) */
--color-bg-card: #ffffff;        /* Карточки (с тенью) */
```

| Уровень | HEX | Использование |
|---------|-----|---------------|
| **Primary** | `#ffffff` | Основной фон страницы |
| **Secondary** | `#fafafa` (Gray-50) | Альтернирующие секции |
| **Elevated** | `#f5f5f5` (Gray-100) | Tags, badges, выделенные области |
| **Card** | `#ffffff` | Карточки (отличаются тенью, не цветом) |

### Text Colors

```css
/* Text Hierarchy */
--color-text-primary: #0a0a0a;   /* Заголовки, основной текст */
--color-text-secondary: #525252; /* Параграфы, описания */
--color-text-muted: #a3a3a3;     /* Лейблы, подписи, meta-info */
```

| Уровень | HEX | Contrast Ratio | Использование |
|---------|-----|----------------|---------------|
| **Primary** | `#0a0a0a` | 21:1 | H1-H6, важный текст |
| **Secondary** | `#525252` (Gray-600) | 7.5:1 | Body text, descriptions |
| **Muted** | `#a3a3a3` (Gray-400) | 3.1:1 | Labels, captions, meta |

### Border Colors

```css
/* Borders */
--color-border: #e5e5e5;         /* Default borders */
--color-border-hover: #d4d4d4;   /* Hover state */
--color-border-focus: #FF006E;   /* Focus state (matches brand) */
```

### Semantic Colors

```css
/* Semantic */
--color-success: #22c55e;  /* Green-500 */
--color-warning: #eab308;  /* Yellow-500 */
--color-error: #ef4444;    /* Red-500 */
```

### Special Colors

```css
/* Glow/Shadow accent */
--color-glow: rgba(255, 0, 110, 0.1);  /* Subtle pink glow for special effects */
```

---

## 3. Типографика

### Font Stack

```css
/* Fonts */
--font-heading: 'Playfair Display', Georgia, serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
```

### Font Loading (Next.js)

```tsx
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
```

### Typography Scale

#### Headings (Playfair Display)

| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing |
|-------|---------------|---------------|--------|-------------|----------------|
| **H1** | `120px` | `48px` | 700-900 | 0.85 | `-0.02em` (tight) |
| **H2** | `72px` | `36px` | 700 | 0.9 | `-0.01em` |
| **H3** | `48px` | `28px` | 600 | 1.0 | `-0.01em` |
| **H4** | `36px` | `24px` | 600 | 1.1 | Normal |
| **H5** | `24px` | `20px` | 600 | 1.2 | Normal |
| **H6** | `20px` | `18px` | 600 | 1.3 | Normal |

#### Body Text (Inter)

| Type | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| **Large Body** | `20-24px` | 400 | 1.6 | Normal |
| **Body** | `16-18px` | 400 | 1.6 | Normal |
| **Small** | `14px` | 400-500 | 1.5 | Normal |
| **Caption** | `12px` | 500 | 1.4 | `0.02em` |

#### Mono Text (JetBrains Mono)

| Type | Size | Weight | Letter Spacing | Transform |
|------|------|--------|----------------|-----------|
| **Section Label** | `12px` | 400 | `0.2em` | `uppercase` |
| **Badge/Tag** | `12px` | 400-500 | Normal | Normal |
| **Metric Value** | `24-40px` | 700 | Normal | Normal |
| **Code** | `14px` | 400 | Normal | Normal |

### Typography Patterns

#### Section Label Pattern
```html
<span class="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
  <span class="inline-block w-8 h-px bg-[var(--color-brand-primary)] mr-3"></span>
  01 — Section Name
</span>
```

#### Headline with Accent Dots
```tsx
// Точки в тексте становятся акцентными (brand color)
const headline = "Design. Build. Ship.";
headline.split("").map((char, i) => (
  <span 
    key={i}
    style={{ color: char === "." ? "var(--color-brand-primary)" : undefined }}
  >
    {char}
  </span>
));
```

---

## 4. Сетка и отступы

### Container

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;    /* 16px - mobile */
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container {
    padding-left: 1.5rem;  /* 24px - tablet */
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: 2rem;    /* 32px - desktop */
    padding-right: 2rem;
  }
}
```

### Grid System

| Breakpoint | Columns | Gap | Container Padding |
|------------|---------|-----|-------------------|
| **Mobile** (< 768px) | 1-2 | `16-24px` | `16px` |
| **Tablet** (768px - 1023px) | 2-8 | `24-32px` | `24px` |
| **Desktop** (1024px+) | 12 | `24-48px` | `32px` |

### Spacing Scale

```css
/* Spacing tokens (based on 4px grid) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-28: 112px;
--space-32: 128px;
--space-40: 160px;
```

### Section Spacing

| Section | Padding (Mobile) | Padding (Tablet) | Padding (Desktop) |
|---------|-----------------|------------------|-------------------|
| **Standard** | `64px 0` | `96px 0` | `128px 0` (`py-32`) |
| **Large** | `96px 0` | `128px 0` | `160px 0` (`py-40`) |
| **Hero** | `128px 0 96px` | `128px 0` | `128px 0` |

### Content Gaps

| Context | Gap Value | Usage |
|---------|-----------|-------|
| **Section Header → Content** | `80px - 112px` | `mb-20 lg:mb-28` |
| **Cards in Grid** | `24px - 48px` | `gap-6 lg:gap-12` |
| **List Items** | `16px - 24px` | `space-y-4 lg:space-y-6` |
| **Text Blocks** | `16px - 24px` | `mb-4 lg:mb-6` |

---

## 5. Компоненты

### 5.1 Button

#### Variants

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| **Primary** | `#FF006E` | `#ffffff` | None | `#E00062` |
| **Secondary** | Transparent | `#0a0a0a` | `#e5e5e5` | `bg-elevated` |
| **Ghost** | Transparent | `#525252` | None | `bg-elevated` |
| **Danger** | `#ef4444` | `#ffffff` | None | Darker red |

#### Sizes

| Size | Height | Padding X | Font Size | Border Radius |
|------|--------|-----------|-----------|---------------|
| **sm** | `32px` | `16px` | `14px` | `6px` |
| **md** | `40px` | `20px` | `14px` | `8px` |
| **lg** | `48px` | `24px` | `16px` | `8px` |
| **xl** | `56px` | `32px` | `16px` | `12px` |

#### States
- **Default**: Base styles
- **Hover**: `scale: 1.02`, background-color change
- **Active/Pressed**: `scale: 0.98`
- **Focus**: `outline: 2px solid brand-primary`, `outline-offset: 2px`
- **Disabled**: `opacity: 0.5`, `cursor: not-allowed`
- **Loading**: Spinner icon, disabled state

#### Code Example

```tsx
<Button 
  variant="primary" 
  size="lg"
  className="..."
>
  Start Your Project
</Button>
```

### 5.2 Card

#### Variants

| Variant | Background | Border | Shadow | Hover |
|---------|------------|--------|--------|-------|
| **Default** | `#ffffff` | `1px solid #e5e5e5` | None | - |
| **Elevated** | `#ffffff` | `1px solid #e5e5e5` | `shadow-lg` | - |
| **Interactive** | `#ffffff` | `1px solid #e5e5e5` | None | `y: -4`, border change |
| **Glass** | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.2)` | Backdrop blur | - |

#### Shadows (Light Theme)

```css
/* Light theme card shadows */
.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 
              0 1px 2px rgba(0, 0, 0, 0.06);
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
              0 2px 4px rgba(0, 0, 0, 0.06);
}
```

#### Padding
- Default: `24px` (`p-6`)
- Large: `32px` (`p-8`)
- Compact: `16px` (`p-4`)

### 5.3 Input / Form Elements

#### Base Styles

```css
input, textarea, select {
  height: 44px;  /* 11 * 4px */
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: 16px;
  transition: all 150ms;
}
```

#### States

| State | Border Color | Background | Ring |
|-------|-------------|------------|------|
| **Default** | `#e5e5e5` | `#ffffff` | None |
| **Hover** | `#d4d4d4` | `#ffffff` | None |
| **Focus** | `#FF006E` | `#ffffff` | `1px #FF006E` |
| **Error** | `#ef4444` | `#ffffff` | `1px #ef4444` |
| **Disabled** | `#e5e5e5` | `#f5f5f5` | None, `opacity: 0.5` |

### 5.4 Accordion (FAQ)

```tsx
<Accordion>
  <AccordionItem id="faq-1">
    <AccordionTrigger id="faq-1">
      Question text here
    </AccordionTrigger>
    <AccordionContent id="faq-1">
      Answer text here
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Styles
- Trigger: `font-medium`, `text-primary`, hover → `brand-primary`
- Content: `text-secondary`, `pb-4`
- Dividers: `border-b border-[var(--color-border)]`
- Icon: Chevron with rotation animation (0° → 180°)

### 5.5 Badge / Tag

```tsx
<span className="font-mono text-xs px-2 py-1 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
  React Native
</span>
```

| Property | Value |
|----------|-------|
| Font | `font-mono` (JetBrains Mono) |
| Size | `12px` |
| Padding | `4px 8px` |
| Border Radius | `4px` |
| Background | `#f5f5f5` |
| Text Color | `#a3a3a3` |

### 5.6 Duration Badge (Outlined)

```tsx
<span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]">
  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)]" />
  30 days
</span>
```

---

## 6. Паттерны секций

### 6.1 Section Header Pattern

Каждая секция начинается с унифицированного header:

```tsx
<div className="mb-20 lg:mb-28">
  {/* Section label */}
  <div className="flex items-center gap-4 mb-8">
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
      01 — Section Name
    </span>
    <div className="h-px flex-1 max-w-[80px] bg-[var(--color-border)]" />
  </div>
  
  {/* Title */}
  <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-[var(--color-text-primary)]">
    Section Title
  </h2>
  
  {/* Optional description */}
  <p className="text-lg lg:text-xl max-w-2xl leading-relaxed text-[var(--color-text-secondary)] mt-6">
    Section description text.
  </p>
</div>
```

### 6.2 Hero Section

**Layout**: 12-column grid, 8 + 4 split

```
┌──────────────────────────────────────────────────────┐
│ Container (max-width: 1280px)                        │
├────────────────────────────────┬─────────────────────┤
│ Main Content (8 cols)          │ Sidebar (4 cols)    │
│                                │                     │
│ [Label: 01 — MVP Studio]       │ [Track Record]      │
│                                │                     │
│ Design.                        │ 12+                 │
│ Build.                         │ MVPs Shipped        │
│ Ship.                          │                     │
│                                │ 30 days             │
│ Subheadline text...            │ Avg. Delivery       │
│                                │                     │
│ [CTA Button] [Link →]          │ 4.9/5               │
│                                │ Client Rating       │
│                                │                     │
│                                │ ─────────────       │
│                                │ [Trusted By logos]  │
└────────────────────────────────┴─────────────────────┘
```

**Key Elements**:
- Section label (mono, uppercase, 0.2em tracking)
- Massive serif headline (120px desktop)
- Accent dots in headline (pink color)
- Letter-by-letter animation
- Sidebar with metrics + social proof
- Border-left on sidebar (desktop)

### 6.3 Services Section

**Layout**: Full-width list с 12-column внутренней сеткой

```
┌──────────────────────────────────────────────────────┐
│ [Section Header]                                     │
├──────────────────────────────────────────────────────┤
│ ────────────────────────────────────────────────────│
│ 01 │ MVP Development    │ Description...  │ $8,000  │
│ ────────────────────────────────────────────────────│
│ 02 │ Product Design     │ Description...  │ $3,000  │
│ ────────────────────────────────────────────────────│
│ 03 │ Technical Strategy │ Description...  │ $2,000  │
│ ────────────────────────────────────────────────────│
│ 04 │ Growth Partnership │ Description...  │ $15k/mo │
│ ────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────┘
```

**Grid per row**: `1 + 3 + 5 + 3 = 12 columns`

### 6.4 Process Section (Timeline)

**Layout**: 4-column grid с horizontal timeline

```
Desktop:
    ●───────────●───────────●───────────●  ← Animated line
    │           │           │           │
┌───┴───┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐
│  01   │   │  02   │   │  03   │   │  04   │
│       │   │       │   │       │   │       │
│Discover│   │Design │   │Build  │   │Launch │
│       │   │       │   │       │   │       │
│ 3 days│   │ 5 days│   │18 days│   │ 4 days│
└───────┘   └───────┘   └───────┘   └───────┘
```

**Key Features**:
- Horizontal animated progress line (scroll-linked)
- Circle indicators at each step
- Big muted numbers (01-04)
- Duration badges (outlined)
- Summary at bottom: "30 Days" total

### 6.5 Case Studies Section

**Layout**: Alternating 7 + 5 / 5 + 7 columns

```
┌──────────────────────────────────────────────────────┐
│ [Section Header]                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌─────────────────────┐  │  Year: 2024              │
│ │                     │  │  FinFlow                 │
│ │   Gradient Cover    │  │  Personal Finance        │
│ │   with "F" letter   │  │                          │
│ │                     │  │  Description...          │
│ └─────────────────────┘  │  [Tags: React, Node...]  │
│         7 cols           │  ────────────────────    │
│                          │  28 days    15K+ users   │
│                          │        5 cols            │
├──────────────────────────┴───────────────────────────┤
│                                                      │
│  Year: 2024             │  ┌─────────────────────┐  │
│  TaskHero               │  │                     │  │
│  Team Collaboration     │  │   Gradient Cover    │  │
│                         │  │   with "T" letter   │  │
│  Description...         │  │                     │  │
│  [Tags: Next.js, AI...] │  └─────────────────────┘  │
│  ────────────────────   │         7 cols            │
│  32 days    500+ teams  │                          │
│        5 cols           │                          │
└──────────────────────────────────────────────────────┘
```

**Cover Card Features**:
- Gradient background (per-project unique)
- Large initial letter (60-80% opacity white)
- Hover scale: 1.02
- "View Project →" on hover

---

## 7. Анимации и Motion

### Timing Functions

```css
/* Transitions */
--transition-fast: 150ms;
--transition-normal: 250ms;
--transition-slow: 600ms;

/* Easing */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Patterns

#### 1. Fade In + Slide Up (Default)

```tsx
const fadeInVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
```

#### 2. Letter-by-Letter (Hero Headlines)

```tsx
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,  // 80ms between letters
      delayChildren: 0.3,
    },
  },
};

const letterVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
```

#### 3. Stagger Container (Lists, Grids)

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,  // 100ms between items
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
```

#### 4. Scroll-Linked (Progress Line)

```tsx
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end start"],
});

const lineWidth = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);
```

### Hover Animations

| Element | Transform | Duration |
|---------|-----------|----------|
| **Button** | `scale: 1.02` | 150ms |
| **Button (pressed)** | `scale: 0.98` | 100ms |
| **Card (interactive)** | `y: -4` | 200ms |
| **Case Study Cover** | `scale: 1.02` | 400ms |
| **Arrow Icon** | `x: 4` | 200ms |

### Viewport Triggers

```tsx
// Standard viewport trigger
whileInView="visible"
viewport={{ once: true, margin: "-100px" }}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Доступность

### Color Contrast

| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| Primary Text | `#0a0a0a` | `#ffffff` | 21:1 | ✅ AAA |
| Secondary Text | `#525252` | `#ffffff` | 7.5:1 | ✅ AAA |
| Muted Text | `#a3a3a3` | `#ffffff` | 3.1:1 | ⚠️ Large text only |
| Pink on White | `#FF006E` | `#ffffff` | 4.5:1 | ✅ AA |

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}
```

### ARIA Attributes

```tsx
// Button
<button
  aria-label="Description"
  aria-pressed={isActive}
  disabled={isDisabled}
/>

// Accordion
<button
  aria-expanded={isOpen}
  aria-controls={`accordion-content-${id}`}
/>
<div id={`accordion-content-${id}`} role="region" />

// Input
<input
  aria-invalid={!!error}
  aria-describedby={error ? `${id}-error` : undefined}
/>
```

### Keyboard Navigation

- All interactive elements focusable via `Tab`
- Escape closes modals/menus
- Enter/Space activates buttons
- Arrow keys for navigation in menus

---

## 9. CSS Variables

### Complete Variables List

```css
:root {
  /* Brand */
  --color-brand-primary: #FF006E;
  --color-brand-primary-hover: #E00062;
  --color-brand-secondary: #EC4899;
  --color-brand-secondary-hover: #DB2777;
  
  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-bg-elevated: #f5f5f5;
  --color-bg-card: #ffffff;
  
  /* Text */
  --color-text-primary: #0a0a0a;
  --color-text-secondary: #525252;
  --color-text-muted: #a3a3a3;
  
  /* Border */
  --color-border: #e5e5e5;
  --color-border-hover: #d4d4d4;
  --color-border-focus: #FF006E;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  
  /* Special */
  --color-glow: rgba(255, 0, 110, 0.1);
  
  /* Typography */
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 600ms;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

### Applying Variables

```tsx
// Inline styles
<div style={{ backgroundColor: "var(--color-bg-primary)" }} />

// Tailwind-like classes
<div className="bg-[var(--color-bg-primary)]" />

// CSS
.element {
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
```

---

## 10. Примеры кода

### Section Header Component

```tsx
interface SectionHeaderProps {
  number: string;
  label: string;
  title: string;
  description?: string;
}

export function SectionHeader({ number, label, title, description }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-20 lg:mb-28"
    >
      <div className="flex items-center gap-4 mb-8">
        <span 
          className="font-mono text-xs uppercase tracking-[0.2em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {number} — {label}
        </span>
        <div 
          className="h-px flex-1 max-w-[80px]"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>
      <h2 
        className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h2>
      {description && (
        <p 
          className="text-lg lg:text-xl max-w-2xl leading-relaxed mt-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
```

### Metric Card Component

```tsx
interface MetricProps {
  value: string;
  label: string;
  useMono?: boolean;
}

export function Metric({ value, label, useMono = true }: MetricProps) {
  return (
    <div className="group">
      <div 
        className={`text-3xl lg:text-4xl font-bold mb-1 ${useMono ? "font-mono" : "font-heading"}`}
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </div>
      <div 
        className="text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </div>
    </div>
  );
}
```

### Service Row Component

```tsx
interface ServiceRowProps {
  number: string;
  title: string;
  description: string;
  deliverables: string[];
  price?: string;
}

export function ServiceRow({ number, title, description, deliverables, price }: ServiceRowProps) {
  return (
    <article 
      className="group border-b py-12 lg:py-16"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Number */}
        <div className="lg:col-span-1">
          <span 
            className="font-mono text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            {number}
          </span>
        </div>

        {/* Title */}
        <div className="lg:col-span-3">
          <h3 
            className="font-heading text-2xl lg:text-3xl tracking-tight group-hover:text-[var(--color-brand-primary)] transition-colors"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h3>
        </div>

        {/* Description & Tags */}
        <div className="lg:col-span-5">
          <p 
            className="text-base lg:text-lg leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {description}
          </p>
          <div className="flex flex-wrap gap-2">
            {deliverables.map((item) => (
              <span
                key={item}
                className="font-mono text-xs px-2 py-1 rounded"
                style={{ 
                  backgroundColor: "var(--color-bg-elevated)",
                  color: "var(--color-text-muted)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="lg:col-span-3 lg:text-right">
          {price && (
            <div>
              <span 
                className="block font-mono text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Starting at
              </span>
              <span 
                className="font-mono text-xl lg:text-2xl font-bold"
                style={{ color: "var(--color-brand-primary)" }}
              >
                {price}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
```

---

## Чеклист для применения в другом проекте

### Подготовка
- [ ] Установить шрифты (Playfair Display, Inter, JetBrains Mono)
- [ ] Настроить CSS Variables
- [ ] Создать utility классы (`.font-heading`, `.font-mono`)

### Компоненты
- [ ] Button (4 варианта, 4 размера)
- [ ] Card (4 варианта)
- [ ] Input / Textarea / Select
- [ ] Accordion

### Секции
- [ ] Section Header pattern
- [ ] Hero с sidebar metrics
- [ ] Services list
- [ ] Process timeline
- [ ] Case Studies grid

### Motion
- [ ] Framer Motion variants
- [ ] Scroll-linked animations
- [ ] Hover states
- [ ] Reduced motion support

### Качество
- [ ] Contrast ratio проверка
- [ ] Focus states
- [ ] ARIA attributes
- [ ] Responsive breakpoints

---

## Заключение

F0 Editorial Light — это сбалансированная дизайн-система, которая сочетает:
- **Премиальную типографику** (Playfair Display serif)
- **Чистый светлый фон** с максимальным контрастом
- **Яркие Pink акценты** для CTA и выделения
- **Структурированную сетку** с generous whitespace
- **Refined animations** через Framer Motion

При переносе на другой проект ключевое — сохранить баланс между минимализмом фона и яркостью акцентов, а также следовать установленным типографическим паттернам.

