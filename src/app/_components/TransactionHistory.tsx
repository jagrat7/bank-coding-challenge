"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/app/_components/ui/table"
import { Input } from "~/app/_components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/app/_components/ui/select"
import { Button } from "~/app/_components/ui/button"
import { type StatementDetails } from "../dashboard/_actions/get-statement-details"

export default function TransactionHistory({ statement }: { statement: StatementDetails }) {
  // In a real application, you would fetch this data based on the statementId
  const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const initialTransactions = statement.transactions.map(t => ({
    id: t.id,
    date: t.date,
    description: t.description,
    amount: t.amount
  }))

  const [transactions, setTransactions] = useState(initialTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  type SortField = "date" | "id" | "description" | "amount"
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState("asc")

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = initialTransactions.filter((transaction) => transaction.description.toLowerCase().includes(term))
    setTransactions(filtered)
  }

  const handleSort = (field: SortField) => {
    const direction = field === sortField && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(direction)
    const sorted = [...transactions].sort((a, b) => {
      if (a[field] < b[field]) return direction === "asc" ? -1 : 1
      if (a[field] > b[field]) return direction === "asc" ? 1 : -1
      return 0
    })
    setTransactions(sorted)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input placeholder="Search by description" value={searchTerm} onChange={handleSearch} className="max-w-sm" />
        <Select onValueChange={(value: SortField) => handleSort(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="description">Description</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                {transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
