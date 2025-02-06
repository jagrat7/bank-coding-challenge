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
      model: openrouter.chat("openai/gpt-4-turbo-preview"),
      prompt,
    })

    try {
      // Clean and validate the response
      const cleanedData = processedData
        .replace(/^```(?:json)?\s*/, '')  // Remove opening ```json with any whitespace
        .replace(/\s*```\s*$/, '')       // Remove closing ``` with any whitespace
        .replace(/```/g, '')              // Remove any remaining ``` anywhere
        .trim()
      
      console.log("Processed data:", processedData)
      console.log("Cleaned data:", cleanedData)
      
      const parsedData = JSON.parse(cleanedData)
      console.log("Parsed RAW data:", parsedData)
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

      console.log("Stored transactions:", parsedData.transactions)
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
      console.log("Stored metrics:", parsedData.metrics)
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
      
      return { success: true, data: { ...parsedData, insights: parsedInsights.insights, id: statementId } }
    } catch (error) {
      // Update statement with failed stage
      await db
        .update(statement)
        .set({ processStage: "failed" })
        .where(eq(statement.id, statementId))

    }
  } catch (error) {
    console.error("Error processing statement:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process statement" 
    }
  }
}
