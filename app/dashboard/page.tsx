"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { MessageSquare, Users, Zap, TrendingUp, ArrowUp, ArrowDown, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'

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
      title: 'Messages (24h)',
      value: data?.stats.totalMessages24h ?? 0,
      change: '+12%',
      positive: true,
      icon: MessageSquare,
      color: 'cyan'
    },
    {
      title: 'Active Leads',
      value: data?.stats.activeLeads ?? 0,
      change: '+8%',
      positive: true,
      icon: Users,
      color: 'magenta'
    },
    {
      title: 'Token Usage',
      value: data?.stats.estimatedTokens ?? 0,
      change: '-3%',
      positive: true,
      icon: Zap,
      color: 'lime'
    },
    {
      title: 'Conversion',
      value: `${data?.stats.conversionRate ?? 0}%`,
      change: '+5%',
      positive: true,
      icon: TrendingUp,
      color: 'amber'
    },
  ]

  const colorMap: Record<string, string> = {
    cyan: 'var(--accent-cyan)',
    magenta: 'var(--accent-magenta)',
    lime: 'var(--accent-lime)',
    amber: 'var(--accent-amber)'
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
            Mission Control
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Real-time intelligence across all channels</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-lime)] animate-pulse" />
          <span className="text-xs font-mono text-[var(--text-tertiary)]">LIVE</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card 
            key={stat.title} 
            className="group p-5 bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'cyan' ? 'bg-[var(--accent-cyan)]/10' :
                stat.color === 'magenta' ? 'bg-[var(--accent-magenta)]/10' :
                stat.color === 'lime' ? 'bg-[var(--accent-lime)]/10' :
                'bg-[var(--accent-amber)]/10'
              }`}>
                <stat.icon 
                  className="h-5 w-5" 
                  style={{ color: colorMap[stat.color] }}
                />
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono ${
                stat.positive ? 'text-[var(--accent-lime)]' : 'text-[var(--accent-red)]'
              }`}>
                {stat.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold font-mono mb-1" style={{ color: colorMap[stat.color] }}>
              {loading ? '---' : stat.value}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{stat.title}</div>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)]">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-semibold">Traffic Overview</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Message volume across platforms</p>
        </div>
        <div className="h-[350px] p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[var(--text-tertiary)] font-mono">
              Loading telemetry...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chartData || []}>
                <defs>
                  <linearGradient id="colorFacebook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E879F9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E879F9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  axisLine={{ stroke: '#27272A' }}
                />
                <YAxis 
                  stroke="#71717a" 
                  tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#27272A' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0B', 
                    border: '1px solid #27272A', 
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono'
                  }}
                  labelStyle={{ color: '#A1A1AA' }}
                />
                <Legend 
                  wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="facebook" 
                  stroke="#22D3EE" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFacebook)"
                />
                <Area 
                  type="monotone" 
                  dataKey="instagram" 
                  stroke="#E879F9" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInstagram)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <a href="/dashboard/chats" className="group p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-cyan)] transition-all duration-200">
          <MessageSquare className="h-8 w-8 text-[var(--accent-cyan)] mb-4" />
          <h3 className="font-semibold mb-1">Communications</h3>
          <p className="text-sm text-[var(--text-secondary)]">View and manage conversations</p>
        </a>
        <a href="/dashboard/configs" className="group p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-magenta)] transition-all duration-200">
          <Settings className="h-8 w-8 text-[var(--accent-magenta)] mb-4" />
          <h3 className="font-semibold mb-1">Neural Networks</h3>
          <p className="text-sm text-[var(--text-secondary)]">Configure AI agents</p>
        </a>
        <a href="/privacy" className="group p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-lime)] transition-all duration-200">
          <Zap className="h-8 w-8 text-[var(--accent-lime)] mb-4" />
          <h3 className="font-semibold mb-1">Privacy Policy</h3>
          <p className="text-sm text-[var(--text-secondary)]">View compliance documentation</p>
        </a>
      </div>
    </div>
  )
}
