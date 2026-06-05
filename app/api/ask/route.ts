import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== "string") {
      return Response.json({ error: "Question is required" }, { status: 400 })
    }

    // Use Cortex COMPLETE to answer the question about the sales data.
    // This is a SELECT-only call — it reads data but never modifies it.
    // We pass a system prompt with the schema context and the user question.
    const rows = await querySnowflake(`
      SELECT SNOWFLAKE.CORTEX.COMPLETE(
        'claude-sonnet-4-6',
        CONCAT(
          'You are a sales analytics assistant. Answer questions about Q2 2026 sales data. ',
          'Data schema: MERIDIAN_SALES.GOLD.Q2_DEALS has columns: DEAL_ID, ACCOUNT_NAME, SEGMENT (Enterprise/Mid-Market/SMB), REGION (West/Central/Northeast/Southeast), REP_ID, STAGE (Closed Won/Closed Lost/Negotiation/Proposal/Discovery), DEAL_VALUE, CLOSE_DATE, CREATED_DATE, PRODUCT_LINE (Core Platform/Analytics Add-on), LOSS_REASON. ',
          'MERIDIAN_SALES.GOLD.Q2_REPS has: REP_ID, REP_NAME, SEGMENT, REGION, QUOTA_Q1_2026, QUOTA_Q2_2026, MANAGER, HIRE_DATE. ',
          'Key facts: Total Q2 revenue so far is $4.57M from 37 closed-won deals. Pipeline value is $5.2M across 46 open deals. 10 reps. Top performer is Priya Patel ($900K won, 90% attainment). Marcus Rivera is at risk ($340K won vs $850K quota = 40% attainment). Win rate is 40%. Avg deal size is $123K. ',
          'Answer concisely in 2-3 sentences. Use specific numbers. Question: ',
          '${question.replace(/'/g, "''")}'
        )
      ) as ANSWER
    `)

    const answer = rows[0]?.ANSWER || "I couldn't generate an answer. Please try rephrasing."

    return Response.json({ answer })
  } catch (e) {
    console.error(new Date().toISOString(), "[ask]", e)
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to get AI answer" },
      { status: 500 }
    )
  }
}
