import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/app/_components/ui/table"

export default function OutstandingLoans({ statementId }: { statementId: string }) {
  // In a real application, you would fetch this data based on the statementId
  const loans = [
    { id: 1, type: "Business Loan", amount: "$50,000", interestRate: "5%", remainingBalance: "$30,000" },
    { id: 2, type: "Equipment Loan", amount: "$20,000", interestRate: "4%", remainingBalance: "$15,000" },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loan Type</TableHead>
          <TableHead>Original Amount</TableHead>
          <TableHead>Interest Rate</TableHead>
          <TableHead>Remaining Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell>{loan.type}</TableCell>
            <TableCell>{loan.amount}</TableCell>
            <TableCell>{loan.interestRate}</TableCell>
            <TableCell>{loan.remainingBalance}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
