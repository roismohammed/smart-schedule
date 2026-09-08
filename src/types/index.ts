export type Role = 'admin' | 'member' | 'pj'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: Role
  phone?: string
  status?: 'active' | 'inactive'
  tasksCompleted?: number
}

export interface Schedule {
  id: string
  title: string
  description: string
  activity_date: string // YYYY-MM-DD
  activity_time: string // HH:mm
  location: string
  target_type: 'personal' | 'group' // personal number or group
  whatsapp_target: string // Phone number (e.g. 085040466426 / 6285040466426) or Group JID
  reminder_enabled: boolean
  pj_ids: string[] // User IDs
  created_by: string
  status?: 'upcoming' | 'completed' | 'cancelled'
  category?: 'cleaning' | 'event' | 'patrol' | 'security' | 'other'
}

export interface Reminder {
  id: string
  schedule_id: string
  schedule_title: string
  reminder_time: string
  status: 'sent' | 'pending' | 'failed'
  sent_at?: string
  target: string
  message_preview: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant' | 'system'
  text: string
  timestamp: string
  parsedSchedule?: Partial<Schedule>
  suggestedAction?: 'create_schedule' | 'send_whatsapp' | 'summarize'
}

export interface WhatsAppConfig {
  apiKey: string
  phoneNumberId: string
  targetType: 'personal' | 'group'
  targetDestination: string // Direct phone number or group ID (e.g. 085040466426)
  targetName: string // e.g. "WhatsApp Saya (085040466426)"
  autoH1: boolean
  autoH1Hour: boolean
  personalReminder: boolean
}

export interface AIConfig {
  apiKey: string
  model: 'gpt-4o-mini' | 'gpt-4o' | 'claude-3-5-sonnet'
  tone: 'formal' | 'friendly' | 'casual' | 'islamic'
  customPrompt?: string
}
