"use client"

import { useEffect, useState } from "react"

interface PipelineStage {
  stage: string
  dealCount: number
  totalValue: number
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

const STAGE_COLORS: Record<string, string> = {
  "Closed Won": "var(--accent-green)",
  Proposal: "var(--accent-blue)",
  Discovery: "var(--accent-cyan)",
  Negotiation: "var(--accent-amber)",
  "Closed Lost": "var(--accent-red)",
}

export function PipelineFunnel() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/pipeline")
      .then((r) => r.json())
      .then((d) => {
        if (d.stages) setStages(d.stages)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading"><div className="spinner" />Loading pipeline...</div>
  }

  const maxValue = Math.max(...stages.map((s) => s.totalValue), 1)

  return (
    <div>
      {stages.map((stage) => {
        const pct = (stage.totalValue / maxValue) * 100
        const color = STAGE_COLORS[stage.stage] || "var(--accent-purple)"
        return (
          <div key={stage.stage} className="pipeline-stage">
            <div className="pipeline-label">{stage.stage}</div>
            <div className="pipeline-bar-container">
              <div
                className="pipeline-bar"
                style={{ width: `${pct}%`, background: color }}
              >
                {pct > 20 ? `${stage.dealCount} deals` : ""}
              </div>
            </div>
            <div className="pipeline-value">{formatCurrency(stage.totalValue)}</div>
          </div>
        )
      })}
    </div>
  )
}
