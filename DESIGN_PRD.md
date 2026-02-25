# Frontend Redesign PRD - Automator AI Agency Dashboard

## 1. Design Philosophy

### Core Identity
- **Vibe**: Cyberpunk meets enterprise SaaS. Think "mission control for AI agents"
- **Personality**: Bold, confident, precise. Not another cookie-carter dashboard
- **Differentiation**: We don't want to look like every other Tailwind dashboard. We want to look like a product that powers AI.

### Visual Language

#### Color Palette (High Contrast Dark Theme)
```css
--bg-void: #030303        /* Deepest black - main background */
--bg-surface: #0A0A0B     /* Card backgrounds */
--bg-elevated: #111113    /* Hover states, elevated surfaces */
--bg-tertiary: #18181B    /* Secondary surfaces */

--border-subtle: #1F1F23  /* Subtle borders */
--border-default: #27272A  /* Default borders */
--border-accent: #3F3F46  /* Emphasized borders */

--text-primary: #FAFAFA   /* Primary text - nearly white */
--text-secondary: #A1A1AA  /* Secondary text */
--text-tertiary: #71717A  /* Muted text */

--accent-cyan: #22D3EE    /* Primary accent - electric cyan */
--accent-cyan-dim: #0891B2 /* Cyan hover */
--accent-magenta: #E879F9 /* Secondary accent - hot magenta */
--accent-lime: #A3E635    /* Success/positive */
--accent-amber: #FBBF24    /* Warning */
--accent-red: #EF4444      /* Error/destructive */

--glow-cyan: 0 0 20px rgba(34, 211, 238, 0.3)
--glow-magenta: 0 0 20px rgba(232, 121, 249, 0.3)
```

#### Typography
- **Headings**: "JetBrains Mono" - monospace, techy, distinctive
- **Body**: "IBM Plex Sans" - clean, technical, highly readable
- **Numbers/Data**: "JetBrains Mono" - consistent width, great for stats
- **Scale**: 
  - H1: 48px / 600
  - H2: 32px / 600
  - H3: 24px / 600
  - Body: 15px / 400
  - Small: 13px / 400

#### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

#### Visual Effects
- **Cards**: Subtle gradient borders (top edge glow), 1px border
- **Shadows**: Minimal, use glow effects instead
- **Animations**: 
  - Micro-interactions: 150ms ease-out
  - Page transitions: 300ms ease-in-out
  - Hover lifts: translateY(-2px)
- **Gradients**: Subtle mesh gradients on key elements
- **Noise texture**: Very subtle grain overlay on backgrounds

---

## 2. Layout Architecture

### Global Layout
```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR (fixed, h: 64px)                                   │
│  [Logo] [Nav Links] [Status Indicator] [User Avatar]       │
├──────────┬──────────────────────────────────────────────────┤
│ SIDEBAR  │  MAIN CONTENT AREA                              │
│ (w:240px)│  (scrollable, padded 32px)                      │
│          │                                                  │
│ Nav      │  ┌─────────────────────────────────────────┐   │
│ Items    │  │  Page Header                            │   │
│          │  ├─────────────────────────────────────────┤   │
│          │  │                                         │   │
│          │  │  Content                                │   │
│          │  │                                         │   │
│          │  └─────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: < 640px (sidebar hidden, hamburger menu)
- **Tablet**: 640px - 1024px (collapsed sidebar, icons only)
- **Desktop**: > 1024px (full sidebar)

---

## 3. Page Specifications

### 3.1 Landing Page (`/`)

#### Hero Section
- Full viewport height (100vh - header)
- Animated grid background (subtle moving grid lines)
- Large headline with gradient text (cyan → magenta)
- Subheadline in secondary text color
- CTA buttons with glow effects on hover
- Floating AI visualization (animated orbs/dots)

#### Stats Section
- Horizontal scroll on mobile
- 4 large stat cards with:
  - Large number (JetBrains Mono, 48px)
  - Label below (13px, uppercase, tracking-wide)
  - Subtle animated gradient border on hover
  - Icon with glow effect

#### Features Grid
- 3-column grid (responsive to 1 column on mobile)
- Each card:
  - Icon with gradient background
  - Title (20px, semibold)
  - Description (15px, secondary color)
  - Hover: border glow effect

#### Trust/Privacy Section
- Two-column layout
- Left: Privacy badge icons
- Right: CTA buttons

#### Footer
- Minimal, single line
- Links: Privacy Policy, Terms, Contact

### 3.2 Dashboard (`/dashboard`)

#### Header
- Page title: "Mission Control" (not "Dashboard")
- Breadcrumb: Home / Dashboard
- Quick stats row (optional, mini cards)

#### Analytics Grid (Top)
- 4 stat cards in a row:
  1. Messages (24h) - cyan accent
  2. Active Leads - magenta accent  
  3. Token Usage - lime accent
  4. Conversion - amber accent
- Each card:
  - Large number with trend indicator (↑↓)
  - Sparkline chart (mini, last 7 days)
  - Percentage change from yesterday
  - Subtle animated border on hover

#### Main Chart
- Full-width card
- Title: "Traffic Overview"
- Recharts line chart with:
  - Gradient fill under lines
  - Custom tooltip (dark, rounded)
  - Legend at bottom
  - X-axis: dates, Y-axis: message count
  - Two lines: Facebook (cyan), Instagram (magenta)

#### Recent Activity Feed
- Right sidebar or bottom section
- List of recent messages:
  - Avatar (initials)
  - Sender ID (truncated)
  - Preview text
  - Timestamp
  - Status badge

### 3.3 Chat Monitor (`/dashboard/chats`)

#### Layout: Split View
- Left panel (320px): Conversation list
- Right panel (flex): Chat window

#### Conversation List (Left)
- Search bar at top with icon
- Filter tabs: All | Active | New
- Conversation items:
  - Avatar (colored circle with initials)
  - Sender ID (bold, 14px)
  - Last message preview (truncated, 13px, secondary)
  - Timestamp (right-aligned, 12px)
  - Unread indicator (cyan dot)
  - Status badge (colored pill)
- Hover: background shift, subtle border glow
- Active: cyan left border, elevated background

#### Chat Window (Right)
- Header bar:
  - Recipient name/ID
  - Platform icon (FB/IG)
  - Status indicator (online/offline)
  - Actions: Mute, Archive (icons)

- Messages area:
  - Scrollable, flex-grow
  - User messages: right-aligned, magenta background
  - AI messages: left-aligned, surface background
  - Each message:
    - Message bubble (rounded corners, 12px radius)
    - Timestamp below (small, muted)
    - Delivery status (sent/delivered/read)
  - Typing indicator animation

- Input area (bottom):
  - Text input with placeholder
  - Send button (cyan, icon)
  - Character count

### 3.4 Configs (`/dashboard/configs`)

#### Page Title
- "Bot Configurations" or "Neural Networks"
- Subtitle: "Manage your AI agents"

#### Config Cards
- Grid layout (responsive)
- Each card represents one bot/page:
  - Header: Page name + status toggle
  - Status: Active (green glow) / Inactive (dim)
  - Body:
    - System Prompt (textarea, editable)
    - Access Token (masked input, reveal on click)
  - Footer:
    - Save button (cyan)
    - Delete button (red, with confirmation)
    - Last updated timestamp

#### Add New Config
- Large dashed-border card
- "+" icon centered
- "Add New Bot" text

### 3.5 Privacy Page (`/privacy`)

#### Simple, Clean Layout
- Max-width: 720px, centered
- Back link at top (arrow icon)
- Title: "Privacy Policy"
- Last updated date
- Content sections with clear hierarchy
- Contact email highlighted

---

## 4. Component Library

### Buttons
```
Primary:   bg-cyan, white text, glow on hover
Secondary: border border-default, hover:bg-elevated  
Ghost:     transparent, hover:bg-tertiary
Destructive: bg-red, white text
```

### Inputs
- Dark background (#111113)
- Subtle border, cyan border on focus
- Glow effect on focus

### Cards
- Background: bg-surface
- Border: 1px border-subtle
- Border-radius: 12px
- Padding: 24px
- Hover: subtle border glow

### Badges
- Pill shape (rounded-full)
- Variants: default, success, warning, error, info
- Subtle background with colored text

### Tooltips
- Dark background
- Small text
- Arrow pointing to trigger

---

## 5. Animations & Micro-interactions

### Page Load
- Staggered fade-in for cards (50ms delay each)
- Stats count up animation

### Hover States
- Buttons: scale(1.02), glow effect
- Cards: translateY(-2px), border glow
- Links: color transition to cyan

### Loading States
- Skeleton screens with shimmer animation
- Pulsing dots for "typing"

### Transitions
- All transitions: 150ms ease-out
- Page transitions: 300ms ease-in-out fade

---

## 6. Technical Requirements

### Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Recharts (charts)
- Lucide React (icons)
- Framer Motion (animations)

### Performance
- Lighthouse score: 90+
- First contentful paint: < 1.5s
- Time to interactive: < 3s

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support

---

## 7. Success Criteria

1. ✅ Distinctive visual identity (not generic)
2. ✅ High contrast, readable in all lighting
3. ✅ Intuitive navigation (no thinking required)
4. ✅ Fast, smooth interactions
5. ✅ Works on mobile, tablet, desktop
6. ✅ Passes accessibility checks
7. ✅ Stands out from "AI dashboard" sea of sameness
