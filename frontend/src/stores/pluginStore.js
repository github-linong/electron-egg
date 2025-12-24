import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const usePluginStore = create((set) => ({
  plugins: [],
  isLoading: false,

  loadPlugins: async () => {
    try {
      set({ isLoading: true })

      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('installed_at', { ascending: false })

      if (error) throw error
      set({ plugins: data || [] })
    } catch (error) {
      console.error('Error loading plugins:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  installPlugin: async (pluginData, files) => {
    try {
      const response = await window.api?.invoke?.('plugin.installPlugin', {
        pluginData,
        files
      })

      if (response?.success) {
        set((state) => ({
          plugins: [response.plugin, ...state.plugins]
        }))
        return response.plugin
      } else {
        throw new Error(response?.error || 'Failed to install plugin')
      }
    } catch (error) {
      console.error('Error installing plugin:', error)
      throw error
    }
  },

  uninstallPlugin: async (pluginId) => {
    try {
      const response = await window.api?.invoke?.('plugin.uninstallPlugin', {
        pluginId
      })

      if (response?.success) {
        set((state) => ({
          plugins: state.plugins.filter(p => p.id !== pluginId)
        }))
      } else {
        throw new Error(response?.error || 'Failed to uninstall plugin')
      }
    } catch (error) {
      console.error('Error uninstalling plugin:', error)
      throw error
    }
  },

  togglePlugin: async (pluginId, enabled) => {
    try {
      const response = await window.api?.invoke?.('plugin.togglePlugin', {
        pluginId,
        enabled
      })

      if (response?.success) {
        set((state) => ({
          plugins: state.plugins.map(p =>
            p.id === pluginId ? { ...p, enabled } : p
          )
        }))
      } else {
        throw new Error(response?.error || 'Failed to toggle plugin')
      }
    } catch (error) {
      console.error('Error toggling plugin:', error)
      throw error
    }
  },

  openPlugin: async (pluginId) => {
    try {
      const response = await window.api?.invoke?.('plugin.openPluginWindow', {
        pluginId
      })

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to open plugin')
      }
    } catch (error) {
      console.error('Error opening plugin:', error)
      throw error
    }
  },

  importPlugin: async (filePath) => {
    try {
      const response = await window.api?.invoke?.('plugin.importPlugin', {
        filePath
      })

      if (response?.success && response.plugin) {
        set((state) => ({
          plugins: [response.plugin, ...state.plugins]
        }))
        return response.plugin
      } else {
        throw new Error(response?.error || 'Failed to import plugin')
      }
    } catch (error) {
      console.error('Error importing plugin:', error)
      throw error
    }
  }
}))

export default usePluginStore
