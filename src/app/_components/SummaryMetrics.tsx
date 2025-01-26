import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card"

export default function SummaryMetrics({ statementId }: { statementId: string }) {
  // In a real application, you would fetch this data based on the statementId
  const metrics = {
    totalDeposits: "$50,000",
    totalWithdrawals: "$45,000",
    balance: "$5,000",
    outstandingLoans: "2",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        onClick={() => document.getElementById("transaction-history").scrollIntoView({ behavior: "smooth" })}
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
        onClick={() => document.getElementById("transaction-history").scrollIntoView({ behavior: "smooth" })}
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
        onClick={() => document.getElementById("transaction-history").scrollIntoView({ behavior: "smooth" })}
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
