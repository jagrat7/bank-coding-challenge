"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/app/_components/ui/table"
import { type StatementDetails } from "../dashboard/_actions/get-statement-details"

export default function OutstandingLoans({ statement }: { statement: StatementDetails }) {
  const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const formatPercent = (rate: number) => `${rate}%`

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
        {statement.loans.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell>{loan.type}</TableCell>
            <TableCell>{formatCurrency(loan.amount)}</TableCell>
            <TableCell>{formatPercent(loan.interestRate)}</TableCell>
            <TableCell>{formatCurrency(loan.remainingBalance)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
