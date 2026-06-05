import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // SELECT-only — read-only query
    const rows = await querySnowflake(`
      SELECT 
        d.REP_ID,
        r.REP_NAME,
        r.SEGMENT,
        r.REGION,
        r.QUOTA_Q2_2026,
        SUM(CASE WHEN d.STAGE = 'Closed Won' THEN d.DEAL_VALUE ELSE 0 END) as WON_REVENUE,
        COUNT(CASE WHEN d.STAGE = 'Closed Won' THEN 1 END) as DEALS_WON,
        COUNT(*) as TOTAL_DEALS
      FROM MERIDIAN_SALES.GOLD.Q2_DEALS d
      JOIN MERIDIAN_SALES.GOLD.Q2_REPS r ON d.REP_ID = r.REP_ID
      GROUP BY d.REP_ID, r.REP_NAME, r.SEGMENT, r.REGION, r.QUOTA_Q2_2026
      ORDER BY WON_REVENUE DESC
    `)

    const reps = rows.map((r) => ({
      repId: r.REP_ID,
      name: r.REP_NAME,
      segment: r.SEGMENT,
      region: r.REGION,
      quota: Number(r.QUOTA_Q2_2026),
      wonRevenue: Number(r.WON_REVENUE),
      dealsWon: Number(r.DEALS_WON),
      totalDeals: Number(r.TOTAL_DEALS),
      attainment: Number(r.WON_REVENUE) / Number(r.QUOTA_Q2_2026),
    }))

    return Response.json({ reps })
  } catch (e) {
    console.error(new Date().toISOString(), "[leaderboard]", e)
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}
