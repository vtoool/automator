import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Zap, BarChart3, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Automator</span>
          </div>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            AI-Powered Messaging for Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automate your Facebook and Instagram customer conversations with intelligent AI. 
            Never miss a lead again.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Privacy Policy
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <div className="p-6 rounded-lg border bg-card">
            <MessageSquare className="h-10 w-10 mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Smart Automation</h3>
            <p className="text-muted-foreground">
              AI-powered responses that understand context and engage customers naturally.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <Zap className="h-10 w-10 mb-4 text-yellow-500" />
            <h3 className="text-xl font-semibold mb-2">Instant Replies</h3>
            <p className="text-muted-foreground">
              Respond to every inquiry instantly, 24/7. Never let a potential customer wait.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <BarChart3 className="h-10 w-10 mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Track conversations, leads, and conversion rates with real-time analytics.
            </p>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mt-20 p-8 rounded-lg border bg-card text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
          <h2 className="text-2xl font-semibold mb-2">Your Data is Secure</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-4">
            We take privacy seriously. Your conversation data is encrypted and stored securely. 
            We never sell your data to third parties.
          </p>
          <Link href="/privacy">
            <Button variant="outline">Read our Privacy Policy</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-[1200px] mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2026 Automator. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
