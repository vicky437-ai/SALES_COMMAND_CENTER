import { KPICards } from "@/components/KPICards"
import { AISearch } from "@/components/AISearch"
import { PipelineFunnel } from "@/components/PipelineFunnel"
import { RepLeaderboard } from "@/components/RepLeaderboard"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Sales Command Center</h1>
        <span className="app-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          Powered by Snowflake App Runtime
        </span>
      </header>

      <AISearch />

      <KPICards />

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pipeline by Stage</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Q2 2026</span>
          </div>
          <PipelineFunnel />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Rep Leaderboard — Quota Attainment</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Q2 2026</span>
          </div>
          <RepLeaderboard />
        </div>
      </div>
    </div>
  )
}
