import React, { useEffect, useState, useRef } from 'react'
import { Plus, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import useChatStore from '@/stores/chatStore'
import { cn } from '@/lib/utils'

const ChatPage = () => {
  const {
    conversations,
    currentConversation,
    messages,
    activeConfig,
    isLoading,
    loadConversations,
    createConversation,
    setCurrentConversation,
    sendMessage,
    deleteConversation,
    loadActiveConfig
  } = useChatStore()

  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
    loadActiveConfig()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCreateConversation = async () => {
    if (!activeConfig) {
      alert('Please configure an AI model in Settings first')
      return
    }

    try {
      await createConversation('New Conversation', activeConfig.id)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading) return

    if (!currentConversation) {
      await handleCreateConversation()
    }

    try {
      await sendMessage(inputMessage)
      setInputMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message: ' + error.message)
    }
  }

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation()

    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(convId)
      } catch (error) {
        console.error('Failed to delete conversation:', error)
      }
    }
  }

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Button
            onClick={handleCreateConversation}
            className="w-full"
            disabled={!activeConfig}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setCurrentConversation(conv.id)}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-colors group flex items-center justify-between',
                  currentConversation?.id === conv.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                )}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {!activeConfig && (
          <div className="p-4 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              No AI model configured. Go to Settings to add one.
            </p>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{currentConversation.title}</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <Card
                    key={msg.id}
                    className={cn(
                      'p-4',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                        : 'bg-muted max-w-[80%]'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                ))}
                {isLoading && (
                  <Card className="p-4 bg-muted max-w-[80%]">
                    <p className="text-muted-foreground">Thinking...</p>
                  </Card>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-3xl mx-auto">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to AI Chat</h2>
              <p className="text-muted-foreground">
                {activeConfig
                  ? 'Create a new conversation to get started'
                  : 'Configure an AI model in Settings to start chatting'}
              </p>
              {activeConfig && (
                <Button onClick={handleCreateConversation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
