"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Send, MessageCircle, Facebook, Instagram, MoreVertical, Phone, Archive } from 'lucide-react'

interface Conversation {
  sender_id: string
  last_message: string
  last_role: string
  last_timestamp: string
}

interface Message {
  id: number
  sender_id: string
  role: string
  message_text: string
  platform: string
  created_at: string
}

function classifyIntent(message: string): { label: string; variant: 'success' | 'warning' | 'info' | 'default' } {
  const lower = message.toLowerCase()
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) return { label: 'Inquiry', variant: 'warning' }
  if (lower.includes('interested') || lower.includes('want') || lower.includes('buy')) return { label: 'Interested', variant: 'success' }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return { label: 'New', variant: 'info' }
  if (lower.includes('thanks') || lower.includes('thank')) return { label: 'Nudged', variant: 'default' }
  return { label: 'Inquiry', variant: 'warning' }
}

function getInitials(senderId: string): string {
  return senderId.substring(0, 2).toUpperCase()
}

function getAvatarColor(senderId: string): string {
  const colors = [
    'bg-[var(--accent-cyan)]',
    'bg-[var(--accent-magenta)]', 
    'bg-[var(--accent-lime)]',
    'bg-[var(--accent-amber)]',
  ]
  const index = senderId.charCodeAt(0) % colors.length
  return colors[index]
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ChatMonitorPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedSender, setSelectedSender] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedSender) {
      fetchMessages(selectedSender)
    }
  }, [selectedSender])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setConversations(data.conversations || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (senderId: string) => {
    try {
      const res = await fetch(`/api/messages?sender_id=${senderId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const filteredConversations = conversations.filter(c =>
    c.sender_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConversation = conversations.find(c => c.sender_id === selectedSender)
  const intent = selectedConversation ? classifyIntent(selectedConversation.last_message || '') : null

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-[var(--border-subtle)]">
        <h1 className="text-2xl font-bold font-mono">Communications</h1>
        <p className="text-[var(--text-secondary)] text-sm">Monitor and manage conversations</p>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {/* Search */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-[var(--text-tertiary)] text-sm">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-[var(--text-tertiary)] text-sm">No conversations found</div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {filteredConversations.map((conv) => {
                  const convIntent = classifyIntent(conv.last_message || '')
                  return (
                    <button
                      key={conv.sender_id}
                      onClick={() => setSelectedSender(conv.sender_id)}
                      className={`w-full text-left p-4 hover:bg-[var(--bg-elevated)] transition-colors ${
                        selectedSender === conv.sender_id ? 'bg-[var(--bg-elevated)] border-l-2 border-[var(--accent-cyan)]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(conv.sender_id)} flex items-center justify-center text-black font-bold text-sm flex-shrink-0`}>
                          {getInitials(conv.sender_id)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm truncate">
                              {conv.sender_id.substring(0, 16)}...
                            </span>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {conv.last_timestamp ? formatTime(conv.last_timestamp) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] truncate mb-2">
                            {conv.last_message || 'No messages'}
                          </p>
                          <Badge variant={convIntent.variant as 'success' | 'warning' | 'info' | 'default'} className="text-[10px]">
                            {convIntent.label}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Chat Window */}
        <div className="hidden md:flex flex-1 flex-col bg-[var(--bg-void)]">
          {selectedSender ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(selectedSender)} flex items-center justify-center text-black font-bold text-sm`}>
                      {getInitials(selectedSender)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{selectedSender}</h3>
                      <div className="flex items-center gap-2">
                        <Facebook className="h-3 w-3 text-[var(--accent-cyan)]" />
                        {intent && <Badge variant={intent.variant as 'success' | 'warning' | 'info' | 'default'} className="text-[10px]">{intent.label}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                      <Archive className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-[var(--accent-magenta)] text-white'
                            : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        <p className="text-sm">{msg.message_text}</p>
                        <p className={`text-[10px] mt-2 ${
                          msg.role === 'user' ? 'text-white/60' : 'text-[var(--text-tertiary)]'
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Input */}
              <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Type a message..."
                    className="bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
                  />
                  <button className="p-3 rounded-lg bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)] transition-all">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-tertiary)]">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
