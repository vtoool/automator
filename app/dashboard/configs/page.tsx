"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Plus, Server, Key, Brain, CheckCircle2, XCircle, ChevronDown, Check } from 'lucide-react'

interface BotConfig {
  id: number
  page_id: string
  page_name: string
  system_prompt: string
  access_token: string
  is_active: boolean
  created_at: string
}

export default function ConfigsPage() {
  const [configs, setConfigs] = useState<BotConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/bot-configs')
      const data = await res.json()
      const configList = data.configs || []
      setConfigs(configList)
      if (configList.length > 0 && !selectedBot) {
        setSelectedBot(configList[0])
        setEditPrompt(configList[0].system_prompt || '')
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch configs:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedBot) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/bot-configs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: selectedBot.page_id,
          system_prompt: editPrompt,
        }),
      })
      
      if (res.ok) {
        await fetchConfigs()
        setSelectedBot(prev => prev ? { ...prev, system_prompt: editPrompt } : null)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save config:', error)
    }
    setSaving(false)
  }

  const selectBot = (config: BotConfig) => {
    setSelectedBot(config)
    setEditPrompt(config.system_prompt || '')
    setDropdownOpen(false)
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">Config</h1>
          <p className="text-[var(--text-secondary)] text-sm">Configure your AI agents system prompts</p>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-[var(--accent-lime)] text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4" />
          <span className="font-medium">System prompt saved successfully!</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : configs.length === 0 ? (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-12 text-center">
          <Server className="h-16 w-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
          <h3 className="text-lg font-semibold mb-2">No AI Agents Configured</h3>
          <p className="text-[var(--text-secondary)]">Add your first bot configuration to get started</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Bot Selector Dropdown */}
          {configs.length > 1 && (
            <div className="relative">
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Select Bot</label>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full md:w-80 flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent-cyan)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedBot?.is_active ? 'bg-[var(--accent-cyan)]/10' : 'bg-[var(--bg-elevated)]'
                  }`}>
                    <Brain className={`h-4 w-4 ${selectedBot?.is_active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-tertiary)]'}`} />
                  </div>
                  <span className="font-medium">{selectedBot?.page_name || selectedBot?.page_id}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-[var(--text-tertiary)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 w-full md:w-80 mt-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-10 overflow-hidden">
                  {configs.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => selectBot(config)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors ${
                        selectedBot?.id === config.id ? 'bg-[var(--accent-cyan)]/10' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        config.is_active ? 'bg-[var(--accent-cyan)]/10' : 'bg-[var(--bg-elevated)]'
                      }`}>
                        <Brain className={`h-4 w-4 ${config.is_active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-tertiary)]'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium block">{config.page_name || config.page_id}</span>
                        <span className="text-xs text-[var(--text-tertiary)] font-mono">{config.page_id}</span>
                      </div>
                      {config.is_active && (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Bot Card */}
          {selectedBot && (
            <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden">
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedBot.is_active ? 'bg-[var(--accent-cyan)]/10' : 'bg-[var(--bg-elevated)]'
                  }`}>
                    <Brain className={`h-6 w-6 ${selectedBot.is_active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-tertiary)]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{selectedBot.page_name || selectedBot.page_id}</h3>
                      <Badge variant={selectedBot.is_active ? 'success' : 'default'}>
                        {selectedBot.is_active ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] font-mono mt-1">{selectedBot.page_id}</p>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)]"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
              
              {/* System Prompt Editor */}
              <div className="p-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-3">
                  <Brain className="h-4 w-4" />
                  System Prompt
                </label>
                <Textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={25}
                  className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] font-mono text-sm min-h-[500px]"
                  placeholder="Enter system prompt..."
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  Use monospaced font for easier editing of strict markdown rules
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
