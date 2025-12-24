import React, { useEffect, useState } from 'react'
import { Plus, Download, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import usePluginStore from '@/stores/pluginStore'
import { ScrollArea } from '@/components/ui/scroll-area'

const PluginsPage = () => {
  const { plugins, isLoading, loadPlugins, installPlugin, uninstallPlugin, togglePlugin, openPlugin, importPlugin } = usePluginStore()
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [pluginForm, setPluginForm] = useState({
    name: '',
    version: '1.0.0',
    type: 'html',
    description: '',
    author: '',
    entry_point: 'index.html'
  })

  useEffect(() => {
    loadPlugins()
  }, [])

  const handleInstallPlugin = async () => {
    try {
      await installPlugin(pluginForm, [])
      setShowInstallDialog(false)
      setPluginForm({
        name: '',
        version: '1.0.0',
        type: 'html',
        description: '',
        author: '',
        entry_point: 'index.html'
      })
    } catch (error) {
      alert('Failed to install plugin: ' + error.message)
    }
  }

  const handleImportPlugin = async () => {
    try {
      const result = await window.api?.invoke?.('dialog.showOpenDialog', {
        properties: ['openFile'],
        filters: [{ name: 'Plugin', extensions: ['json'] }]
      })

      if (result && !result.canceled && result.filePaths[0]) {
        await importPlugin(result.filePaths[0])
      }
    } catch (error) {
      alert('Failed to import plugin: ' + error.message)
    }
  }

  const handleTogglePlugin = async (pluginId, enabled) => {
    try {
      await togglePlugin(pluginId, enabled)
    } catch (error) {
      alert('Failed to toggle plugin: ' + error.message)
    }
  }

  const handleUninstallPlugin = async (pluginId) => {
    if (confirm('Are you sure you want to uninstall this plugin?')) {
      try {
        await uninstallPlugin(pluginId)
      } catch (error) {
        alert('Failed to uninstall plugin: ' + error.message)
      }
    }
  }

  const handleOpenPlugin = async (pluginId) => {
    try {
      await openPlugin(pluginId)
    } catch (error) {
      alert('Failed to open plugin: ' + error.message)
    }
  }

  const installedPlugins = plugins.filter(p => p.type === 'html' || p.type === 'mcp')
  const htmlPlugins = plugins.filter(p => p.type === 'html')
  const mcpPlugins = plugins.filter(p => p.type === 'mcp')

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Plugins</h1>
            <p className="text-sm text-muted-foreground">Manage your HTML and MCP plugins</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleImportPlugin} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setShowInstallDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plugin
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({installedPlugins.length})</TabsTrigger>
              <TabsTrigger value="html">HTML ({htmlPlugins.length})</TabsTrigger>
              <TabsTrigger value="mcp">MCP ({mcpPlugins.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {installedPlugins.map((plugin) => (
                  <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onToggle={handleTogglePlugin}
                    onUninstall={handleUninstallPlugin}
                    onOpen={handleOpenPlugin}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="html" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {htmlPlugins.map((plugin) => (
                  <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onToggle={handleTogglePlugin}
                    onUninstall={handleUninstallPlugin}
                    onOpen={handleOpenPlugin}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mcp" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mcpPlugins.map((plugin) => (
                  <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onToggle={handleTogglePlugin}
                    onUninstall={handleUninstallPlugin}
                    onOpen={handleOpenPlugin}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {installedPlugins.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No plugins installed yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Plugin</DialogTitle>
            <DialogDescription>
              Create a new plugin configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={pluginForm.name}
                onChange={(e) => setPluginForm({ ...pluginForm, name: e.target.value })}
                placeholder="My Plugin"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Version</label>
              <Input
                value={pluginForm.version}
                onChange={(e) => setPluginForm({ ...pluginForm, version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={pluginForm.type}
                onChange={(e) => setPluginForm({ ...pluginForm, type: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="html">HTML Plugin</option>
                <option value="mcp">MCP Server</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={pluginForm.description}
                onChange={(e) => setPluginForm({ ...pluginForm, description: e.target.value })}
                placeholder="Plugin description"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Author</label>
              <Input
                value={pluginForm.author}
                onChange={(e) => setPluginForm({ ...pluginForm, author: e.target.value })}
                placeholder="Your name"
              />
            </div>

            {pluginForm.type === 'html' && (
              <div>
                <label className="text-sm font-medium">Entry Point</label>
                <Input
                  value={pluginForm.entry_point}
                  onChange={(e) => setPluginForm({ ...pluginForm, entry_point: e.target.value })}
                  placeholder="index.html"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInstallPlugin} disabled={!pluginForm.name}>
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const PluginCard = ({ plugin, onToggle, onUninstall, onOpen }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{plugin.name}</CardTitle>
            <CardDescription>v{plugin.version}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {plugin.type.toUpperCase()}
            </span>
            <Switch
              checked={plugin.enabled}
              onCheckedChange={(checked) => onToggle(plugin.id, checked)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {plugin.description || 'No description'}
        </p>
        {plugin.author && (
          <p className="text-xs text-muted-foreground mt-2">By {plugin.author}</p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {plugin.type === 'html' && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onOpen(plugin.id)}
            disabled={!plugin.enabled}
          >
            <Power className="w-3 h-3 mr-1" />
            Open
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => onUninstall(plugin.id)}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Uninstall
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PluginsPage
