"use client"

import * as React from "react"
import {
  Users,
  Bot,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react"

import { AppShell, PageContainer, PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/ui/stats-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockUser = {
  name: "Alex Johnson",
  email: "alex@company.com",
  avatarUrl: "",
}

const recentActivity = [
  {
    id: "1",
    type: "avatar",
    title: "Created new avatar",
    subtitle: "Customer Support Bot",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    type: "document",
    title: "Document processed",
    subtitle: "product-manual-v2.pdf",
    time: "15 minutes ago",
    status: "success",
  },
  {
    id: "3",
    type: "chat",
    title: "Chat session ended",
    subtitle: "45 messages exchanged",
    time: "1 hour ago",
    status: "info",
  },
  {
    id: "4",
    type: "document",
    title: "Document processing failed",
    subtitle: "corrupted-file.pdf",
    time: "2 hours ago",
    status: "error",
  },
]

const recentAvatars = [
  {
    id: "1",
    name: "Customer Support",
    status: "active",
    conversations: 1234,
    lastActive: "Just now",
  },
  {
    id: "2",
    name: "Sales Assistant",
    status: "active",
    conversations: 856,
    lastActive: "5 min ago",
  },
  {
    id: "3",
    name: "HR Helper",
    status: "training",
    conversations: 0,
    lastActive: "Training...",
  },
  {
    id: "4",
    name: "Tech Support Bot",
    status: "draft",
    conversations: 0,
    lastActive: "Not deployed",
  },
]

export default function DashboardPage() {
  return (
    <AppShell
      user={mockUser}
      headerProps={{
        breadcrumbs: [{ title: "Dashboard" }],
      }}
    >
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your AI avatars."
          actions={
            <Button>
              <Bot className="size-4" />
              Create Avatar
            </Button>
          }
        />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Avatars"
            value="12"
            icon={<Bot className="size-5" />}
            trend="up"
            trendValue="+2"
            trendLabel="this month"
          />
          <StatsCard
            title="Active Users"
            value="2,847"
            icon={<Users className="size-5" />}
            trend="up"
            trendValue="+12.5%"
            trendLabel="from last month"
          />
          <StatsCard
            title="Documents"
            value="1,234"
            icon={<FileText className="size-5" />}
            trend="up"
            trendValue="+48"
            trendLabel="this week"
          />
          <StatsCard
            title="Conversations"
            value="8,456"
            icon={<MessageSquare className="size-5" />}
            trend="up"
            trendValue="+23%"
            trendLabel="vs last week"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Chart Area */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Conversations Overview</CardTitle>
              <CardDescription>
                Daily conversation volume across all avatars
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for chart */}
              <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="size-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chart visualization would go here</p>
                  <p className="text-xs">Using Recharts or similar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 size-2 rounded-full shrink-0 ${
                        item.status === "success"
                          ? "bg-success"
                          : item.status === "error"
                            ? "bg-destructive"
                            : "bg-info"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Avatars Table */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Avatars</CardTitle>
              <CardDescription>Manage and monitor your AI avatars</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
              <ArrowUpRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAvatars.map((avatar) => (
                  <TableRow key={avatar.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Bot className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{avatar.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          avatar.status === "active"
                            ? "success"
                            : avatar.status === "training"
                              ? "processing"
                              : "draft"
                        }
                      >
                        {avatar.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {avatar.conversations.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {avatar.lastActive}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Test Chat</DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Usage</CardTitle>
              <CardDescription>Current billing period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tokens Used</span>
                  <span className="font-medium">1.2M / 2M</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Calls</span>
                  <span className="font-medium">8,456 / 10,000</span>
                </div>
                <Progress value={84} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">2.4 GB / 5 GB</span>
                </div>
                <Progress value={48} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Bot className="size-5" />
                <span className="text-xs">New Avatar</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <FileText className="size-5" />
                <span className="text-xs">Upload Docs</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <MessageSquare className="size-5" />
                <span className="text-xs">Test Chat</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Zap className="size-5" />
                <span className="text-xs">Integrations</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppShell>
  )
}

