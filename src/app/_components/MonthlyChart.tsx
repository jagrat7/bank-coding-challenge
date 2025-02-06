"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { type StatementDetails } from "../dashboard/_actions/get-statement-details"

export default function MonthlyChart({ statement }: { statement: StatementDetails }) {
  // In a real application, you would fetch this data based on the statementId
  // Group transactions by month
  const monthlyData = statement.transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' })
    if (!acc[month]) {
      acc[month] = { deposits: 0, withdrawals: 0 }
    }
    if (t.type === 'deposit') {
      acc[month].deposits += t.amount
    } else {
      acc[month].withdrawals += Math.abs(t.amount)
    }
    return acc
  }, {} as Record<string, { deposits: number, withdrawals: number }>)

  const data = Object.entries(monthlyData)
    .map(([name, values]) => ({
      name,
      deposits: values.deposits,
      withdrawals: values.withdrawals
    }))
    .sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return months.indexOf(a.name) - months.indexOf(b.name)
    })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="deposits" stroke="#8884d8" />
        <Line type="monotone" dataKey="withdrawals" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  )
}

