"use client"

import React, { useState } from "react"
import {
  Filter,
  Grid,
  Layers,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Project, ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const initialProjects: Project[] = [
  {
    id: "proj-1",
    name: "quantum-inference-engine",
    description:
      "Distributed LLM token router and low-latency streaming proxy on Cloudflare Workers & Turbopack.",
    category: "production",
    status: "healthy",
    framework: "Next.js 16 • Base UI",
    branch: "main",
    commitHash: "7f9c2a1",
    commitMessage: "fix(cache): optimize KV store hydration and streaming chunks",
    lastDeployed: "14m ago",
    url: "inference.newton.dev",
    latency: "28ms p95",
    traffic: "4.2k",
  },
  {
    id: "proj-2",
    name: "newton-design-system",
    description:
      "Shared component primitives, color token specifications, and accessible atomic UI blocks.",
    category: "production",
    status: "healthy",
    framework: "Tailwind v4 • React 19",
    branch: "release/v2.4",
    commitHash: "e3410cb",
    commitMessage: "feat(tokens): refine OKLCH color spaces and elevation tokens",
    lastDeployed: "1h ago",
    url: "ui.newton.dev",
    latency: "19ms p95",
    traffic: "1.8k",
  },
  {
    id: "proj-3",
    name: "telemetry-stream-aggregator",
    description:
      "Real-time event ingest and anomaly detection worker with time-series buffering.",
    category: "ai-edge",
    status: "healthy",
    framework: "Rust • Edge API",
    branch: "main",
    commitHash: "9b21ae7",
    commitMessage: "perf(worker): batch memory compaction and vector sync",
    lastDeployed: "3h ago",
    url: "telemetry.internal.newton",
    latency: "12ms p95",
    traffic: "18.4k",
  },
  {
    id: "proj-4",
    name: "autonomous-eval-suite",
    description:
      "Multi-agent benchmark sandbox for automated prompt regression detection and scoring.",
    category: "ai-edge",
    status: "healthy",
    framework: "Python • PyTorch",
    branch: "experiment/evals",
    commitHash: "c8801d4",
    commitMessage: "feat: continuous calibration against gold standard dataset",
    lastDeployed: "5h ago",
    url: "evals.preview.newton.dev",
    latency: "64ms p95",
    traffic: "920",
  },
  {
    id: "proj-5",
    name: "customer-portal-preview",
    description:
      "Billing, subscription tiers, and API key management portal for enterprise workspaces.",
    category: "preview",
    status: "healthy",
    framework: "Next.js 16 • Stripe",
    branch: "feat/usage-billing",
    commitHash: "44d01fa",
    commitMessage: "feat(billing): metered tier invoice computation hooks",
    lastDeployed: "8h ago",
    url: "portal-pr-412.preview.newton.dev",
    latency: "36ms p95",
    traffic: "450",
  },
  {
    id: "proj-6",
    name: "dns-edge-orchestrator",
    description:
      "Global Anycast routing controller and automated SSL certificate renewal daemon.",
    category: "infrastructure",
    status: "healthy",
    framework: "Go • CoreDNS",
    branch: "infra/v1.9",
    commitHash: "19a8bc3",
    commitMessage: "chore: update ACME challenge verification cert rotation",
    lastDeployed: "1d ago",
    url: "dns.infra.newton.internal",
    latency: "8ms p95",
    traffic: "42.1k",
  },
]

interface ProjectListProps {
  searchQuery: string
  onNewProject: () => void
}

export function ProjectList({ searchQuery, onNewProject }: ProjectListProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [deployingIds, setDeployingIds] = useState<Record<string, boolean>>({})

  const handleDeploy = (id: string) => {
    setDeployingIds((prev) => ({ ...prev, [id]: true }))
    setTimeout(() => {
      setDeployingIds((prev) => ({ ...prev, [id]: false }))
    }, 2500)
  }

  const filteredProjects = initialProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.framework.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === "all") return true
    return project.category === activeTab
  })

  const tabs = [
    { id: "all", label: "All Services", count: initialProjects.length },
    {
      id: "production",
      label: "Production",
      count: initialProjects.filter((p) => p.category === "production").length,
    },
    {
      id: "ai-edge",
      label: "AI & Edge",
      count: initialProjects.filter((p) => p.category === "ai-edge").length,
    },
    {
      id: "preview",
      label: "Preview",
      count: initialProjects.filter((p) => p.category === "preview").length,
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      count: initialProjects.filter((p) => p.category === "infrastructure").length,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header controls & tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-muted/60 p-1 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "bg-muted/80 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {filteredProjects.length} services</span>
        </div>
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDeploy={handleDeploy}
              isDeploying={!!deployingIds[project.id]}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="size-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No services found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No services match your search query &ldquo;{searchQuery}&rdquo;. Try
            refining your filters or search keywords.
          </p>
          <Button
            size="sm"
            onClick={onNewProject}
            className="mt-4 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            Create Service
          </Button>
        </div>
      )}
    </div>
  )
}
