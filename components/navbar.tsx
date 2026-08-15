"use client"

import React from "react"
import Link from "next/link"
import {
  Bell,
  Box,
  Command,
  HelpCircle,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onNewProjectClick: () => void
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onNewProjectClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Box className="size-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-foreground text-base font-heading">
                Newton
              </span>
              <Badge
                variant="secondary"
                className="hidden font-mono text-[10px] uppercase sm:inline-flex px-1.5 py-0"
              >
                v2.4 Pro
              </Badge>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="#overview"
              className="rounded-md px-3 py-1.5 text-foreground transition-colors hover:bg-muted"
            >
              Overview
            </Link>
            <Link
              href="#projects"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Projects
            </Link>
            <Link
              href="#deployments"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Deployments
            </Link>
            <Link
              href="#telemetry"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Telemetry
            </Link>
            <Link
              href="#infrastructure"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Infrastructure
            </Link>
          </nav>
        </div>

        {/* Center/Right: Search, Actions, Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-44 sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search services..."
              className="h-8 w-full rounded-lg border border-border bg-muted/40 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border/80 bg-background/80 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
              <Command className="size-2.5" />
              <span>K</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              title="Notifications"
            >
              <Bell className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              title="Documentation"
            >
              <HelpCircle className="size-4" />
            </Button>
          </div>

          <Button
            onClick={onNewProjectClick}
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs shadow-sm font-medium"
          >
            <Plus className="size-3.5" />
            <span>New Service</span>
          </Button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <Avatar className="size-8 ring-1 ring-border">
              <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
                AC
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
