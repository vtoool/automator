"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Zap, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AnalyticsData {
  stats: {
    totalMessages24h: number
    activeLeads: number
    estimatedTokens: number
    conversionRate: number
  }
  chartData: Array<{
    date: string
    facebook: number
    instagram: number
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const stats = [
    {
      title: 'Total Messages (24h)',
      value: data?.stats.totalMessages24h ?? 0,
      icon: MessageSquare,
      description: 'Messages received in the last 24 hours',
    },
    {
      title: 'Active Leads',
      value: data?.stats.activeLeads ?? 0,
      icon: Users,
      description: 'Unique users in the last 24 hours',
    },
    {
      title: 'AI Token Usage (Est.)',
      value: data?.stats.estimatedTokens ?? 0,
      icon: Zap,
      description: 'Estimated tokens used by AI',
    },
    {
      title: 'Conversion Rate',
      value: `${data?.stats.conversionRate ?? 0}%`,
      icon: TrendingUp,
      description: 'Users who received calendly links',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your AI agents performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : stat.value}
              </div>
              <p className="text-xs text-zinc-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Message Volume (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="facebook" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="instagram" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
