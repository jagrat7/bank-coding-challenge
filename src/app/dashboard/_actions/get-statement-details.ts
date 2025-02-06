'use server'

import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { statement, statementMetrics, transaction, statementInsight, loan } from "~/server/db/schema"
import { eq, and } from "drizzle-orm"

export type StatementDetails = {
  id: number
  name: string
  uploadDate: string
  metrics: {
    totalDeposits: number
    totalWithdrawals: number
    balance: number
    outstandingLoans: number
  }
  loans: Array<{
    id: number
    type: string
    amount: number
    interestRate: number
    remainingBalance: number
  }>
  transactions: Array<{
    id: number
    date: string
    description: string
    amount: number
    type: 'deposit' | 'withdrawal'
  }>
  insights: Array<string>
}

export async function getStatementDetails(id: number): Promise<StatementDetails> {
  const session = await auth()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const [statementData] = await db.select()
    .from(statement)
    .leftJoin(statementMetrics, eq(statement.id, statementMetrics.statementId))
    .where(and(
      eq(statement.id, id),
      eq(statement.userId, session.user.id)
    ))

  if (!statementData) {
    throw new Error("Statement not found")
  }

  const transactions = await db.select()
    .from(transaction)
    .where(eq(transaction.statementId, id))
    .orderBy(transaction.date)

  const insights = await db.select()
    .from(statementInsight)
    .where(eq(statementInsight.statementId, id))

  let loans: any[] = []
  try {
    loans = await db.select()
      .from(loan)
      .where(eq(loan.statementId, id))
  } catch (error) {
    console.error('Error fetching loans:', error)
  }

  return {
    id: statementData.statement.id,
    name: statementData.statement.name ?? 'untitled',
    uploadDate: statementData.statement.createdAt.toISOString().split('T')[0] ?? '',
    metrics: {
      totalDeposits: Number(statementData.statement_metrics?.totalDeposits || 0) / 100,
      totalWithdrawals: Number(statementData.statement_metrics?.totalWithdrawals || 0) / 100,
      balance: Number(statementData.statement_metrics?.balance || 0) / 100,
      outstandingLoans: Number(statementData.statement_metrics?.outstandingLoans || 0)
    },
    transactions: transactions.map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: Number(t.amount) / 100,
      type: t.type
    })),
    insights: insights.map(i => i.insight),
    loans: loans.map(l => ({
      id: l.id,
      type: l.type,
      amount: Number(l.amount) / 100,
      interestRate: Number(l.interestRate) / 100,
      remainingBalance: Number(l.remainingBalance) / 100
    }))
  }
}
