import StatementList from "~/app/_components/StatementList"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Bank Statement Analysis</h1>
      <StatementList />
    </main>
  )
}

