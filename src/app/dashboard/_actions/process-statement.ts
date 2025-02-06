'use server'

import { createOpenRouter } from "@openrouter/ai-sdk-provider"
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

    // Initialize OpenRouter
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    })

    // Process statement content using AI
    const prompt = `
      Analyze this bank statement content and extract financial information in the following JSON format:
      {
        "transactions": [
          {
            "id": number,
            "date": "YYYY-MM-DD",
            "description": string,
            "amount": number (positive for deposits, negative for withdrawals)
          }
        ],
        "metrics": {
          "totalDeposits": number,
          "totalWithdrawals": number,
          "balance": number,
          "outstandingLoans": number
        }
      }

      Statement Content:
      ${statementRecord.content}

      Return only valid JSON, no additional text.
    `

    const { text: processedData } = await generateText({
      model: openrouter.chat("anthropic/claude-3.5-sonnet:beta"),
      prompt,
    })

    try {
      // Validate the response is valid JSON
      const parsedData = JSON.parse(processedData)

      // Store transactions
      await db.insert(transaction).values(
        parsedData.transactions.map((t: any) => ({
          statementId,
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.amount > 0 ? 'deposit' : 'withdrawal',
        }))
      )

      // Store metrics
      await db.insert(statementMetrics).values({
        statementId,
        totalDeposits: parsedData.metrics.totalDeposits,
        totalWithdrawals: Math.abs(parsedData.metrics.totalWithdrawals),
        balance: parsedData.metrics.balance,
        outstandingLoans: parsedData.metrics.outstandingLoans,
        periodStart: parsedData.transactions[0]?.date || new Date().toISOString().split('T')[0],
        periodEnd: parsedData.transactions[parsedData.transactions.length - 1]?.date || new Date().toISOString().split('T')[0],
      })

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
        1. Transactions: ${JSON.stringify(parsedData.transactions)}
        2. Metrics:
           - Total Deposits: ${parsedData.metrics.totalDeposits}
           - Total Withdrawals: ${parsedData.metrics.totalWithdrawals}
           - Current Balance: ${parsedData.metrics.balance}
           - Outstanding Loans: ${parsedData.metrics.outstandingLoans}

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

      const parsedInsights = JSON.parse(insightData)

      // Store insights
      await db.insert(statementInsight).values(
        parsedInsights.insights.map((i: any) => ({
          statementId,
          insight: i.insight,
          category: i.category,
        }))
      )

      // Update statement status
      await db
        .update(statement)
        .set({ 
          processStage: "completed",
          processedAt: new Date(),
        })
        .where(eq(statement.id, statementId))
      
      return { success: true, data: { ...parsedData, insights: parsedInsights.insights } }
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
