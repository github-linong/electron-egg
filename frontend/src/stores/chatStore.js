import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  activeConfig: null,
  isLoading: false,

  loadConversations: async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      set({ conversations: data || [] })
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  },

  createConversation: async (title, configId) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ title, ai_config_id: configId }])
        .select()
        .maybeSingle()

      if (error) throw error

      set((state) => ({
        conversations: [data, ...state.conversations],
        currentConversation: data,
        messages: []
      }))

      return data
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  },

  setCurrentConversation: async (conversationId) => {
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle()

      if (convError) throw convError

      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgError) throw msgError

      set({
        currentConversation: conversation,
        messages: messages || []
      })
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  },

  sendMessage: async (content) => {
    const { currentConversation, activeConfig } = get()

    if (!currentConversation || !activeConfig) {
      throw new Error('No active conversation or config')
    }

    set({ isLoading: true })

    try {
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: currentConversation.id,
          role: 'user',
          content
        }])
        .select()
        .maybeSingle()

      if (userError) throw userError

      set((state) => ({
        messages: [...state.messages, userMessage]
      }))

      const response = await window.api?.invoke?.('ai.sendMessage', {
        conversationId: currentConversation.id,
        message: content,
        configId: activeConfig.id
      })

      if (response?.success && response.assistantMessage) {
        set((state) => ({
          messages: [...state.messages, response.assistantMessage]
        }))
      } else {
        throw new Error(response?.error || 'Failed to get response')
      }

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversation.id)

    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (error) throw error

      set((state) => ({
        conversations: state.conversations.filter(c => c.id !== conversationId),
        currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation,
        messages: state.currentConversation?.id === conversationId ? [] : state.messages
      }))
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  },

  loadActiveConfig: async () => {
    try {
      const { data, error } = await supabase
        .from('ai_configs')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      set({ activeConfig: data })
    } catch (error) {
      console.error('Error loading active config:', error)
    }
  }
}))

export default useChatStore
