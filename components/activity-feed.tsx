import React from "react"
import {
  CheckCircle2,
  Clock,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Radio,
  Server,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ActivityItem {
  id: string
  type: "deploy" | "merge" | "alert" | "sync"
  title: string
  description: string
  timestamp: string
  user: string
  service: string
}

const activities: ActivityItem[] = [
  {
    id: "act-1",
    type: "deploy",
    title: "Production Release v2.4.1",
    description: "Deployed to 12 edge nodes with zero downtime.",
    timestamp: "8m ago",
    user: "alex.c",
    service: "quantum-inference-engine",
  },
  {
    id: "act-2",
    type: "merge",
    title: "PR #184 Merged into main",
    description: "feat(auth): token rotation & session invalidation hooks.",
    timestamp: "32m ago",
    user: "elena.r",
    service: "newton-design-system",
  },
  {
    id: "act-3",
    type: "sync",
    title: "Auto-scaled EU-West cluster",
    description: "Added 4 replica pods due to surge in inference traffic.",
    timestamp: "1h ago",
    user: "system",
    service: "telemetry-stream-aggregator",
  },
  {
    id: "act-4",
    type: "deploy",
    title: "Preview Build #412 Ready",
    description: "Preview branch test pass rate: 100% (48 tests).",
    timestamp: "2h ago",
    user: "marcus.k",
    service: "customer-portal-preview",
  },
]

export function ActivityFeed() {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "deploy":
        return <Zap className="size-3.5 text-sky-600 dark:text-sky-400" />
      case "merge":
        return <GitMerge className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      case "sync":
        return <Server className="size-3.5 text-foreground" />
      case "alert":
        return <Radio className="size-3.5 text-amber-600 dark:text-amber-400" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Recent Deployment Activity
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-normal">
            Realtime Stream
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/30"
            >
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-2.5" />
                    {item.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-foreground">
                    {item.service}
                  </span>
                  <span>•</span>
                  <span>by {item.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
