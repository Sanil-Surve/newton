"use client"

import React, { useState } from "react"
import { Box, Check, Loader2, Plus, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (serviceName: string) => void
}

export function NewServiceModal({
  isOpen,
  onClose,
  onCreated,
}: NewServiceModalProps) {
  const [name, setName] = useState("")
  const [framework, setFramework] = useState("Next.js 16")
  const [repo, setRepo] = useState("organization/repo")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onCreated(name)
      setName("")
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Box className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground font-heading">
              Deploy New Service
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure edge deployment and git integration.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Service Name
            </label>
            <Input
              type="text"
              placeholder="e.g. vector-search-worker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Framework Preset
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="Next.js 16">Next.js 16 (App Router + Base UI)</option>
              <option value="AI Edge Worker">AI Edge Streaming Worker</option>
              <option value="Rust Microservice">Rust Microservice (Actix / Axum)</option>
              <option value="Node.js API">Node.js / Express Gateway</option>
              <option value="Static HTML / Astro">Astro / Static SPA</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Git Repository
            </label>
            <Input
              type="text"
              placeholder="e.g. my-org/my-service"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="text-xs gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Provision & Deploy</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
