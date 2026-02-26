import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cpu, ArrowLeft, CheckCircle2, Clock, Eye, XCircle } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
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
    icon: Clock,
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

export default function ClientOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  return (
    <ClientOrderContent params={params} />
  )
}

async function ClientOrderContent({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Configuration error. Please contact support.</p>
        </div>
      </div>
    )
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            We couldn't find an order with this ID. The link may be invalid or expired.
          </p>
          <Link href="/">
            <Button className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig['Pending Configuration']
  const StatusIcon = status.icon
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] flex items-center justify-center">
              <Cpu className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold font-mono">AUTOMATOR</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-cyan)]/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-[var(--accent-cyan)]" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
          <p className="text-[var(--text-secondary)]">
            Your order has been confirmed, {order.client_name}!
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          {/* Status Badge */}
          <div className={`px-6 py-4 ${status.bg} border-b border-[var(--border-subtle)] flex items-center justify-center gap-2`}>
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1 block">
                  Client Name
                </label>
                <p className="text-lg font-semibold">{order.client_name}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1 block">
                  Order Date
                </label>
                <p className="text-lg">{orderDate}</p>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-6">
              <label className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2 block">
                Service Ordered
              </label>
              <p className="text-xl font-semibold text-[var(--accent-cyan)]">
                {order.service_name}
              </p>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-6">
              <label className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2 block">
                Agreed Price
              </label>
              <p className="text-3xl font-bold text-[var(--accent-lime)]">
                {order.agreed_price}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-8 p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-center">
          <p className="text-[var(--text-secondary)]">
            Victor (your human counterpart) will review your order details shortly. 
            You'll receive updates on your order status right here on this page.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">
            Order ID: {order.id}
          </p>
        </div>
      </main>
    </div>
  )
}
