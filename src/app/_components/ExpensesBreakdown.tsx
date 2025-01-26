import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

export default function ExpensesBreakdown({ statementId }: { statementId: string }) {
  // In a real application, you would fetch this data based on the statement
  const data = [
    { name: "Rent", value: 2000 },
    { name: "Salaries", value: 5000 },
    { name: "Utilities", value: 1000 },
    { name: "Supplies", value: 500 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

