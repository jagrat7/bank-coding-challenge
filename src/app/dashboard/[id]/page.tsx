import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card"
import SummaryMetrics from "~/app/_components/SummaryMetrics"
import MonthlyChart from "~/app/_components/MonthlyChart"
import ExpensesBreakdown from "~/app/_components/ExpensesBreakdown"
import OutstandingLoans from "~/app/_components/OutstandingLoans"
import TransactionHistory from "~/app/_components/TransactionHistory"
import AIInsights from "~/app/_components/AIInsights"
import { getStatementDetails } from "../_actions/get-statement-details"

export default async function StatementDetail({ params }: { params: { id: string } }) {
  if (!params?.id || isNaN(parseInt(params.id))) {
    throw new Error('Invalid statement ID')
  }
  
  const statement = await getStatementDetails(parseInt(params.id))

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">{statement.name}</h1>
      <div className="space-y-4">
        <SummaryMetrics statement={statement} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Deposits and Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart statement={statement} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Major Expenses Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensesBreakdown statement={statement} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <OutstandingLoans statement={statement} />
          </CardContent>
        </Card>

        <Card id="transaction-history">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionHistory statement={statement} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights and Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsights statement={statement} />
          </CardContent>
        </Card>
      </div>

    </main>
  )
}

