import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function MonthlyChart({ statementId }: { statementId: string }) {
  // In a real application, you would fetch this data based on the statementId
  const data = [
    { name: "Jan", deposits: 4000, withdrawals: 2400 },
    { name: "Feb", deposits: 3000, withdrawals: 1398 },
    { name: "Mar", deposits: 2000, withdrawals: 9800 },
    { name: "Apr", deposits: 2780, withdrawals: 3908 },
    { name: "May", deposits: 1890, withdrawals: 4800 },
    { name: "Jun", deposits: 2390, withdrawals: 3800 },
  ]

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

