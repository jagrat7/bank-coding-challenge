"use client"

import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card"
import { type StatementDetails } from "../dashboard/_actions/get-statement-details"

export default function SummaryMetrics({ statement }: { statement: StatementDetails }) {
  // In a real application, you would fetch this data based on the statementId
  const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const metrics = {
    totalDeposits: formatCurrency(statement.metrics.totalDeposits),
    totalWithdrawals: formatCurrency(statement.metrics.totalWithdrawals),
    balance: formatCurrency(statement.metrics.balance),
    outstandingLoans: statement.metrics.outstandingLoans.toString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        onClick={() => document.getElementById("transaction-history")?.scrollIntoView({ behavior: "smooth" })}
        className="cursor-pointer"
      >
        <CardHeader>
          <CardTitle>Total Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.totalDeposits}</p>
        </CardContent>
      </Card>
      <Card
        onClick={() => document.getElementById("transaction-history")?.scrollIntoView({ behavior: "smooth" })}
        className="cursor-pointer"
      >
        <CardHeader>
          <CardTitle>Total Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.totalWithdrawals}</p>
        </CardContent>
      </Card>
      <Card
        onClick={() => document.getElementById("transaction-history")?.scrollIntoView({ behavior: "smooth" })}
        className="cursor-pointer"
      >
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.balance}</p>
        </CardContent>
      </Card>
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Outstanding Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.outstandingLoans}</p>
        </CardContent>
      </Card>
    </div>
  )
}
