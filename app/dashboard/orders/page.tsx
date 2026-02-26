"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShoppingCart, Clock, CheckCircle2, XCircle, Eye, Play } from 'lucide-react'

interface Order {
  id: string
  client_name: string
  client_contact: string
  service_name: string
  agreed_price: string
  status: string
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  'Pending Configuration': {
    label: 'Pending Configuration',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    icon: Clock,
  },
  'In Progress': {
    label: 'In Progress',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    icon: Play,
  },
  'Awaiting Client Review': {
    label: 'Awaiting Client Review',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    icon: Eye,
  },
  'Completed': {
    label: 'Completed',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    icon: CheckCircle2,
  },
  'Cancelled': {
    label: 'Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    icon: XCircle,
  },
}

const statusOptions = [
  { value: 'Pending Configuration', label: 'Pending Configuration', icon: Clock },
  { value: 'In Progress', label: 'In Progress', icon: Play },
  { value: 'Awaiting Client Review', label: 'Awaiting Client Review', icon: Eye },
  { value: 'Completed', label: 'Completed', icon: CheckCircle2 },
  { value: 'Cancelled', label: 'Cancelled', icon: XCircle },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (res.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    }
    setUpdating(null)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">Orders</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage client orders and track progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-[var(--bg-elevated)]">
            {orders.length} Total
          </Badge>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
          <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
          <p className="text-[var(--text-secondary)]">
            Orders will appear here when Victor closes a deal with a client.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig['Pending Configuration']
            const StatusIcon = status.icon
            
            return (
              <Card 
                key={order.id} 
                className="bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{order.client_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-1">
                        {order.service_name}
                      </p>
                      <p className="text-xl font-bold text-[var(--accent-lime)] mb-2">
                        {order.agreed_price}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                        <span>Contact: {order.client_contact}</span>
                        <span>•</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                        Update Status
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] disabled:opacity-50"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary Cards */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusOptions.map((option) => {
            const count = orders.filter(o => o.status === option.value).length
            const config = statusConfig[option.value]
            const Icon = config.icon
            
            return (
              <Card 
                key={option.value}
                className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{option.label}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
