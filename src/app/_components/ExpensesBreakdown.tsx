"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { type StatementDetails } from "../dashboard/_actions/get-statement-details"

export default function ExpensesBreakdown({ statement }: { statement: StatementDetails }) {
  // In a real application, you would fetch this data based on the statement
  // Group withdrawals by description
  const expensesByCategory = statement.transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((acc, t) => {
      const category = t.description
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += Math.abs(t.amount)
      return acc
    }, {} as Record<string, number>)

  const sortedExpenses = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const data = sortedExpenses.length <= 5 ? sortedExpenses : [
    ...sortedExpenses.slice(0, 4),
    {
      name: 'Others',
      value: sortedExpenses.slice(5).reduce((sum, item) => sum + item.value, 0)
    }
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042",, "#AA8042"]

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

