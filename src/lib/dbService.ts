import { supabase, isSupabaseConfigured } from './supabase'
import { User, Schedule, Reminder, WhatsAppConfig, AIConfig } from '@/types'

// Map DB row to User
const mapUserFromDb = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatar: row.avatar,
  role: row.role,
  phone: row.phone || undefined,
  status: row.status || 'active',
  tasksCompleted: row.tasks_completed ?? row.tasksCompleted ?? 0
})

// Map User to DB row
const mapUserToDb = (u: Partial<User>) => {
  const row: Record<string, any> = { ...u }
  if (u.tasksCompleted !== undefined) {
    row.tasks_completed = u.tasksCompleted
    delete row.tasksCompleted
  }
  return row
}

// ================= USERS CRUD =================
export const dbUsers = {
  async getAll(): Promise<User[] | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase.from('users').select('*').order('name')
    if (error) {
      console.error('[dbUsers.getAll]', error)
      return null
    }
    return (data || []).map(mapUserFromDb)
  },

  async insert(user: User) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('users').insert(mapUserToDb(user))
    if (error) console.error('[dbUsers.insert]', error)
  },

  async update(id: string, updates: Partial<User>) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('users').update(mapUserToDb(updates)).eq('id', id)
    if (error) console.error('[dbUsers.update]', error)
  },

  async delete(id: string) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) console.error('[dbUsers.delete]', error)
  }
}

// ================= SCHEDULES CRUD =================
export const dbSchedules = {
  async getAll(): Promise<Schedule[] | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase.from('schedules').select('*').order('activity_date', { ascending: true })
    if (error) {
      console.error('[dbSchedules.getAll]', error)
      return null
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      activity_date: row.activity_date,
      activity_time: row.activity_time,
      location: row.location,
      target_type: row.target_type || 'personal',
      whatsapp_target: row.whatsapp_target || '',
      reminder_enabled: Boolean(row.reminder_enabled),
      pj_ids: row.pj_ids || [],
      created_by: row.created_by,
      status: row.status || 'upcoming',
      category: row.category || 'other'
    }))
  },

  async insert(schedule: Schedule) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('schedules').insert(schedule)
    if (error) console.error('[dbSchedules.insert]', error)
  },

  async update(id: string, updates: Partial<Schedule>) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('schedules').update(updates).eq('id', id)
    if (error) console.error('[dbSchedules.update]', error)
  },

  async delete(id: string) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) console.error('[dbSchedules.delete]', error)
  }
}

// ================= REMINDERS CRUD =================
export const dbReminders = {
  async getAll(): Promise<Reminder[] | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase.from('reminders').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('[dbReminders.getAll]', error)
      return null
    }
    return data || []
  },

  async insert(reminder: Reminder) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('reminders').insert(reminder)
    if (error) console.error('[dbReminders.insert]', error)
  },

  async update(id: string, updates: Partial<Reminder>) {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('reminders').update(updates).eq('id', id)
    if (error) console.error('[dbReminders.update]', error)
  }
}

// ================= APP SETTINGS CRUD =================
export interface DbSettingsData {
  orgName?: string
  whatsappConfig?: Partial<WhatsAppConfig>
  aiConfig?: Partial<AIConfig>
}

export const dbSettings = {
  async get(): Promise<DbSettingsData | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase
      .from('app_settings')
      .select('org_name, whatsapp_config, ai_config')
      .eq('id', 'default')
      .maybeSingle()

    if (error || !data) return null
    return {
      orgName: data.org_name || undefined,
      whatsappConfig: data.whatsapp_config || undefined,
      aiConfig: data.ai_config || undefined
    }
  },

  async save(settings: DbSettingsData) {
    if (!isSupabaseConfigured) return
    const payload: Record<string, any> = {
      id: 'default',
      updated_at: new Date().toISOString()
    }
    if (settings.orgName !== undefined) payload.org_name = settings.orgName
    if (settings.whatsappConfig !== undefined) payload.whatsapp_config = settings.whatsappConfig
    if (settings.aiConfig !== undefined) payload.ai_config = settings.aiConfig

    const { error } = await supabase.from('app_settings').upsert(payload, { onConflict: 'id' })
    if (error) console.error('[dbSettings.save]', error)
  }
}
