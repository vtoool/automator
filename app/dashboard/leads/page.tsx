"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, Search, Filter, Mail, Phone, Calendar, MessageSquare } from 'lucide-react'

interface Lead {
  id: string
  page_id: string
  sender_id: string
  name: string | null
  email: string | null
  phone: string | null
  interested_service: string | null
  status: string
  objection: string | null
  last_interaction: string
  created_at: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead': return 'default'
      case 'Thinking': return 'warning'
      case 'Closed': return 'success'
      case 'Lost': return 'destructive'
      default: return 'default'
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.sender_id.includes(searchTerm) ||
      lead.interested_service?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">Leads CRM</h1>
          <p className="text-[var(--text-secondary)] text-sm">Track and manage your leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {leads.length} Total
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-[var(--accent-lime)]">
            {leads.filter(l => l.status === 'Lead').length} New
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-[var(--accent-cyan)]">
            {leads.filter(l => l.status === 'Thinking').length} Thinking
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-[var(--accent-magenta)]">
            {leads.filter(l => l.status === 'Closed').length} Closed
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by name, email, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-cyan)]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'Lead', 'Thinking', 'Closed', 'Lost'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'bg-[var(--accent-cyan)] text-black' : ''}
            >
              {status === 'all' ? 'All' : status}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
          <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
          <p className="text-[var(--text-secondary)]">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Leads will appear here when the AI collects user information'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <Card 
              key={lead.id} 
              className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-6 hover:border-[var(--accent-cyan)] transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Lead Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                    <Users className="h-5 w-5 text-[var(--accent-cyan)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{lead.name || 'Unknown'}</h3>
                      <Badge variant={getStatusColor(lead.status)} className="text-xs">
                        {lead.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] font-mono">{lead.sender_id}</p>
                    {lead.interested_service && (
                      <p className="text-sm text-[var(--accent-cyan)] mt-1">
                        Interested in: {lead.interested_service}
                      </p>
                    )}
                    {lead.objection && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 italic">
                        Objection: {lead.objection}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact & Meta */}
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    {lead.email ? (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>{lead.email}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
                        <span className="text-[var(--text-tertiary)]">No email</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    {lead.phone ? (
                      <>
                        <Phone className="h-4 w-4" />
                        <span>{lead.phone}</span>
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 text-[var(--text-tertiary)]" />
                        <span className="text-[var(--text-tertiary)]">No phone</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Last: {formatDate(lead.last_interaction)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
