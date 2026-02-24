"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Power, PowerOff } from 'lucide-react'

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
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Client Configurations</h2>
        <p className="text-muted-foreground">Manage your AI bot configurations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      ) : configs.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center text-zinc-500">
            No bot configurations found. Add one in Supabase.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {configs.map((config) => (
            <Card key={config.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg text-white">
                      {editMode === config.id ? (
                        <Input
                          value={formData[config.id]?.page_name || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [config.id]: { ...prev[config.id], page_name: e.target.value }
                          }))}
                          className="h-8 w-64"
                        />
                      ) : (
                        config.page_name || config.page_id
                      )}
                    </CardTitle>
                    {editMode !== config.id && (
                      <Badge variant={config.is_active ? 'success' : 'secondary'}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editMode === config.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(config.id)}
                          disabled={saving === config.id}
                        >
                          {saving === config.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(config)}
                        >
                          {config.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Page ID</label>
                  <Input
                    value={config.page_id}
                    disabled
                    className="bg-zinc-800 border-zinc-700 text-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">System Prompt</label>
                  {editMode === config.id ? (
                    <Textarea
                      value={formData[config.id]?.system_prompt || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [config.id]: { ...prev[config.id], system_prompt: e.target.value }
                      }))}
                      rows={6}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  ) : (
                    <div className="bg-zinc-800 rounded-md p-3 text-sm text-zinc-300 max-h-32 overflow-auto">
                      {config.system_prompt || 'No prompt set'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Access Token</label>
                  {editMode === config.id ? (
                    <Input
                      value={formData[config.id]?.access_token || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [config.id]: { ...prev[config.id], access_token: e.target.value }
                      }))}
                      type="password"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  ) : (
                    <Input
                      value={config.access_token ? '••••••••••••••••' : ''}
                      disabled
                      type="password"
                      className="bg-zinc-800 border-zinc-700 text-zinc-500"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
