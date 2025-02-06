"use client"

import { Alert, AlertDescription, AlertTitle } from "~/app/_components/ui/alert"
import { AlertCircle } from "lucide-react"
import { type StatementDetails } from "../dashboard/_actions/get-statement-details"

export default function AIInsights({ statement }: { statement: StatementDetails }) {
  // In a real application, you would generate these insights using an AI model and statementId
  const insights = statement.insights

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Alert key={index}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Insight {index + 1}</AlertTitle>
          <AlertDescription>{insight}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
