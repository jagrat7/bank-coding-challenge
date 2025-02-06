"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card"
import SummaryMetrics from "~/app/_components/SummaryMetrics"
import MonthlyChart from "~/app/_components/MonthlyChart"
import ExpensesBreakdown from "~/app/_components/ExpensesBreakdown"
import OutstandingLoans from "~/app/_components/OutstandingLoans"
import TransactionHistory from "~/app/_components/TransactionHistory"
import AIInsights from "~/app/_components/AIInsights"

export default function StatementDetail() {
  const params = useParams()
  const id = params.id as string

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Statement Details</h1>
      <div className="space-y-4">
        <SummaryMetrics statementId={id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Deposits and Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart statementId={id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Major Expenses Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensesBreakdown statementId={id} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <OutstandingLoans statementId={id} />
          </CardContent>
        </Card>

        <Card id="transaction-history">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionHistory statementId={id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights and Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsights statementId={id} />
          </CardContent>
        </Card>
      </div>

    </main>
  )
}

