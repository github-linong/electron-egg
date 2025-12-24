import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageSquare, Puzzle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const Layout = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chat' },
    { path: '/plugins', icon: Puzzle, label: 'Plugins' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-16 border-r bg-card flex flex-col items-center py-4 space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </aside>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default Layout
