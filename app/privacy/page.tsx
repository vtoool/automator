import Link from 'next/link'
import { ArrowLeft, Shield, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] p-6">
      <div className="max-w-[800px] mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-8 hover:bg-[var(--bg-elevated)] hover:text-[var(--accent-cyan)] transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-10">
          {/* Header */}
          <div className="border-b border-[var(--border-subtle)] pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-cyan)]/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[var(--accent-cyan)]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Privacy Policy</h1>
            <p className="text-[var(--text-secondary)]">Last Updated: February 25, 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>1. Introduction</h2>
            <p className="text-[var(--text-secondary)] leading-7">
              We provide AI-driven messaging automation services for business pages on Facebook and Instagram. 
              Our platform helps businesses manage customer conversations by using artificial intelligence to 
              automate responses while maintaining a personal touch.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>2. Data Collection</h2>
            <p className="text-[var(--text-secondary)] leading-7">
              To provide our AI messaging services, we collect the following information from users who 
              interact with our clients' Facebook and Instagram pages:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] leading-7 space-y-2 ml-4">
              <li>Facebook/Instagram User ID</li>
              <li>User display name (as provided by Meta)</li>
              <li>Chat history and message content</li>
              <li>Conversation metadata (timestamps, platform information)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>3. Third-Party Processing</h2>
            <p className="text-[var(--text-secondary)] leading-7">
              We work with trusted third-party service providers to deliver our services:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] leading-7 space-y-2 ml-4">
              <li><span className="text-[var(--accent-cyan)]">Groq</span> — AI language model processing for generating intelligent responses</li>
              <li><span className="text-[var(--accent-magenta)]">Meta</span> — Facebook and Instagram messaging platform infrastructure</li>
              <li><span className="text-[var(--accent-lime)]">Supabase</span> — Secure cloud database for data storage</li>
            </ul>
            <p className="text-[var(--text-secondary)] leading-7 mt-4">
              All third-party providers are contractually obligated to maintain appropriate security 
              measures and comply with applicable data protection regulations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>4. Data Retention</h2>
            <p className="text-[var(--text-secondary)] leading-7">
              Chat history is retained for a period of <span className="text-[var(--accent-amber)] font-semibold">30 days</span> from the date of the conversation. 
              This retention period is necessary to maintain conversation context and provide coherent AI responses. 
              Business owners may manually delete individual conversations or lead data at any time through 
              our dashboard, which will result in immediate removal from our systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>5. Data Deletion</h2>
            <p className="text-[var(--text-secondary)] leading-7">
              Users have the right to request deletion of their chat data at any time. To request data deletion, 
              please contact us at{' '}
              <span className="inline-flex items-center gap-1 text-[var(--accent-cyan)] font-semibold">
                <Mail className="h-4 w-4" />
                support@automator.com
              </span>
              {' '}with your request. We will process your request within 30 days and confirm once your data has been removed from our systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>6. GDPR & Compliance</h2>
            <p className="text-[var(--text-secondary)] leading-7">
              We are committed to protecting user privacy and complying with applicable data protection 
              regulations, including the General Data Protection Regulation (GDPR). We do not sell, trade, 
              or transfer your personal information to third parties for marketing purposes. User data is 
              only processed for the purpose of providing our AI messaging services as described in this policy.
            </p>
          </section>

          <section className="pt-8 border-t border-[var(--border-subtle)]">
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <h3 className="font-semibold mb-2">Questions?</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                If you have any questions about this Privacy Policy, please contact us.
              </p>
              <a href="mailto:support@automator.com">
                <Button className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)] transition-all font-semibold">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
