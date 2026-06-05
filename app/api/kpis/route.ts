import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // All queries are SELECT-only — read-only against MERIDIAN_SALES
    const [revenueRows, dealRows, pipelineRows] = await Promise.all([
      querySnowflake(`
        SELECT 
          SUM(CASE WHEN STAGE = 'Closed Won' THEN DEAL_VALUE ELSE 0 END) as TOTAL_REVENUE,
          COUNT(CASE WHEN STAGE = 'Closed Won' THEN 1 END) as DEALS_WON,
          COUNT(*) as TOTAL_DEALS,
          AVG(CASE WHEN STAGE = 'Closed Won' THEN DEAL_VALUE END) as AVG_DEAL_SIZE
        FROM MERIDIAN_SALES.GOLD.Q2_DEALS
      `),
      querySnowflake(`
        SELECT COUNT(*) as PIPELINE_DEALS,
          SUM(DEAL_VALUE) as PIPELINE_VALUE
        FROM MERIDIAN_SALES.GOLD.Q2_DEALS
        WHERE STAGE NOT IN ('Closed Won', 'Closed Lost')
      `),
      querySnowflake(`
        SELECT STAGE, COUNT(*) as CNT, SUM(DEAL_VALUE) as VAL
        FROM MERIDIAN_SALES.GOLD.Q2_DEALS
        GROUP BY STAGE
        ORDER BY VAL DESC
      `),
    ])

    const revenue = revenueRows[0]
    const pipeline = dealRows[0]

    return Response.json({
      totalRevenue: Number(revenue.TOTAL_REVENUE),
      dealsWon: Number(revenue.DEALS_WON),
      totalDeals: Number(revenue.TOTAL_DEALS),
      avgDealSize: Number(revenue.AVG_DEAL_SIZE),
      winRate: Number(revenue.DEALS_WON) / Number(revenue.TOTAL_DEALS),
      pipelineValue: Number(pipeline.PIPELINE_VALUE),
      pipelineDeals: Number(pipeline.PIPELINE_DEALS),
    })
  } catch (e) {
    console.error(new Date().toISOString(), "[kpis]", e)
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to fetch KPIs" },
      { status: 500 }
    )
  }
}
