"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card"
import SummaryMetrics from "./SummaryMetrics"
import MonthlyChart from "./MonthlyChart"
import ExpensesBreakdown from "./ExpensesBreakdown"
import OutstandingLoans from "./OutstandingLoans"
import TransactionHistory from "./TransactionHistory"
import AIInsights from "./AIInsights"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Dashboard({ statementId }: { statementId: string }) {
  return (
    <div className="space-y-4">
      <SummaryMetrics statementId={statementId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Deposits and Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart statementId={statementId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Major Expenses Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesBreakdown statementId={statementId} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <OutstandingLoans statementId={statementId} />
        </CardContent>
      </Card>

      <Card id="transaction-history">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistory statementId={statementId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights and Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <AIInsights statementId={statementId} />
        </CardContent>
      </Card>
    </div>
  )
}
