import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // SELECT-only — read-only query
    const rows = await querySnowflake(`
      SELECT 
        STAGE,
        COUNT(*) as DEAL_COUNT,
        SUM(DEAL_VALUE) as TOTAL_VALUE
      FROM MERIDIAN_SALES.GOLD.Q2_DEALS
      GROUP BY STAGE
      ORDER BY TOTAL_VALUE DESC
    `)

    const stages = rows.map((r) => ({
      stage: r.STAGE,
      dealCount: Number(r.DEAL_COUNT),
      totalValue: Number(r.TOTAL_VALUE),
    }))

    return Response.json({ stages })
  } catch (e) {
    console.error(new Date().toISOString(), "[pipeline]", e)
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to fetch pipeline" },
      { status: 500 }
    )
  }
}
