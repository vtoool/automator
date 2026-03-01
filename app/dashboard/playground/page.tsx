"use client"

import { useState, useEffect, useRef } from 'react'
import { Film, Key, Upload, Play, Download, Loader2, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModelType = 'cogvideox-3' | 'viduq1-text' | 'viduq1-image' | 'viduq1-start-end' | 'vidu2-image' | 'vidu2-start-end' | 'vidu2-reference'

interface ModelConfig {
  id: ModelType
  name: string
  description: string
  supportsImages: number
  supportsPrompt: boolean
  supportsStyle: boolean
  supportsDuration: boolean
  supportsAudio: boolean
  supportsMovement: boolean
  supportsAspectRatio: boolean
  defaultDuration: number
  defaultSize: string
  sizes: string[]
  aspects: string[]
}

const MODELS: ModelConfig[] = [
  {
    id: 'cogvideox-3',
    name: 'CogVideoX-3',
    description: 'Text/Image to Video - Supports all input types',
    supportsImages: 2,
    supportsPrompt: true,
    supportsStyle: false,
    supportsDuration: true,
    supportsAudio: true,
    supportsMovement: false,
    supportsAspectRatio: false,
    defaultDuration: 5,
    defaultSize: '1920x1080',
    sizes: ['1280x720', '720x1280', '1024x1024', '1920x1080', '1080x1920', '2048x1080', '3840x2160'],
    aspects: []
  },
  {
    id: 'viduq1-text',
    name: 'Vidu Q1 - Text',
    description: 'Text to Video - High consistency and dynamism',
    supportsImages: 0,
    supportsPrompt: true,
    supportsStyle: true,
    supportsDuration: true,
    supportsAudio: false,
    supportsMovement: true,
    supportsAspectRatio: true,
    defaultDuration: 5,
    defaultSize: '1920x1080',
    sizes: ['1920x1080'],
    aspects: ['16:9', '9:16', '1:1']
  },
  {
    id: 'viduq1-image',
    name: 'Vidu Q1 - Image',
    description: 'Image to Video - Animate your images',
    supportsImages: 1,
    supportsPrompt: true,
    supportsStyle: false,
    supportsDuration: true,
    supportsAudio: true,
    supportsMovement: true,
    supportsAspectRatio: false,
    defaultDuration: 5,
    defaultSize: '1920x1080',
    sizes: ['1920x1080'],
    aspects: []
  },
  {
    id: 'viduq1-start-end',
    name: 'Vidu Q1 - Frames',
    description: 'First & Last Frame - Seamless transitions',
    supportsImages: 2,
    supportsPrompt: true,
    supportsStyle: false,
    supportsDuration: true,
    supportsAudio: true,
    supportsMovement: true,
    supportsAspectRatio: false,
    defaultDuration: 5,
    defaultSize: '1920x1080',
    sizes: ['1920x1080'],
    aspects: []
  },
  {
    id: 'vidu2-image',
    name: 'Vidu 2 - Image',
    description: 'Image to Video (Vidu2) - Next generation',
    supportsImages: 1,
    supportsPrompt: true,
    supportsStyle: false,
    supportsDuration: true,
    supportsAudio: true,
    supportsMovement: true,
    supportsAspectRatio: false,
    defaultDuration: 4,
    defaultSize: '1280x720',
    sizes: ['1280x720'],
    aspects: []
  },
  {
    id: 'vidu2-start-end',
    name: 'Vidu 2 - Frames',
    description: 'First & Last Frame (Vidu2)',
    supportsImages: 2,
    supportsPrompt: true,
    supportsStyle: false,
    supportsDuration: true,
    supportsAudio: true,
    supportsMovement: true,
    supportsAspectRatio: false,
    defaultDuration: 4,
    defaultSize: '1280x720',
    sizes: ['1280x720'],
    aspects: []
  },
  {
    id: 'vidu2-reference',
    name: 'Vidu 2 - Reference',
    description: 'Reference Images - Consistent subjects (1-3 images)',
    supportsImages: 3,
    supportsPrompt: true,
    supportsStyle: false,
    supportsDuration: true,
    supportsAudio: true,
    supportsMovement: true,
    supportsAspectRatio: true,
    defaultDuration: 4,
    defaultSize: '1280x720',
    sizes: ['1280x720'],
    aspects: ['16:9', '9:16', '1:1']
  }
]

const API_BASE = 'https://api.z.ai/api/paas/v4'

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState('')
  const [apiKeyExpanded, setApiKeyExpanded] = useState(true)
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [style, setStyle] = useState<'general' | 'anime'>('general')
  const [duration, setDuration] = useState(5)
  const [size, setSize] = useState('1920x1080')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [fps, setFps] = useState(30)
  const [quality, setQuality] = useState<'speed' | 'quality'>('quality')
  const [withAudio, setWithAudio] = useState(false)
  const [movement, setMovement] = useState<'auto' | 'small' | 'medium' | 'large'>('auto')
  
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<'idle' | 'processing' | 'success' | 'fail'>('idle')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progressMsg, setProgressMsg] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const savedKey = localStorage.getItem('zai_api_key')
    if (savedKey) {
      setApiKey(savedKey)
      setApiKeyExpanded(false)
    }
  }, [])

  useEffect(() => {
    setDuration(selectedModel.defaultDuration)
    setSize(selectedModel.defaultSize)
    setImages([])
  }, [selectedModel])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('zai_api_key', apiKey.trim())
      setApiKeyExpanded(false)
    }
  }

  const clearApiKey = () => {
    localStorage.removeItem('zai_api_key')
    setApiKey('')
    setApiKeyExpanded(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    const maxImages = selectedModel.supportsImages

    Array.from(files).slice(0, maxImages - images.length).forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        setError('Image size must be less than 50MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string
        setImages(prev => {
          if (prev.length < maxImages) {
            return [...prev, base64]
          }
          return prev
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const generateVideo = async () => {
    if (!apiKey) {
      setError('Please enter your API key first')
      setApiKeyExpanded(true)
      return
    }

    if (selectedModel.supportsImages === 0 && !prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    if (selectedModel.supportsImages > 0 && images.length === 0 && !prompt.trim()) {
      setError('Please enter a prompt or upload at least one image')
      return
    }

    setError(null)
    setTaskStatus('processing')
    setProgressMsg('Submitting generation request...')
    setVideoUrl(null)

    try {
      const requestBody: Record<string, unknown> = {
        model: selectedModel.id,
        prompt: prompt.trim(),
        with_audio: withAudio
      }

      if (selectedModel.id === 'cogvideox-3') {
        requestBody.quality = quality
        requestBody.fps = fps
        requestBody.duration = duration
        requestBody.size = size
        if (images.length > 0) {
          requestBody.image_url = images
        }
      } else if (selectedModel.id === 'viduq1-text') {
        requestBody.style = style
        requestBody.duration = duration
        requestBody.aspect_ratio = aspectRatio
        requestBody.movement_amplitude = movement
      } else if (selectedModel.id === 'viduq1-image') {
        requestBody.duration = duration
        requestBody.movement_amplitude = movement
        if (images.length > 0) {
          requestBody.image_url = images[0]
        }
      } else if (selectedModel.id === 'viduq1-start-end') {
        requestBody.duration = duration
        requestBody.movement_amplitude = movement
        if (images.length > 0) {
          requestBody.image_url = images
        }
      } else if (selectedModel.id === 'vidu2-image') {
        requestBody.duration = duration
        requestBody.size = size
        requestBody.movement_amplitude = movement
        if (images.length > 0) {
          requestBody.image_url = images[0]
        }
      } else if (selectedModel.id === 'vidu2-start-end') {
        requestBody.duration = duration
        requestBody.size = size
        requestBody.movement_amplitude = movement
        if (images.length > 0) {
          requestBody.image_url = images
        }
      } else if (selectedModel.id === 'vidu2-reference') {
        requestBody.duration = duration
        requestBody.aspect_ratio = aspectRatio
        requestBody.size = size
        requestBody.movement_amplitude = movement
        if (images.length > 0) {
          requestBody.image_url = images
        }
      }

      const response = await fetch(`${API_BASE}/videos/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept-Language': 'en-US,en'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok || data.code) {
        throw new Error(data.message || 'Failed to submit generation request')
      }

      setTaskId(data.id)
      setProgressMsg('Video is being generated... (this may take a few minutes)')
      startPolling(data.id)
    } catch (err) {
      setTaskStatus('fail')
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const startPolling = (id: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/async-result/${id}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept-Language': 'en-US,en'
          }
        })

        const data = await response.json()

        if (data.task_status === 'SUCCESS') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
          }
          setTaskStatus('success')
          setProgressMsg('Video generated successfully!')
          if (data.video_result && data.video_result.length > 0) {
            setVideoUrl(data.video_result[0].url)
          }
        } else if (data.task_status === 'FAIL') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
          }
          setTaskStatus('fail')
          setError(data.fail_reason || 'Video generation failed')
        } else {
          setProgressMsg('Still generating...')
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000)
  }

  const downloadVideo = () => {
    if (!videoUrl) return
    window.open(videoUrl, '_blank')
  }

  const resetForm = () => {
    setTaskId(null)
    setTaskStatus('idle')
    setVideoUrl(null)
    setError(null)
    setProgressMsg('')
    setPrompt('')
    setImages([])
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] flex items-center justify-center">
            <Film className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono">Video Playground</h1>
            <p className="text-sm text-[var(--text-secondary)]">Generate videos with Z.ai models</p>
          </div>
        </div>

        {/* API Key Section */}
        <div className="card-gradient rounded-xl mb-6">
          <button
            onClick={() => setApiKeyExpanded(!apiKeyExpanded)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-[var(--accent-cyan)]" />
              <span className="font-medium">API Key</span>
              {apiKey && <span className="badge-success">Saved</span>}
            </div>
            {apiKeyExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {apiKeyExpanded && (
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Z.ai API key"
                  className="input-dark flex-1"
                />
                {apiKey ? (
                  <button onClick={clearApiKey} className="btn-secondary px-4">
                    Clear
                  </button>
                ) : (
                  <button onClick={saveApiKey} className="btn-primary px-4">
                    Save
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                Get your API key from <a href="https://z.ai/manage-apikey/apikey-list" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline">z.ai/manage-apikey</a>
              </p>
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="card-gradient rounded-xl mb-6">
          <div className="p-4">
            <label className="block text-sm font-medium mb-3">Select Model</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all duration-150",
                    selectedModel.id === model.id
                      ? "border-[var(--accent-cyan)] bg-[var(--bg-elevated)]"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                  )}
                >
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{model.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generation Form */}
        <div className="card-gradient rounded-xl mb-6">
          <div className="p-4 space-y-4">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prompt {selectedModel.supportsPrompt && <span className="text-[var(--text-tertiary)]">(required)</span>}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to generate..."
                className="input-dark w-full h-24 resize-none"
                maxLength={512}
              />
              <div className="text-xs text-[var(--text-tertiary)] mt-1 text-right">{prompt.length}/512</div>
            </div>

            {/* Image Upload */}
            {selectedModel.supportsImages > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Images {selectedModel.supportsImages > 1 && <span className="text-[var(--text-tertiary)]">(up to {selectedModel.supportsImages})</span>}
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video bg-[var(--bg-elevated)] rounded-lg overflow-hidden group">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {idx === 0 && selectedModel.supportsImages === 2 && (
                        <div className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-2 py-0.5 rounded">First</div>
                      )}
                      {idx === 1 && selectedModel.supportsImages === 2 && (
                        <div className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-2 py-0.5 rounded">Last</div>
                      )}
                    </div>
                  ))}
                  {images.length < selectedModel.supportsImages && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video border-2 border-dashed border-[var(--border-subtle)] rounded-lg flex flex-col items-center justify-center text-[var(--text-tertiary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors"
                    >
                      <Upload className="h-6 w-6 mb-1" />
                      <span className="text-xs">Upload</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-[var(--text-tertiary)]">
                  Supported: PNG, JPEG, JPG, WebP (max 50MB each)
                </p>
              </div>
            )}

            {/* Style */}
            {selectedModel.supportsStyle && (
              <div>
                <label className="block text-sm font-medium mb-2">Style</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStyle('general')}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all",
                      style === 'general'
                        ? "border-[var(--accent-cyan)] bg-[var(--bg-elevated)]"
                        : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                    )}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setStyle('anime')}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all",
                      style === 'anime'
                        ? "border-[var(--accent-cyan)] bg-[var(--bg-elevated)]"
                        : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                    )}
                  >
                    Anime
                  </button>
                </div>
              </div>
            )}

            {/* Movement Amplitude */}
            {selectedModel.supportsMovement && (
              <div>
                <label className="block text-sm font-medium mb-2">Movement Amplitude</label>
                <div className="flex flex-wrap gap-2">
                  {(['auto', 'small', 'medium', 'large'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMovement(m)}
                      className={cn(
                        "px-4 py-2 rounded-lg border transition-all capitalize",
                        movement === m
                          ? "border-[var(--accent-cyan)] bg-[var(--bg-elevated)]"
                          : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium mb-2">Resolution</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="input-dark w-full"
              >
                {selectedModel.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            {selectedModel.supportsAspectRatio && (
              <div>
                <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                <div className="flex gap-2">
                  {selectedModel.aspects.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAspectRatio(a)}
                      className={cn(
                        "px-4 py-2 rounded-lg border transition-all",
                        aspectRatio === a
                          ? "border-[var(--accent-cyan)] bg-[var(--bg-elevated)]"
                          : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            {selectedModel.supportsDuration && (
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="input-dark w-full"
                >
                  <option value={4}>4 seconds</option>
                  <option value={5}>5 seconds</option>
                  {selectedModel.id === 'cogvideox-3' && <option value={10}>10 seconds</option>}
                </select>
              </div>
            )}

            {/* CogVideoX-3 specific */}
            {selectedModel.id === 'cogvideox-3' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">FPS</label>
                  <div className="flex gap-2">
                    {[30, 60].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFps(f)}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-all",
                          fps === f
                            ? "border-[var(--accent-cyan)] bg-[var(--bg-elevated)]"
                            : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                        )}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <div className="flex gap-2">
                    {(['speed', 'quality'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-all capitalize",
                          quality === q
                            ? "border-[var(--accent-cyan)] bg-[var(--bg-elevated)]"
                            : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="withAudio"
                    checked={withAudio}
                    onChange={(e) => setWithAudio(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--accent-cyan)] focus:ring-[var(--accent-cyan)]"
                  />
                  <label htmlFor="withAudio" className="text-sm">Add AI-generated audio</label>
                </div>
              </>
            )}

            {/* Vidu with audio */}
            {selectedModel.supportsAudio && selectedModel.id !== 'cogvideox-3' && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="withAudioVidu"
                  checked={withAudio}
                  onChange={(e) => setWithAudio(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--accent-cyan)] focus:ring-[var(--accent-cyan)]"
                />
                <label htmlFor="withAudioVidu" className="text-sm">Add background music</label>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="p-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={generateVideo}
              disabled={taskStatus === 'processing'}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {taskStatus === 'processing' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Generate Video
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status / Result */}
        {taskStatus !== 'idle' && (
          <div className="card-gradient rounded-xl">
            <div className="p-4">
              {taskStatus === 'processing' && (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-[var(--accent-cyan)] animate-spin" />
                  <div>
                    <div className="font-medium">Processing</div>
                    <div className="text-sm text-[var(--text-secondary)]">{progressMsg}</div>
                  </div>
                </div>
              )}

              {taskStatus === 'success' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[var(--accent-lime)]" />
                    <span className="font-medium">Video Generated Successfully!</span>
                  </div>
                  
                  {videoUrl && (
                    <div className="space-y-3">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full rounded-lg bg-black"
                        playsInline
                      />
                      <button
                        onClick={downloadVideo}
                        className="w-full btn-secondary flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Video
                      </button>
                    </div>
                  )}
                </div>
              )}

              {taskStatus === 'fail' && (
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-[var(--accent-red)]" />
                  <div>
                    <div className="font-medium">Generation Failed</div>
                    <div className="text-sm text-[var(--accent-red)]">{error}</div>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={resetForm}
                className="mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
              >
                Generate another video
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && taskStatus !== 'fail' && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/30 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-[var(--accent-red)]" />
            <span className="text-sm text-[var(--accent-red)]">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
