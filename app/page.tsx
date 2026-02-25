import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Zap, BarChart3, Shield, ArrowRight, Cpu, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-void)]/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] flex items-center justify-center">
              <Cpu className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold font-mono tracking-tight">AUTOMATOR</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm">
              Privacy
            </Link>
            <Link href="/dashboard">
              <Button className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)] transition-all duration-200 font-semibold">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center grid-bg overflow-hidden pt-16">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--accent-cyan)]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--accent-magenta)]/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-[1000px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur mb-8 animate-fade-in-up">
            <span className="pulse-dot" />
            <span className="text-sm text-[var(--text-secondary)]">AI-Powered Messaging for Business</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up stagger-1" style={{ fontFamily: 'var(--font-mono)' }}>
            Your AI Agents,<br />
            <span className="gradient-text">Mission Control</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">
            Automate Facebook & Instagram conversations with intelligent AI. 
            Never miss a lead again.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-10 py-6 bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)] transition-all duration-200 font-bold">
                Enter Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-[var(--border-default)] hover:border-[var(--accent-cyan)] hover:bg-[var(--bg-elevated)] transition-all duration-200">
                Read Policy
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-[var(--border-default)] flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[var(--accent-cyan)] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'MESSAGES PROCESSED', value: '2.4M+', icon: MessageSquare, color: 'cyan' },
              { label: 'ACTIVE BOTS', value: '156', icon: Cpu, color: 'magenta' },
              { label: 'LEADS GENERATED', value: '89K', icon: Zap, color: 'lime' },
              { label: 'UPTIME', value: '99.9%', icon: Globe, color: 'amber' },
            ].map((stat, i) => (
              <div 
                key={stat.label}
                className={`card-gradient p-6 rounded-xl animate-fade-in-up stagger-${i + 1}`}
              >
                <stat.icon className={`h-8 w-8 mb-4 ${
                  stat.color === 'cyan' ? 'text-[var(--accent-cyan)]' :
                  stat.color === 'magenta' ? 'text-[var(--accent-magenta)]' :
                  stat.color === 'lime' ? 'text-[var(--accent-lime)]' :
                  'text-[var(--accent-amber)]'
                }`} />
                <div className="text-4xl font-bold font-mono mb-2" style={{ 
                  color: stat.color === 'cyan' ? 'var(--accent-cyan)' :
                  stat.color === 'magenta' ? 'var(--accent-magenta)' :
                  stat.color === 'lime' ? 'var(--accent-lime)' :
                  'var(--accent-amber)'
                }}>{stat.value}</div>
                <div className="text-xs text-[var(--text-tertiary)] tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              Neural Networks,<br />
              <span className="gradient-text">Deployed</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              Enterprise-grade AI automation meets intuitive controls
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: 'Smart Automation',
                description: 'AI-powered responses that understand context and engage customers naturally across all channels.',
                color: 'cyan'
              },
              {
                icon: Zap,
                title: 'Instant Replies',
                description: 'Respond to every inquiry instantly, 24/7. Never let a potential customer wait for a response.',
                color: 'magenta'
              },
              {
                icon: BarChart3,
                title: 'Mission Analytics',
                description: 'Track conversations, leads, and conversion rates with real-time intelligence dashboards.',
                color: 'lime'
              }
            ].map((feature, i) => (
              <div 
                key={feature.title}
                className="group p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  feature.color === 'cyan' ? 'bg-[var(--accent-cyan)]/10' :
                  feature.color === 'magenta' ? 'bg-[var(--accent-magenta)]/10' :
                  'bg-[var(--accent-lime)]/10'
                }`}>
                  <feature.icon className={`h-7 w-7 ${
                    feature.color === 'cyan' ? 'text-[var(--accent-cyan)]' :
                    feature.color === 'magenta' ? 'text-[var(--accent-magenta)]' :
                    'text-[var(--accent-lime)]'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t border-[var(--border-subtle)]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex items-center gap-4">
              <Shield className="h-12 w-12 text-[var(--accent-cyan)]" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Your Data is Secured</h3>
                <p className="text-[var(--text-secondary)]">
                  Enterprise-grade encryption. We never sell your data.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)] transition-all duration-200 font-semibold">
                  Launch Dashboard
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="outline" className="border-[var(--border-default)] hover:border-[var(--accent-cyan)]">
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[var(--border-subtle)]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
            <Cpu className="h-4 w-4" />
            <span className="font-mono text-sm">AUTOMATOR © 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <span>All systems operational</span>
            <span className="flex items-center gap-1">
              <span className="pulse-dot" />
              Online
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
