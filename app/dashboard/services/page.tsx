"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Power, Trash2, Plus, Package, DollarSign, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  price: string
  is_active: boolean
  created_at: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, Partial<Service>>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newService, setNewService] = useState({ name: '', description: '', price: '' })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(data.services || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setLoading(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditMode(service.id)
    setFormData(prev => ({
      ...prev,
      [service.id]: {
        name: service.name,
        description: service.description,
        price: service.price,
        is_active: service.is_active,
      }
    }))
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...formData[id],
        }),
      })

      if (res.ok) {
        await fetchServices()
        setEditMode(null)
      }
    } catch (error) {
      console.error('Failed to save service:', error)
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setEditMode(null)
    setFormData({})
    setDeleteConfirm(null)
  }

  const toggleActive = async (service: Service) => {
    try {
      await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          is_active: !service.is_active,
        }),
      })
      await fetchServices()
    } catch (error) {
      console.error('Failed to toggle active:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
      })
      await fetchServices()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  const handleAddService = async () => {
    if (!newService.name || !newService.price) return

    setSaving(true)
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      })

      if (res.ok) {
        await fetchServices()
        setShowAddForm(false)
        setNewService({ name: '', description: '', price: '' })
      }
    } catch (error) {
      console.error('Failed to add service:', error)
    }
    setSaving(false)
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">Service Packages</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage your pricing and service offerings</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)] transition-all font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      </div>

      {/* Add Service Form Modal */}
      {showAddForm && (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Service</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                <Package className="h-4 w-4" />
                Service Name
              </label>
              <Input
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Basic Website, E-commerce Platform"
                className="bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                <FileText className="h-4 w-4" />
                Description
              </label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What is included in this service..."
                rows={3}
                className="bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                <DollarSign className="h-4 w-4" />
                Price
              </label>
              <Input
                value={newService.price}
                onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                placeholder="e.g., $499, Starting at $999, Contact for quote"
                className="bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAddService}
                disabled={saving || !newService.name || !newService.price}
                className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)]"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Service
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNewService({ name: '', description: '', price: '' })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Services List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : services.length === 0 ? (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
          <h3 className="text-lg font-semibold mb-2">No Services Configured</h3>
          <p className="text-[var(--text-secondary)] mb-6">Add your first service package to get started</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className={`bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden transition-all duration-200 ${
                editMode === service.id ? 'ring-2 ring-[var(--accent-cyan)]' : ''
              } ${!service.is_active ? 'opacity-60' : ''}`}
            >
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    service.is_active ? 'bg-[var(--accent-cyan)]/10' : 'bg-[var(--bg-elevated)]'
                  }`}>
                    <Package className={`h-6 w-6 ${service.is_active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-tertiary)]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {editMode === service.id ? (
                          <Input
                            value={formData[service.id]?.name || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [service.id]: { ...prev[service.id], name: e.target.value }
                            }))}
                            className="h-8 w-64 bg-[var(--bg-elevated)]"
                          />
                        ) : (
                          service.name
                        )}
                      </h3>
                      {editMode !== service.id && (
                        <Badge variant={service.is_active ? 'success' : 'default'}>
                          {service.is_active ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-mono mt-1 text-[var(--accent-lime)]">
                      {editMode === service.id ? (
                        <Input
                          value={formData[service.id]?.price || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [service.id]: { ...prev[service.id], price: e.target.value }
                          }))}
                          className="h-7 w-40 bg-[var(--bg-elevated)]"
                          placeholder="Price"
                        />
                      ) : (
                        service.price
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMode === service.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(service.id)}
                        disabled={saving}
                        className="bg-[var(--accent-cyan)] text-black hover:shadow-[var(--glow-cyan)]"
                      >
                        {saving ? (
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
                  ) : deleteConfirm === service.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(service.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleActive(service)}
                        className={`p-2 rounded-lg transition-colors ${
                          service.is_active 
                            ? 'text-[var(--accent-lime)] hover:bg-[var(--accent-lime)]/10' 
                            : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]'
                        }`}
                        title={service.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="h-5 w-5" />
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(service)}
                      >
                        Edit
                      </Button>
                      <button
                        onClick={() => setDeleteConfirm(service.id)}
                        className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-3">
                  <FileText className="h-4 w-4" />
                  Description
                </label>
                {editMode === service.id ? (
                  <Textarea
                    value={formData[service.id]?.description || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [service.id]: { ...prev[service.id], description: e.target.value }
                    }))}
                    rows={4}
                    className="bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
                    placeholder="Describe what this service includes..."
                  />
                ) : (
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-4 text-sm text-[var(--text-secondary)] min-h-[80px]">
                    {service.description || <span className="italic text-[var(--text-tertiary)]">No description provided</span>}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-amber)]/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--accent-amber)] mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-[var(--accent-amber)]">AI Sales Bot Integration</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Active services are automatically available to your AI sales bot. When customers ask about pricing or services, 
              the bot will use Groq tool calling to fetch and present these packages naturally in conversation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
