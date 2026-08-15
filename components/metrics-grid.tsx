import React from "react"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Layers,
  Server,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MetricItem {
  id: string
  label: string
  value: string
  unit?: string
  trend: {
    value: string
    positive: boolean
    text: string
  }
  icon: React.ElementType
  subtext: string
}

const metrics: MetricItem[] = [
  {
    id: "deployments",
    label: "Active Services",
    value: "48",
    unit: "/ 50",
    trend: {
      value: "+4",
      positive: true,
      text: "from last week",
    },
    icon: Server,
    subtext: "12 clusters across 3 regions",
  },
  {
    id: "latency",
    label: "p95 API Latency",
    value: "34.2",
    unit: "ms",
    trend: {
      value: "-8.4%",
      positive: true,
      text: "faster than avg",
    },
    icon: Activity,
    subtext: "Global edge cache 98.2% hit",
  },
  {
    id: "pipelines",
    label: "Build Reliability",
    value: "99.94",
    unit: "%",
    trend: {
      value: "+0.3%",
      positive: true,
      text: "3,420 pipeline runs",
    },
    icon: CheckCircle2,
    subtext: "Avg build time 1m 14s",
  },
  {
    id: "compute",
    label: "Edge Compute Load",
    value: "74.2",
    unit: "%",
    trend: {
      value: "Stable",
      positive: true,
      text: "within normal bounds",
    },
    icon: Cpu,
    subtext: "Auto-scaling headroom: 4.2x",
  },
]

export function MetricsGrid() {
  return (
    <section aria-label="System Metrics" className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card
              key={metric.id}
              className="relative overflow-hidden transition-all duration-200 hover:shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {metric.label}
                  </span>
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-3.5" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tracking-tight text-foreground font-heading">
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {metric.unit}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    {metric.trend.positive ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight className="size-3" />
                        {metric.trend.value}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                        <ArrowDownRight className="size-3" />
                        {metric.trend.value}
                      </span>
                    )}
                    <span className="text-muted-foreground text-[11px]">
                      {metric.trend.text}
                    </span>
                  </span>
                </div>

                <p className="mt-2 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                  {metric.subtext}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
