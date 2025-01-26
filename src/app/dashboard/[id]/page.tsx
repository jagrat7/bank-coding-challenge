import Dashboard from "~/app/_components/Dashboard"

export default function StatementDetail({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Statement Details</h1>
      <Dashboard statementId={params.id} />
    </main>
  )
}

