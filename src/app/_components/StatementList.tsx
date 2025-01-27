"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "~/app/_components/ui/button"
import { Input } from "~/app/_components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card"
import { Upload, Search, ArrowUpDown } from "lucide-react"

export default function StatementList() {
  const [statements, setStatements] = useState([
    {
      id: 1,
      name: "January 2023",
      uploadDate: "2023-02-01",
      totalDeposits: 50000,
      totalWithdrawals: 45000,
      balance: 5000,
    },
    {
      id: 2,
      name: "February 2023",
      uploadDate: "2023-03-01",
      totalDeposits: 55000,
      totalWithdrawals: 48000,
      balance: 7000,
    },
    {
      id: 3,
      name: "March 2023",
      uploadDate: "2023-04-01",
      totalDeposits: 60000,
      totalWithdrawals: 52000,
      balance: 8000,
    },
    {
      id: 4,
      name: "April 2023",
      uploadDate: "2023-05-01",
      totalDeposits: 58000,
      totalWithdrawals: 50000,
      balance: 8000,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // In a real application, you would handle the file upload here
    console.log("File uploaded:", event.target.files?.[0]?.name)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const filteredAndSortedStatements = useMemo(() => {
    return statements
      .filter(
        (statement) =>
          statement.name.toLowerCase().includes(searchTerm.toLowerCase()) || statement.uploadDate.includes(searchTerm),
      )
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        } else {
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        }
      })
  }, [statements, searchTerm, sortDirection])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input type="file" accept=".pdf,.csv,.xlsx" onChange={handleFileUpload} className="max-w-sm" />
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload Statement
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search statements..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
        <Button onClick={toggleSortDirection} variant="outline">
          Sort by Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedStatements.map((statement) => (
          <Card key={statement.id}>
            <CardHeader>
              <CardTitle>{statement.name}</CardTitle>
              <CardDescription>Uploaded on {statement.uploadDate}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Deposits:</span>
                  <span>{statement.totalDeposits.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Withdrawals:</span>
                  <span>
                    {statement.totalWithdrawals.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span>{statement.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                </div>
              </div>
              <Link href={`/statement/${statement.id}`} className="mt-4 block">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
