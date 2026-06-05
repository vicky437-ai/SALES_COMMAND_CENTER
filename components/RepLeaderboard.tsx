"use client"

import { useEffect, useState } from "react"

interface Rep {
  repId: string
  name: string
  segment: string
  region: string
  quota: number
  wonRevenue: number
  dealsWon: number
  totalDeals: number
  attainment: number
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function getBarColor(attainment: number): string {
  if (attainment >= 0.8) return "var(--accent-green)"
  if (attainment >= 0.5) return "var(--accent-amber)"
  return "var(--accent-red)"
}

export function RepLeaderboard() {
  const [reps, setReps] = useState<Rep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.reps) setReps(d.reps)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading"><div className="spinner" />Loading leaderboard...</div>
  }

  return (
    <div>
      {reps.map((rep, idx) => {
        const pct = Math.min(rep.attainment * 100, 100)
        const color = getBarColor(rep.attainment)
        return (
          <div key={rep.repId} className="leaderboard-row">
            <div className={`leaderboard-rank ${idx < 3 ? "top" : ""}`}>
              {idx + 1}
            </div>
            <div className="leaderboard-name">
              {rep.name}
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {formatCurrency(rep.wonRevenue)} / {formatCurrency(rep.quota)}
              </div>
            </div>
            <div className="leaderboard-segment">{rep.segment}</div>
            <div className="leaderboard-bar-wrap">
              <div
                className="leaderboard-bar"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <div className="leaderboard-pct" style={{ color }}>
              {(rep.attainment * 100).toFixed(0)}%
            </div>
          </div>
        )
      })}
    </div>
  )
}
