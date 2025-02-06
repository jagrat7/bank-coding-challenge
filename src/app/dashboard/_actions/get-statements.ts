'use server'

import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { statement, statementMetrics } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export type Statement = {
  id: number
  name: string
  uploadDate: string
  totalDeposits: number
  totalWithdrawals: number
  balance: number
}

export async function getStatements(): Promise<Statement[]> {
  const session = await auth()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const statements = await db.select()
    .from(statement)
    .leftJoin(statementMetrics, eq(statement.id, statementMetrics.statementId))
    .where(eq(statement.userId, session.user.id))

  return statements.map(s => ({
    id: s.statement.id,
    name: `Statement ${new Date(s.statement.createdAt).toLocaleDateString()}`,
    uploadDate: new Date(s.statement.createdAt).toISOString().split('T')[0] || '',
    totalDeposits: Number(s.statement_metrics?.totalDeposits || 0) / 100,
    totalWithdrawals: Number(s.statement_metrics?.totalWithdrawals || 0) / 100,
    balance: Number(s.statement_metrics?.balance || 0) / 100
  }))

}
