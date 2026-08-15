"use client"

import React from "react"
import { Globe, HardDrive, Cpu, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RegionNode {
  code: string
  location: string
  latency: string
  status: "healthy" | "degraded"
}

const regions: RegionNode[] = [
  { code: "iad1", location: "US-East (N. Virginia)", latency: "14ms", status: "healthy" },
  { code: "fra1", location: "EU-Central (Frankfurt)", latency: "28ms", status: "healthy" },
  { code: "sin1", location: "AP-South (Singapore)", latency: "56ms", status: "healthy" },
  { code: "syd1", location: "AP-East (Sydney)", latency: "68ms", status: "healthy" },
]

export function ClusterStatus() {
  return (
    <div className="space-y-4">
      {/* Resource Allocation */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Resource Quotas
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-normal">
              Pro Tier
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Memory */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Cpu className="size-3.5 text-muted-foreground" />
                Edge Memory
              </span>
              <span className="text-muted-foreground font-mono text-[11px]">
                14.2 / 16.0 GB (88%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground transition-all" style={{ width: "88%" }} />
            </div>
          </div>

          {/* Invocations */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Globe className="size-3.5 text-muted-foreground" />
                Monthly Invocations
              </span>
              <span className="text-muted-foreground font-mono text-[11px]">
                8.4M / 10.0M (84%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground transition-all" style={{ width: "84%" }} />
            </div>
          </div>

          {/* Storage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <HardDrive className="size-3.5 text-muted-foreground" />
                KV & Vector Storage
              </span>
              <span className="text-muted-foreground font-mono text-[11px]">
                64.8 / 100.0 GB (65%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground transition-all" style={{ width: "65%" }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Edge Nodes */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Global Edge Clusters
            </CardTitle>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>All 12 regions online</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {regions.map((region) => (
              <div
                key={region.code}
                className="flex items-center justify-between p-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {region.code}
                  </span>
                  <span className="text-foreground">{region.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {region.latency}
                  </span>
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
