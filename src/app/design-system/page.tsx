"use client";

import * as React from "react";

import Link from "next/link";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bot,
  CheckCircle,
  ChevronRight,
  Download,
  FileText,
  Folder,
  Info,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
// UI Components
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { ChatContainer, ChatMessage } from "@/shared/ui/chat";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/ui/empty-state";
import { FileUpload } from "@/shared/ui/file-upload";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
// Separator import removed - not currently used
// import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { Slider } from "@/shared/ui/slider";
// Custom Components
import { Spinner } from "@/shared/ui/spinner";
import { StatsCard } from "@/shared/ui/stats-card";
import { Stepper, StepperItem } from "@/shared/ui/stepper";
import { Switch } from "@/shared/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import { TooltipProvider } from "@/shared/ui/tooltip";

// Component Section Wrapper
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ComponentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const [sliderValue, setSliderValue] = React.useState([50]);
  const [progressValue, setProgressValue] = React.useState(45);
  const [currentStep, setCurrentStep] = React.useState(1);
  // Files state removed since FileUpload handles its own state

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const steps: { id: string; title: string; description: string }[] = [
    { id: "1", title: "Basic Info", description: "Name and description" },
    { id: "2", title: "Configuration", description: "LLM settings" },
    { id: "3", title: "Knowledge Base", description: "Upload documents" },
    { id: "4", title: "Review", description: "Confirm and create" },
  ];

  const demoMessages: ChatMessage[] = [
    {
      id: "1",
      role: "user",
      content: "What is the capital of France?",
      timestamp: new Date(),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "The capital of France is **Paris**. It's the largest city in France and serves as the country's major cultural, economic, and political center. Paris is known for landmarks like the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.",
      timestamp: new Date(),
      sources: [
        { id: "1", title: "World Geography Guide" },
        { id: "2", title: "European Capitals" },
      ],
    },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="size-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">Component Library</h1>
                <p className="text-xs text-muted-foreground">UI Kit 2026</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-16">
          {/* Colors */}
          <Section title="Color Tokens">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-primary" />
                <p className="text-xs font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-secondary" />
                <p className="text-xs font-medium">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-accent" />
                <p className="text-xs font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-destructive" />
                <p className="text-xs font-medium">Destructive</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-success" />
                <p className="text-xs font-medium">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-warning" />
                <p className="text-xs font-medium">Warning</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Data Visualization Palette</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="space-y-1">
                    <div className={`size-12 rounded-lg bg-chart-${n}`} />
                    <p className="text-xs text-center">Chart {n}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Buttons */}
          <Section title="Buttons">
            <div className="grid md:grid-cols-2 gap-6">
              <ComponentCard title="Variants">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                </div>
              </ComponentCard>

              <ComponentCard title="Sizes">
                <div className="flex items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </ComponentCard>

              <ComponentCard title="With Icons">
                <div className="flex flex-wrap gap-2">
                  <Button leftIcon={<Plus />}>Add New</Button>
                  <Button rightIcon={<ChevronRight />}>Continue</Button>
                  <Button leftIcon={<Download />} variant="secondary">
                    Download
                  </Button>
                  <Button leftIcon={<Trash2 />} variant="destructive">
                    Delete
                  </Button>
                </div>
              </ComponentCard>

              <ComponentCard title="States">
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button loading>Loading</Button>
                  <Button size="icon">
                    <Settings className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Bell className="size-4" />
                  </Button>
                </div>
              </ComponentCard>
            </div>
          </Section>

          {/* Form Controls */}
          <Section title="Form Controls">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="Input">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search">With icon</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input id="search" className="pl-9" placeholder="Search..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disabled">Disabled</Label>
                    <Input id="disabled" disabled value="Disabled input" />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Textarea">
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here..." rows={4} />
                </div>
              </ComponentCard>

              <ComponentCard title="Select">
                <div className="space-y-2">
                  <Label>LLM Model</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude">Claude 3</SelectItem>
                      <SelectItem value="llama">Llama 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ComponentCard>

              <ComponentCard title="Checkbox">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing" defaultChecked />
                    <Label htmlFor="marketing">Receive marketing emails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled" disabled />
                    <Label htmlFor="disabled" className="text-muted-foreground">
                      Disabled option
                    </Label>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Switch">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="airplane">Airplane Mode</Label>
                    <Switch id="airplane" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifications</Label>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="disabled-switch" className="text-muted-foreground">
                      Disabled
                    </Label>
                    <Switch id="disabled-switch" disabled />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Radio Group">
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="r1" />
                    <Label htmlFor="r1">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comfortable" id="r2" />
                    <Label htmlFor="r2">Comfortable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="r3" />
                    <Label htmlFor="r3">Compact</Label>
                  </div>
                </RadioGroup>
              </ComponentCard>

              <ComponentCard title="Slider">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Temperature</Label>
                      <span className="text-sm text-muted-foreground">
                        {(sliderValue[0] ?? 50) / 100}
                      </span>
                    </div>
                    <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                  </div>
                </div>
              </ComponentCard>
            </div>
          </Section>

          {/* Badges */}
          <Section title="Badges">
            <div className="grid md:grid-cols-2 gap-6">
              <ComponentCard title="Solid Variants">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </ComponentCard>

              <ComponentCard title="Status Badges">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="active">Active</Badge>
                  <Badge variant="draft">Draft</Badge>
                  <Badge variant="processing">Processing</Badge>
                  <Badge variant="failed">Failed</Badge>
                </div>
              </ComponentCard>

              <ComponentCard title="Subtle Variants">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary-subtle">Primary</Badge>
                  <Badge variant="success-subtle">Success</Badge>
                  <Badge variant="warning-subtle">Warning</Badge>
                  <Badge variant="error-subtle">Error</Badge>
                  <Badge variant="info-subtle">Info</Badge>
                </div>
              </ComponentCard>

              <ComponentCard title="Sizes">
                <div className="flex items-center gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="default">Default</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </ComponentCard>
            </div>
          </Section>

          {/* Avatars */}
          <Section title="Avatars">
            <ComponentCard title="Sizes & Variants">
              <div className="flex items-end gap-4">
                <Avatar className="size-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="size-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="size-12">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="size-16">
                  <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                </Avatar>
                <Avatar className="size-20">
                  <AvatarFallback className="bg-accent/10 text-accent">
                    <Bot className="size-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </ComponentCard>
          </Section>

          {/* Cards */}
          <Section title="Cards">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the card content area where you can place any content.
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </CardFooter>
              </Card>

              <StatsCard
                title="Active Users"
                value="2,847"
                description="+12.5% from last month"
                icon={User}
              />

              <StatsCard
                title="Documents Processed"
                value="1,234"
                description="+8.2% from last week"
                icon={FileText}
              />
            </div>
          </Section>

          {/* Alerts */}
          <Section title="Alerts">
            <div className="grid md:grid-cols-2 gap-4">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>This is an informational alert message.</AlertDescription>
              </Alert>

              <Alert className="border-success/50 text-success [&>svg]:text-success">
                <CheckCircle className="size-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your changes have been saved successfully.</AlertDescription>
              </Alert>

              <Alert className="border-warning/50 text-warning [&>svg]:text-warning">
                <AlertTriangle className="size-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Please review your settings before continuing.</AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again.</AlertDescription>
              </Alert>
            </div>
          </Section>

          {/* Tables */}
          <Section title="Tables">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "John Doe",
                      email: "john@example.com",
                      status: "Active",
                      role: "Admin",
                    },
                    {
                      name: "Jane Smith",
                      email: "jane@example.com",
                      status: "Active",
                      role: "Editor",
                    },
                    {
                      name: "Bob Wilson",
                      email: "bob@example.com",
                      status: "Pending",
                      role: "Viewer",
                    },
                  ].map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "success" : "warning"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Section>

          {/* Progress & Loading */}
          <Section title="Progress & Loading">
            <div className="grid md:grid-cols-2 gap-6">
              <ComponentCard title="Progress Bar">
                <div className="space-y-4">
                  <Progress value={progressValue} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProgressValue(Math.max(0, progressValue - 10))}
                    >
                      -10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProgressValue(Math.min(100, progressValue + 10))}
                    >
                      +10%
                    </Button>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Spinners">
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner size="default" />
                  <Spinner size="lg" />
                  <Spinner size="xl" />
                </div>
              </ComponentCard>

              <ComponentCard title="Skeleton">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-3 mt-4">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              </ComponentCard>
            </div>
          </Section>

          {/* Tabs */}
          <Section title="Tabs">
            <Card className="p-6">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <p className="text-muted-foreground">Overview content goes here.</p>
                </TabsContent>
                <TabsContent value="analytics" className="mt-4">
                  <p className="text-muted-foreground">Analytics content goes here.</p>
                </TabsContent>
                <TabsContent value="reports" className="mt-4">
                  <p className="text-muted-foreground">Reports content goes here.</p>
                </TabsContent>
                <TabsContent value="settings" className="mt-4">
                  <p className="text-muted-foreground">Settings content goes here.</p>
                </TabsContent>
              </Tabs>
            </Card>
          </Section>

          {/* Stepper */}
          <Section title="Stepper / Wizard">
            <Card className="p-6">
              <Stepper currentStep={currentStep}>
                {steps.map((step, index) => (
                  <StepperItem
                    key={step.id}
                    title={step.title}
                    description={step.description}
                    isCompleted={index < currentStep}
                    isCurrent={index === currentStep}
                  />
                ))}
              </Stepper>
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </Card>
          </Section>

          {/* File Upload */}
          <Section title="File Upload">
            <Card className="p-6">
              <FileUpload
                accept={{
                  "application/pdf": [".pdf"],
                  "text/plain": [".txt"],
                }}
                onUpload={(files) => console.log("Uploaded:", files)}
              />
            </Card>
          </Section>

          {/* Empty State */}
          <Section title="Empty State">
            <Card>
              <EmptyState
                icon={Folder}
                title="No projects yet"
                description="Get started by creating your first project. Projects help you organize your AI avatars and documents."
                action={
                  <Button onClick={() => console.log("Create project")}>
                    Create Project
                  </Button>
                }
              />
            </Card>
          </Section>

          {/* Dialog */}
          <Section title="Dialog">
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Avatar</DialogTitle>
                    <DialogDescription>
                      Add a new AI avatar to your project. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter avatar name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Describe the avatar's personality" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Avatar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Confirmation</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your avatar and
                      remove all associated data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Section>

          {/* Chat Preview */}
          <Section title="Chat Interface">
            <Card className="h-[500px] overflow-hidden">
              <ChatContainer
                messages={demoMessages}
                avatarName="AI Assistant"
                onSend={(msg) => console.log("Send:", msg)}
                onFeedback={(id, fb) => console.log("Feedback:", id, fb)}
              />
            </Card>
          </Section>
        </main>
      </div>
    </TooltipProvider>
  );
}
