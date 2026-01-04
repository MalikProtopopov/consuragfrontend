"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Palette,
  Component,
  Layout,
  MousePointer2,
  Code2,
  ArrowRight,
  Github,
  Moon,
  Sun,
  Users,
  FileText,
  Bot,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [isDark, setIsDark] = React.useState(false)

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle("dark", newIsDark)
  }

  const features = [
    {
      icon: Palette,
      title: "Design Tokens",
      description: "CSS custom properties for colors, typography, spacing, and motion—all theme-aware."
    },
    {
      icon: Component,
      title: "40+ Components",
      description: "Buttons, inputs, cards, modals, and more—built with shadcn/ui and Radix primitives."
    },
    {
      icon: Layout,
      title: "App Shell",
      description: "Ready-to-use sidebar, header, and content layout for admin dashboards."
    },
    {
      icon: MousePointer2,
      title: "Micro-interactions",
      description: "Smooth 120-240ms transitions with carefully crafted easing curves."
    },
    {
      icon: Code2,
      title: "Developer Ready",
      description: "TypeScript, Tailwind CSS v4, and full accessibility (WCAG AA) built-in."
    },
    {
      icon: Zap,
      title: "Performance First",
      description: "Tree-shakeable components, CSS variables for theming, minimal bundle size."
    },
  ]

  const stats = [
    { value: "40+", label: "Components" },
    { value: "2", label: "Themes" },
    { value: "6", label: "Status Colors" },
    { value: "100%", label: "TypeScript" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              UI
            </div>
            <span className="font-semibold text-lg">UI Kit 2026</span>
            <Badge variant="primary-subtle" size="sm">Beta</Badge>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/design-system" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Components
            </Link>
            <Link href="/design-system/tokens" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tokens
            </Link>
            <Link href="/design-system/patterns" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Patterns
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" />
              </a>
            </Button>
            <Button asChild>
              <Link href="/design-system">
                View Components
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="px-4 py-1.5">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
                Design System for AI Platforms
              </span>
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build beautiful AI interfaces with{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                UI Kit 2026
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive design system for AI avatar platforms. Neo-minimal design with warm enterprise aesthetics, 
              built on Next.js, Tailwind CSS v4, and shadcn/ui.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/design-system">
                  Explore Components
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/dashboard">
                  View Demo Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-surface-2/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete design system with tokens, components, patterns, and templates 
              for building modern AI-powered applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="card-hover border-border/50">
                  <CardHeader>
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Component Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Component Gallery</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Production-ready components designed for AI avatar platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Buttons Preview */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Delete</Button>
              </div>
            </Card>

            {/* Badges Preview */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="destructive">Failed</Badge>
                <Badge variant="processing">Processing</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </Card>

            {/* Status Indicators */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Status Indicators</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-active" />
                  <span className="text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-processing" />
                  <span className="text-sm">Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-draft" />
                  <span className="text-sm">Draft</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-failed" />
                  <span className="text-sm">Failed</span>
                </div>
              </div>
            </Card>

            {/* Cards Preview */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Data Visualization</h3>
              <div className="flex gap-2">
                <div className="size-8 rounded bg-chart-1" />
                <div className="size-8 rounded bg-chart-2" />
                <div className="size-8 rounded bg-chart-3" />
                <div className="size-8 rounded bg-chart-4" />
                <div className="size-8 rounded bg-chart-5" />
                <div className="size-8 rounded bg-chart-6" />
              </div>
            </Card>

            {/* Loading States */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Loading States</h3>
              <div className="space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-1/2" />
                <div className="flex gap-2 mt-4">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-3 w-3/4" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Typography */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Typography</h3>
              <div className="space-y-2">
                <p className="text-2xl font-semibold">Heading</p>
                <p className="text-base">Body text with <span className="font-medium">medium weight</span></p>
                <p className="text-sm text-muted-foreground">Secondary text</p>
                <p className="text-xs text-muted-foreground">Caption text</p>
                <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">code snippet</code>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/design-system">
                View All Components
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-surface-2/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for AI Platforms</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specialized components and patterns for AI avatar management, document processing, and chat interfaces.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI Avatar Management</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage AI avatars with multi-step wizards and configuration panels.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="size-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <FileText className="size-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Document Pipeline</h3>
              <p className="text-sm text-muted-foreground">
                Upload, process, and visualize document chunks with progress indicators.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="size-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                <Users className="size-8 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Chat Interface</h3>
              <p className="text-sm text-muted-foreground">
                Test conversations with source attribution and feedback controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-8 md:p-12 text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start building?</h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Explore the full component library and start building your AI platform today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link href="/design-system">
                    Browse Components
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="border border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/dashboard">
                    View Dashboard Demo
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            UI Kit 2026 — Design System for AI Avatar Platforms
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Built with Next.js, Tailwind CSS v4, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  )
}
