"use client"

import { useEffect, useState } from "react"

interface KPIData {
  totalRevenue: number
  dealsWon: number
  totalDeals: number
  avgDealSize: number
  winRate: number
  pipelineValue: number
  pipelineDeals: number
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function SparkBars({ count, color }: { count: number; color: string }) {
  // Generate pseudo-random bar heights for visual interest
  const bars = Array.from({ length: 12 }, (_, i) => {
    const h = 30 + Math.sin(i * 1.2 + count) * 30 + Math.cos(i * 0.7) * 25
    return Math.max(15, Math.min(100, h))
  })
  return (
    <div className="kpi-sparkline">
      {bars.map((h, i) => (
        <div
          key={i}
          className="kpi-spark-bar"
          style={{ height: `${h}%`, background: color }}
        />
      ))}
    </div>
  )
}

export function KPICards() {
  const [data, setData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/kpis")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card">
            <div className="loading"><div className="spinner" />Loading...</div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-label">Total Revenue</div>
        <div className="kpi-value blue">{formatCurrency(data.totalRevenue)}</div>
        <SparkBars count={data.dealsWon} color="var(--accent-blue)" />
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Deals Won</div>
        <div className="kpi-value green">{data.dealsWon}</div>
        <SparkBars count={data.totalDeals} color="var(--accent-green)" />
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Avg Deal Size</div>
        <div className="kpi-value amber">{formatCurrency(data.avgDealSize)}</div>
        <SparkBars count={data.avgDealSize / 1000} color="var(--accent-amber)" />
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Pipeline Value</div>
        <div className="kpi-value cyan">{formatCurrency(data.pipelineValue)}</div>
        <SparkBars count={data.pipelineDeals} color="var(--accent-cyan)" />
      </div>
    </div>
  )
}
