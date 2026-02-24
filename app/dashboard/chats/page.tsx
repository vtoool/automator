"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Send } from 'lucide-react'

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

function classifyIntent(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) return 'Inquiry'
  if (lower.includes('interested') || lower.includes('want') || lower.includes('buy')) return 'Interested'
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return 'Greeting'
  if (lower.includes('thanks') || lower.includes('thank')) return 'Nudged'
  return 'Inquiry'
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function ChatMonitorPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedSender, setSelectedSender] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
    
    // Poll for new messages every 5 seconds
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

  return (
    <div className="p-6 h-[calc(100vh-2rem)]">
      <h2 className="text-2xl font-bold mb-4">Chat Monitor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
        {/* Left: Conversation List */}
        <Card className="bg-zinc-900 border-zinc-800 col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="p-4 text-zinc-500">Loading...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-zinc-500">No conversations found</div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.sender_id}
                      onClick={() => setSelectedSender(conv.sender_id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSender === conv.sender_id
                          ? 'bg-zinc-800'
                          : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-white truncate">
                          {conv.sender_id.substring(0, 12)}...
                        </span>
                        <Badge variant={classifyIntent(conv.last_message || '') === 'Interested' ? 'success' : 'warning'}>
                          {classifyIntent(conv.last_message || '')}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 truncate">
                        {conv.last_message || 'No messages'}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {conv.last_timestamp ? formatTime(conv.last_timestamp) : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Chat Window */}
        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-2 flex flex-col">
          <CardHeader className="border-b border-zinc-800 pb-3">
            <CardTitle className="text-white text-base">
              {selectedSender ? `Conversation with ${selectedSender}` : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            {selectedSender ? (
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-zinc-800 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.message_text}</p>
                        <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-zinc-500' : 'text-blue-200'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Select a conversation to view messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
