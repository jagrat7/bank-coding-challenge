import { Alert, AlertDescription, AlertTitle } from "~/app/_components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AIInsights({ statementId }: { statementId: string }) {
  // In a real application, you would generate these insights using an AI model and statementId
  const insights = [
    "The business shows consistent monthly revenue, indicating stability.",
    "Major expenses are well-managed and within industry norms.",
    "There are two outstanding loans, but payments are being made regularly.",
    "The current ratio (current assets / current liabilities) is healthy at 1.5.",
    "Recommendation: This business appears to be a good candidate for a loan, given their financial stability and responsible management of existing debts.",
  ]

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
