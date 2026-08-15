"use client"

import React, { useState } from "react"
import { ArrowRight, Bot, Code2, Sparkles, Terminal, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Template {
  id: string
  title: string
  desc: string
  tag: string
  icon: React.ElementType
}

const templates: Template[] = [
  {
    id: "t1",
    title: "Next.js 16 Edge Stack",
    desc: "Turbopack, Base UI, Tailwind v4 & Server Actions",
    tag: "Fullstack",
    icon: Layers,
  },
  {
    id: "t2",
    title: "AI Streaming Sidecar",
    desc: "Multi-agent runtime with streaming token responses",
    tag: "AI / LLM",
    icon: Bot,
  },
  {
    id: "t3",
    title: "Rust Microservice Gateway",
    desc: "Sub-millisecond API proxy with caching layer",
    tag: "Systems",
    icon: Code2,
  },
]

export function TemplateScaffolder() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [scaffolding, setScaffolding] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const handleScaffold = (templateId: string) => {
    setSelectedTemplate(templateId)
    setScaffolding(true)
    setStatusMsg("Scaffolding repo and provisioning edge routes...")
    setTimeout(() => {
      setScaffolding(false)
      setStatusMsg("Template initialized! Ready to build.")
      setTimeout(() => setStatusMsg(null), 3000)
    }, 1800)
  }

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Quick Blueprints
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Instant Provisioning
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2.5">
        {templates.map((tpl) => {
          const Icon = tpl.icon
          return (
            <button
              key={tpl.id}
              onClick={() => handleScaffold(tpl.id)}
              disabled={scaffolding}
              className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-all hover:border-border hover:bg-muted/50 disabled:opacity-60"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
                  <Icon className="size-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {tpl.title}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                      {tpl.tag}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {tpl.desc}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </button>
          )
        })}

        {statusMsg && (
          <div className="mt-2 rounded-md bg-muted px-3 py-2 text-xs font-medium text-foreground transition-all">
            {statusMsg}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
