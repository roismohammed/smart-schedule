import React, { useState } from 'react'
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/components/ui/Toast'

export const AuthView: React.FC = () => {
  const { setCurrentUser, users } = useAppStore()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('andi@piketai.app')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (existingUser) {
        setCurrentUser(existingUser)
        toast.success(`Welcome back, ${existingUser.name}`)
      } else {
        const newUser = {
          id: 'u_' + Date.now(),
          name: name || 'Team Member',
          email,
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'admin' as const,
          status: 'active' as const
        }
        setCurrentUser(newUser)
        toast.success(`Account created for ${newUser.name}`)
      }
    }, 500)
  }

  const handleQuickDemoLogin = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(user)
      toast.success(`Signed in as ${user.name}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 items-center justify-center text-white dark:text-zinc-900 font-bold text-sm mb-1">
            P
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            PiketAI
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Schedule management & WhatsApp reminders
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="andi@piketai.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" isLoading={isLoading} className="w-full justify-center mt-2">
              <span>{isRegister ? 'Create account' : 'Sign in'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>
        </Card>

        {/* Quick Demo Switcher */}
        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
            Demo quick switch:
          </span>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('u1')}
              className="text-xs h-7 px-2"
            >
              Andi (Admin)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('u2')}
              className="text-xs h-7 px-2"
            >
              Budi (PJ)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('u3')}
              className="text-xs h-7 px-2"
            >
              Citra (PJ)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
