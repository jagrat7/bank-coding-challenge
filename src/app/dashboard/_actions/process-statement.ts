'use server'

import { createOpenRouter, openrouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { revalidatePath } from "next/cache"
import { env } from "~/env"
import { db } from "~/server/db"
import { statement, transaction, statementMetrics, statementInsight } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export async function processStatement(statementId: number) {
  try {
    if (!statementId) {
      throw new Error("Statement ID is required")
    }

    // Get statement content from database
    const statementRecord = await db.query.statement.findFirst({
      where: eq(statement.id, statementId),
    })

    if (!statementRecord) {
      throw new Error("Statement not found")
    }

    // Update process stage to processing
    await db
      .update(statement)
      .set({ processStage: "processing" })
      .where(eq(statement.id, statementId))

    // Since processing is now done in the upload route,
    // we just need to return the statement data
    const [transactions, metrics] = await Promise.all([
      db.select().from(transaction).where(eq(transaction.statementId, statementId)),
      db.select().from(statementMetrics).where(eq(statementMetrics.statementId, statementId)).get()
    ])
    try {
      
    console.log("Retrieved transactions:", transactions)
    console.log("Retrieved metrics:", metrics)
      // Generate insights using DeepSeek
      const insightPrompt = `
        Analyze this financial data and provide 5 key business insights. Format each insight as JSON:
        {
          "insights": [
            {
              "category": "stability" | "expense" | "debt" | "ratio" | "recommendation",
              "insight": "string"
            }
          ]
        }

        Financial Data:
        1. Transactions: ${JSON.stringify(transactions)}
        2. Metrics:
           - Total Deposits: ${metrics?.totalDeposits}
           - Total Withdrawals: ${metrics?.totalWithdrawals}
           - Current Balance: ${metrics?.balance}
           - Outstanding Loans: ${metrics?.outstandingLoans}

        Focus on:
        - Revenue stability and patterns
        - Expense management
        - Debt and loan status
        - Financial ratios and health
        - Actionable recommendations

        Return only valid JSON, no additional text.
      `

      const { text: insightData } = await generateText({
        model: openrouter.chat("deepseek/deepseek-r1-distill-qwen-14b"),
        prompt: insightPrompt,
      })
      console.log("Sending prompt to AI:", insightPrompt)
      console.log("AI response:", insightData)

      // Clean the insights response
      const jsonStart = insightData.indexOf('{')
      const jsonEnd = insightData.lastIndexOf('}')
      
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("No JSON found in insights response")
        throw new Error("Invalid insights format")
      }

      const cleanInsightJson = insightData.slice(jsonStart, jsonEnd + 1)
      console.log("Cleaned insights JSON:", cleanInsightJson)
      
      const parsedInsights = JSON.parse(cleanInsightJson)
      console.log("Parsed insights:", parsedInsights)
      // Store insights
      await db.insert(statementInsight).values(
        parsedInsights.insights.map((i: any) => ({
          statementId,
          insight: i.insight,
          category: i.category,
        }))
      )
      console.log("Stored insights:", parsedInsights.insights)
      // Update statement status
      await db
        .update(statement)
        .set({ 
          processStage: "completed",
          processedAt: new Date(),
        })
        .where(eq(statement.id, statementId))
      
      return { success: true, data: { transactions, metrics, parsedInsights, id: statementId } }
    } catch (error) {
      // Update statement with failed stage
      await db
        .update(statement)
        .set({ processStage: "failed" })
        .where(eq(statement.id, statementId))

      throw new Error("Failed to parse AI response")
    }
  } catch (error) {
    console.error("Error processing statement:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process statement" 
    }
  }
}
