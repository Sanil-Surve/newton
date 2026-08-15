"use client"

import React, { useState } from "react"
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  GitBranch,
  GitCommit,
  MoreVertical,
  Play,
  RefreshCw,
  Terminal,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Project {
  id: string
  name: string
  description: string
  category: "production" | "ai-edge" | "preview" | "infrastructure"
  status: "healthy" | "deploying" | "warning" | "idle"
  framework: string
  branch: string
  commitHash: string
  commitMessage: string
  lastDeployed: string
  url: string
  latency: string
  traffic: string
}

interface ProjectCardProps {
  project: Project
  onDeploy: (projectId: string) => void
  isDeploying: boolean
}

export function ProjectCard({
  project,
  onDeploy,
  isDeploying,
}: ProjectCardProps) {
  const [copied, setCopied] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${project.url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Operational
          </span>
        )
      case "deploying":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400">
            <span className="size-1.5 animate-ping rounded-full bg-sky-500" />
            Deploying
          </span>
        )
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Check Warnings
          </span>
        )
      case "idle":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground/60" />
            Idle
          </span>
        )
    }
  }

  return (
    <Card className="transition-all duration-200 hover:border-border hover:shadow-sm">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-foreground text-sm font-heading">
                {project.name}
              </h3>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {project.framework}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {project.description}
            </p>
          </div>

          <div className="shrink-0">{getStatusBadge(isDeploying ? "deploying" : project.status)}</div>
        </div>

        {/* Live URL & Branch info */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <span className="font-mono text-foreground">{project.url}</span>
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
              title="Copy URL"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>

          <a
            href={`https://${project.url}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground transition-opacity hover:opacity-80"
          >
            <span>Visit</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        {/* Git & Commit Metadata */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <GitBranch className="size-3" />
              {project.branch}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <GitCommit className="size-3" />
              {project.commitHash}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {project.lastDeployed}
            </span>
            <span className="font-mono">{project.latency}</span>
          </div>
        </div>

        {/* Commit Message preview */}
        <div className="mt-2.5 truncate text-[11px] text-muted-foreground/80 italic">
          &ldquo;{project.commitMessage}&rdquo;
        </div>

        {/* Action Toolbar */}
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => onDeploy(project.id)}
              disabled={isDeploying}
              className="h-7 gap-1 text-[11px]"
            >
              {isDeploying ? (
                <RefreshCw className="size-3 animate-spin" />
              ) : (
                <Play className="size-3" />
              )}
              <span>{isDeploying ? "Deploying..." : "Redeploy"}</span>
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowLogs(!showLogs)}
              className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Terminal className="size-3" />
              <span>{showLogs ? "Hide Logs" : "Logs"}</span>
            </Button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{project.traffic} req/min</span>
          </div>
        </div>

        {/* Expandable Build Logs */}
        {showLogs && (
          <div className="mt-3 rounded-md bg-neutral-900 p-3 font-mono text-[11px] leading-relaxed text-neutral-300 dark:bg-black dark:text-neutral-300">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 text-neutral-400">
              <span className="text-[10px] uppercase tracking-wider">
                Turbopack Build Output — {project.commitHash}
              </span>
              <span className="text-emerald-400">ready in 642ms</span>
            </div>
            <div className="mt-2 space-y-1 text-[10px]">
              <p className="text-neutral-400">
                [info] Loaded next.config.ts configuration
              </p>
              <p className="text-neutral-400">
                [info] Generated static chunks for 4 routes
              </p>
              <p className="text-neutral-300">
                [optimize] Base UI components tree-shaken (14.2 kB gzip)
              </p>
              <p className="text-emerald-400">
                ✓ Deployed to edge network across 12 zones
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
