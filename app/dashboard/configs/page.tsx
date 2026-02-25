"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Power, Trash2, Plus, Server, Key, Brain, CheckCircle2, XCircle } from 'lucide-react'

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
  const [saving, setSaving] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<number | null>(null)
  const [formData, setFormData] = useState<Record<number, Partial<BotConfig>>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/bot-configs')
      const data = await res.json()
      setConfigs(data.configs || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch configs:', error)
      setLoading(false)
    }
  }

  const handleEdit = (config: BotConfig) => {
    setEditMode(config.id)
    setFormData(prev => ({
      ...prev,
      [config.id]: {
        page_name: config.page_name,
        system_prompt: config.system_prompt,
        access_token: config.access_token,
        is_active: config.is_active,
      }
    }))
  }

  const handleSave = async (id: number) => {
    setSaving(id)
    try {
      const res = await fetch('/api/bot-configs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...formData[id],
        }),
      })
      
      if (res.ok) {
        await fetchConfigs()
        setEditMode(null)
      }
    } catch (error) {
      console.error('Failed to save config:', error)
    }
    setSaving(null)
  }

  const handleCancel = () => {
    setEditMode(null)
    setFormData({})
    setDeleteConfirm(null)
  }

  const toggleActive = async (config: BotConfig) => {
    try {
      await fetch('/api/bot-configs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          is_active: !config.is_active,
        }),
      })
      await fetchConfigs()
    } catch (error) {
      console.error('Failed to toggle active:', error)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">Neural Networks</h1>
          <p className="text-[var(--text-secondary)] text-sm">Configure your AI agents</p>
        </div>
        <Button className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)] transition-all font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Add New Agent
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : configs.length === 0 ? (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-12 text-center">
          <Server className="h-16 w-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
          <h3 className="text-lg font-semibold mb-2">No AI Agents Configured</h3>
          <p className="text-[var(--text-secondary)] mb-6">Add your first bot configuration to get started</p>
          <Button className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)]">
            <Plus className="h-4 w-4 mr-2" />
            Add New Agent
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {configs.map((config) => (
            <Card 
              key={config.id} 
              className={`bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden transition-all duration-200 ${
                editMode === config.id ? 'ring-2 ring-[var(--accent-cyan)]' : ''
              }`}
            >
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    config.is_active ? 'bg-[var(--accent-cyan)]/10' : 'bg-[var(--bg-elevated)]'
                  }`}>
                    <Brain className={`h-6 w-6 ${config.is_active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-tertiary)]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {editMode === config.id ? (
                          <Input
                            value={formData[config.id]?.page_name || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [config.id]: { ...prev[config.id], page_name: e.target.value }
                            }))}
                            className="h-8 w-64 bg-[var(--bg-elevated)]"
                          />
                        ) : (
                          config.page_name || config.page_id
                        )}
                      </h3>
                      {editMode !== config.id && (
                        <Badge variant={config.is_active ? 'success' : 'default'}>
                          {config.is_active ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] font-mono mt-1">{config.page_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMode === config.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(config.id)}
                        disabled={saving === config.id}
                        className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)]"
                      >
                        {saving === config.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleActive(config)}
                        className={`p-2 rounded-lg transition-colors ${
                          config.is_active 
                            ? 'text-[var(--accent-lime)] hover:bg-[var(--accent-lime)]/10' 
                            : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]'
                        }`}
                        title={config.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="h-5 w-5" />
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(config)}
                      >
                        Configure
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-3">
                    <Brain className="h-4 w-4" />
                    System Prompt
                  </label>
                  {editMode === config.id ? (
                    <Textarea
                      value={formData[config.id]?.system_prompt || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [config.id]: { ...prev[config.id], system_prompt: e.target.value }
                      }))}
                      rows={6}
                      className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] font-mono text-sm"
                      placeholder="Enter system prompt..."
                    />
                  ) : (
                    <div className="bg-[var(--bg-elevated)] rounded-lg p-4 text-sm text-[var(--text-secondary)] max-h-32 overflow-auto font-mono">
                      {config.system_prompt || <span className="italic text-[var(--text-tertiary)]">No prompt configured</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-3">
                    <Key className="h-4 w-4" />
                    Access Token
                  </label>
                  {editMode === config.id ? (
                    <Input
                      value={formData[config.id]?.access_token || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [config.id]: { ...prev[config.id], access_token: e.target.value }
                      }))}
                      type="password"
                      className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] font-mono"
                      placeholder="Enter access token..."
                    />
                  ) : (
                    <Input
                      value={config.access_token ? '••••••••••••••••••••••••' : ''}
                      disabled
                      type="password"
                      className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-tertiary)] font-mono"
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
