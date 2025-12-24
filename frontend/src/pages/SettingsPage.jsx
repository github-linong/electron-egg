import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const SettingsPage = () => {
  const [configs, setConfigs] = useState([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [configForm, setConfigForm] = useState({
    name: '',
    provider: 'openai',
    model: '',
    api_key: '',
    api_base_url: '',
    is_local: false,
    parameters: {
      temperature: 0.7,
      max_tokens: 2000
    }
  })

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_configs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConfigs(data || [])
    } catch (error) {
      console.error('Error loading configs:', error)
    }
  }

  const handleAddConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_configs')
        .insert([configForm])
        .select()
        .maybeSingle()

      if (error) throw error

      setConfigs([data, ...configs])
      setShowAddDialog(false)
      setConfigForm({
        name: '',
        provider: 'openai',
        model: '',
        api_key: '',
        api_base_url: '',
        is_local: false,
        parameters: {
          temperature: 0.7,
          max_tokens: 2000
        }
      })
    } catch (error) {
      alert('Failed to add config: ' + error.message)
    }
  }

  const handleSetActive = async (configId) => {
    try {
      await supabase
        .from('ai_configs')
        .update({ is_active: false })
        .neq('id', configId)

      const { data, error } = await supabase
        .from('ai_configs')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', configId)
        .select()
        .maybeSingle()

      if (error) throw error

      setConfigs(configs.map(c => ({
        ...c,
        is_active: c.id === configId
      })))
    } catch (error) {
      alert('Failed to set active config: ' + error.message)
    }
  }

  const handleDeleteConfig = async (configId) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      try {
        const { error } = await supabase
          .from('ai_configs')
          .delete()
          .eq('id', configId)

        if (error) throw error

        setConfigs(configs.filter(c => c.id !== configId))
      } catch (error) {
        alert('Failed to delete config: ' + error.message)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure AI models and settings</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Configuration
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">AI Model Configurations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {configs.map((config) => (
                <Card
                  key={config.id}
                  className={cn(
                    'relative',
                    config.is_active && 'ring-2 ring-primary'
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {config.name}
                          {config.is_active && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                              Active
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {config.provider} - {config.model}
                          {config.is_local && ' (Local)'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {config.api_base_url && (
                        <div>
                          <span className="text-muted-foreground">Base URL: </span>
                          <span className="font-mono text-xs">{config.api_base_url}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Temperature: </span>
                        <span>{config.parameters?.temperature || 0.7}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Tokens: </span>
                        <span>{config.parameters?.max_tokens || 2000}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {!config.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSetActive(config.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {configs.length === 0 && (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No AI configurations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first configuration to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add AI Configuration</DialogTitle>
            <DialogDescription>
              Configure an online or local AI model
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div>
                <label className="text-sm font-medium">Configuration Name</label>
                <Input
                  value={configForm.name}
                  onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                  placeholder="My GPT-4 Config"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Local Model (Ollama)</p>
                  <p className="text-sm text-muted-foreground">
                    Use a locally hosted model via Ollama
                  </p>
                </div>
                <Switch
                  checked={configForm.is_local}
                  onCheckedChange={(checked) => setConfigForm({ ...configForm, is_local: checked })}
                />
              </div>

              {!configForm.is_local && (
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <select
                    value={configForm.provider}
                    onChange={(e) => setConfigForm({ ...configForm, provider: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Model</label>
                <Input
                  value={configForm.model}
                  onChange={(e) => setConfigForm({ ...configForm, model: e.target.value })}
                  placeholder={configForm.is_local ? "llama2" : "gpt-4"}
                />
              </div>

              {!configForm.is_local && (
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    type="password"
                    value={configForm.api_key}
                    onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">
                  API Base URL {!configForm.is_local && '(Optional)'}
                </label>
                <Input
                  value={configForm.api_base_url}
                  onChange={(e) => setConfigForm({ ...configForm, api_base_url: e.target.value })}
                  placeholder={configForm.is_local ? "http://localhost:11434" : "https://api.openai.com"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Temperature</label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={configForm.parameters.temperature}
                    onChange={(e) => setConfigForm({
                      ...configForm,
                      parameters: { ...configForm.parameters, temperature: parseFloat(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Tokens</label>
                  <Input
                    type="number"
                    min="100"
                    max="8000"
                    step="100"
                    value={configForm.parameters.max_tokens}
                    onChange={(e) => setConfigForm({
                      ...configForm,
                      parameters: { ...configForm.parameters, max_tokens: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddConfig} disabled={!configForm.name || !configForm.model}>
              Add Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SettingsPage
