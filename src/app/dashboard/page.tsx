"use client"

import { useState, useMemo, useEffect } from "react"
import { getStatements, type Statement } from "./_actions/get-statements"
import Link from "next/link"
import { Button } from "~/app/_components/ui/button"
import { Input } from "~/app/_components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card"
import { Upload, Search, ArrowUpDown } from "lucide-react"
import { StatementUploader } from "../_components/StatementUploader"

export default function StatementListPage() {
  const [statements, setStatements] = useState<Statement[]>([])

  useEffect(() => {
    getStatements().then(setStatements)
  }, [])

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
        <StatementUploader />
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
              <Link href={`/dashboard/${statement.id}`} className="mt-4 block">
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
