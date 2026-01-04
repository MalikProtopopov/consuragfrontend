# UI Kit 2026 - AI Avatar Platform Design System

A comprehensive design system for AI-powered applications, built with **Next.js 14+**, **Tailwind CSS v4**, and **shadcn/ui**. This design system follows the principles of Neo-Minimalism with Depth, featuring warm enterprise aesthetics perfect for modern SaaS platforms.

![UI Kit 2026](https://img.shields.io/badge/Version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

## ✨ Features

- **🎨 Design Tokens**: Complete CSS custom property system for colors, typography, spacing, and motion
- **🌓 Light & Dark Themes**: Production-ready dual theme support with WCAG AA compliant contrast ratios
- **📦 40+ Components**: From atomic elements to complex patterns, all built with accessibility in mind
- **🏗️ App Shell**: Ready-to-use sidebar, header, and content layout for admin dashboards
- **⚡ Motion System**: Standardized 120-240ms transitions with carefully crafted easing curves
- **🤖 AI-First Components**: Specialized components for AI avatar management, document processing, and chat interfaces

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens & base styles
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Landing page
│   ├── dashboard/           # Demo dashboard
│   └── design-system/       # Component showcase
├── components/
│   ├── ui/                  # Core UI components (shadcn/ui + custom)
│   │   ├── button.tsx       # Button with variants, sizes, loading states
│   │   ├── badge.tsx        # Badges with status variants
│   │   ├── card.tsx         # Cards with hover effects
│   │   ├── chat.tsx         # Chat message bubbles & input
│   │   ├── empty-state.tsx  # Empty state patterns
│   │   ├── file-upload.tsx  # Drag & drop file uploader
│   │   ├── spinner.tsx      # Loading spinners
│   │   ├── stats-card.tsx   # Metric cards with trends
│   │   ├── stepper.tsx      # Multi-step wizard
│   │   └── ...              # 30+ more components
│   └── layout/              # Layout components
│       ├── sidebar.tsx      # Collapsible navigation
│       ├── header.tsx       # Top bar with user menu
│       └── app-shell.tsx    # Complete app shell
└── lib/
    └── utils.ts             # Utility functions (cn, etc.)
```

## 🎨 Design Tokens

### Colors

The design system uses CSS custom properties for theming. All colors automatically adapt to light and dark modes.

```css
/* Primary Brand */
--primary: #4F46E5;          /* Light mode */
--primary: #818CF8;          /* Dark mode */

/* Semantic Colors */
--success: #22C55E;
--warning: #EAB308;
--error: #EF4444;
--info: #3B82F6;

/* Status Colors (for pipelines) */
--status-active: #22C55E;
--status-draft: #94A3B8;
--status-processing: #0EA5E9;
--status-failed: #EF4444;

/* Data Visualization */
--chart-1 through --chart-6
```

### Typography

Using **Inter** as the primary font with **JetBrains Mono** for code:

- **text-xs**: 12px - Captions, badges
- **text-sm**: 14px - Secondary text, form labels
- **text-base**: 16px - Body text
- **text-lg**: 18px - Emphasized text
- **text-xl**: 20px - Section headings
- **text-2xl**: 24px - Page titles

### Spacing

Based on a 4px baseline grid:

- **space-1**: 4px
- **space-2**: 8px
- **space-3**: 12px
- **space-4**: 16px
- **space-6**: 24px
- **space-8**: 32px

### Motion

Standardized animations for consistency:

- **duration-fast**: 120ms - Hover states, micro-interactions
- **duration-medium**: 180ms - Most UI animations
- **duration-slow**: 240ms - Complex transitions

## 🧩 Components

### Core UI Components (shadcn/ui based)

| Component | Variants | Description |
|-----------|----------|-------------|
| Button | primary, secondary, ghost, destructive, outline, link, success | With loading state and icon support |
| Input | text, email, password | With icon prefix/suffix support |
| Badge | default, success, warning, error, processing, draft, active | Solid and subtle variants |
| Card | - | With hover effect (card-hover class) |
| Dialog | - | Modal dialogs with AlertDialog for confirms |
| Tabs | - | Tab navigation with content panels |
| Table | - | Data tables with sorting support |
| Select | - | Dropdown selection with search |
| Checkbox | - | Boolean toggle |
| Switch | - | Binary toggle for settings |
| Progress | - | Progress bars |
| Skeleton | - | Loading placeholders |

### Custom Components

| Component | Description |
|-----------|-------------|
| `<Spinner>` | Loading spinner with size variants |
| `<EmptyState>` | Empty state with icon, message, and CTA |
| `<StatsCard>` | Metric cards with trend indicators |
| `<Stepper>` | Multi-step wizard navigation |
| `<FileUpload>` | Drag & drop file uploader with progress |
| `<ChatContainer>` | Complete chat interface with messages |
| `<ChatInput>` | Message composer with send button |

### Layout Components

| Component | Description |
|-----------|-------------|
| `<AppShell>` | Complete app layout with sidebar and header |
| `<Sidebar>` | Collapsible navigation sidebar |
| `<Header>` | Top bar with search, user menu, theme toggle |
| `<PageContainer>` | Consistent page padding and max-width |
| `<PageHeader>` | Page title with description and actions |

## 📖 Usage Examples

### Basic Button

```tsx
import { Button } from "@/components/ui/button"

<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive" loading>Deleting...</Button>
<Button leftIcon={<Plus />}>Add Item</Button>
```

### Status Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="success">Active</Badge>
<Badge variant="processing">Processing</Badge>
<Badge variant="failed">Failed</Badge>
```

### Stats Card

```tsx
import { StatsCard } from "@/components/ui/stats-card"

<StatsCard
  title="Active Users"
  value="2,847"
  icon={<Users />}
  trend="up"
  trendValue="+12.5%"
  trendLabel="from last month"
/>
```

### App Shell

```tsx
import { AppShell, PageContainer, PageHeader } from "@/components/layout"

<AppShell
  user={{ name: "John Doe", email: "john@example.com" }}
  headerProps={{ breadcrumbs: [{ title: "Dashboard" }] }}
>
  <PageContainer>
    <PageHeader
      title="Dashboard"
      description="Welcome back!"
      actions={<Button>Create</Button>}
    />
    {/* Page content */}
  </PageContainer>
</AppShell>
```

### File Upload

```tsx
import { FileUpload } from "@/components/ui/file-upload"

const [files, setFiles] = useState([])

<FileUpload
  accept=".pdf,.doc,.docx"
  files={files}
  onFilesChange={setFiles}
  onFileRemove={(id) => setFiles(files.filter(f => f.id !== id))}
/>
```

## 🎯 Demo Pages

- **`/`** - Landing page showcasing the design system
- **`/design-system`** - Complete component library showcase
- **`/dashboard`** - Demo dashboard with app shell

## 🌙 Dark Mode

Toggle dark mode by adding the `dark` class to the HTML element:

```tsx
document.documentElement.classList.toggle("dark", true)
```

Or use the built-in theme toggle in the `<Header>` and `<AppShell>` components.

## 🔧 Customization

### Changing Brand Colors

Edit the CSS custom properties in `src/app/globals.css`:

```css
:root {
  --primary: #4F46E5;           /* Your brand color */
  --primary-foreground: #FFFFFF;
  --primary-hover: #4338CA;
}

.dark {
  --primary: #818CF8;           /* Lighter for dark mode */
  --primary-foreground: #1E1B4B;
  --primary-hover: #6366F1;
}
```

### Adding New Components

1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Follow the established patterns (variants via CVA, forwardRef, cn utility)

## 📝 Design Principles

1. **Neo-Minimalism with Depth**: Clean surfaces with subtle shadows
2. **Warm Enterprise Aesthetic**: Warm neutrals, no sterile whites
3. **Bento-Grid Layouts**: Modular, scannable dashboard sections
4. **AI-First Transparency**: Clear status indicators for AI processes
5. **Accessibility First**: WCAG AA compliant, keyboard navigable

## 📦 Dependencies

- **next**: 16.1.1
- **react**: 19.x
- **tailwindcss**: 4.x
- **@radix-ui/react-***: Accessible primitives
- **lucide-react**: Icon system
- **class-variance-authority**: Variant management
- **clsx + tailwind-merge**: Class utilities

## 📄 License

MIT License - Feel free to use this design system in your projects.

---

Built with ❤️ for AI-powered platforms
