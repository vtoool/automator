import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-[800px] mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: February 25, 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground leading-7">
              We provide AI-driven messaging automation services for business pages on Facebook and Instagram. 
              Our platform helps businesses manage customer conversations by using artificial intelligence to 
              automate responses while maintaining a personal touch.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Data Collection</h2>
            <p className="text-muted-foreground leading-7">
              To provide our AI messaging services, we collect the following information from users who 
              interact with our clients' Facebook and Instagram pages:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-7 space-y-2 ml-4">
              <li>Facebook/Instagram User ID</li>
              <li>User display name (as provided by Meta)</li>
              <li>Chat history and message content</li>
              <li>Conversation metadata (timestamps, platform information)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Third-Party Processing</h2>
            <p className="text-muted-foreground leading-7">
              We work with trusted third-party service providers to deliver our services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-7 space-y-2 ml-4">
              <li><strong>Groq</strong> - AI language model processing for generating intelligent responses</li>
              <li><strong>Meta</strong> - Facebook and Instagram messaging platform infrastructure</li>
              <li><strong>Supabase</strong> - Secure cloud database for data storage</li>
            </ul>
            <p className="text-muted-foreground leading-7 mt-4">
              All third-party providers are contractually obligated to maintain appropriate security 
              measures and comply with applicable data protection regulations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Data Retention</h2>
            <p className="text-muted-foreground leading-7">
              Chat history is retained for a period of <strong>30 days</strong> from the date of the conversation. 
              This retention period is necessary to maintain conversation context and provide coherent AI responses. 
              Business owners may manually delete individual conversations or lead data at any time through 
              our dashboard, which will result in immediate removal from our systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Data Deletion</h2>
            <p className="text-muted-foreground leading-7">
              Users have the right to request deletion of their chat data at any time. To request data deletion, 
              please contact us at <strong>support@automator.com</strong> with your request. We will process 
              your request within 30 days and confirm once your data has been removed from our systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. GDPR & Compliance</h2>
            <p className="text-muted-foreground leading-7">
              We are committed to protecting user privacy and complying with applicable data protection 
              regulations, including the General Data Protection Regulation (GDPR). We do not sell, trade, 
              or transfer your personal information to third parties for marketing purposes. User data is 
              only processed for the purpose of providing our AI messaging services as described in this policy.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <p className="text-muted-foreground leading-7">
              If you have any questions about this Privacy Policy, please contact us at 
              <strong> support@automator.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
