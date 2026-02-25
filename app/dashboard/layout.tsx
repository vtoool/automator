"use client"

import Link from 'next/link'
import { BarChart3, MessageSquare, Settings, Cpu, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Mission Control', href: '/dashboard', icon: BarChart3 },
  { name: 'Communications', href: '/dashboard/chats', icon: MessageSquare },
  { name: 'Neural Networks', href: '/dashboard/configs', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] flex items-center justify-center">
              <Cpu className="h-4 w-4 text-black" />
            </div>
            <span className="font-mono font-bold text-sm">AUTOMATOR</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-[var(--bg-elevated)]"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="flex pt-14 lg:pt-0">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex h-16 items-center gap-3 border-b border-[var(--border-subtle)] px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] flex items-center justify-center">
                <Cpu className="h-5 w-5 text-black" />
              </div>
              <span className="font-mono font-bold">AUTOMATOR</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-150 group"
              >
                <item.icon className="h-5 w-5 group-hover:text-[var(--accent-cyan)] transition-colors" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-[var(--border-subtle)] p-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-lime)] animate-pulse" />
              <span className="text-xs text-[var(--text-tertiary)]">All systems operational</span>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
