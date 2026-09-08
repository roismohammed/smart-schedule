import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Schedule, Reminder, WhatsAppConfig, AIConfig, ChatMessage } from '@/types'
import { dbUsers, dbSchedules, dbReminders, dbSettings } from '@/lib/dbService'

const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'Andi Pratama',
    email: 'andi@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    phone: '085040466426',
    status: 'active',
    tasksCompleted: 14
  },
  {
    id: 'u2',
    name: 'Budi Santoso',
    email: 'budi@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567891',
    status: 'active',
    tasksCompleted: 9
  },
  {
    id: 'u3',
    name: 'Citra Dewi',
    email: 'citra@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567892',
    status: 'active',
    tasksCompleted: 12
  },
  {
    id: 'u4',
    name: 'Dimas Setiawan',
    email: 'dimas@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    phone: '6281234567893',
    status: 'active',
    tasksCompleted: 5
  },
  {
    id: 'u5',
    name: 'Eka Rahmawati',
    email: 'eka@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567894',
    status: 'inactive',
    tasksCompleted: 8
  }
]

const today = new Date().toISOString().split('T')[0]
const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]
const dayAfterTomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]

const initialSchedules: Schedule[] = [
  {
    id: 's1',
    title: 'Piket Kebersihan Basecamp & Lab',
    description: 'Menyapu lantai, merapikan meja diskusi, dan membuang sampah inventaris.',
    activity_date: today,
    activity_time: '08:00',
    location: 'Sekretariat Utama Lt. 2',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u1', 'u2'],
    created_by: 'u1',
    status: 'upcoming',
    category: 'cleaning'
  },
  {
    id: 's2',
    title: 'Piket Keamanan & Cek Inventaris Malam',
    description: 'Pemeriksaan kunci pintu, kelistrikan AC, dan perlengkapan audio visual.',
    activity_date: today,
    activity_time: '21:00',
    location: 'Gedung Serbaguna',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u4'],
    created_by: 'u1',
    status: 'upcoming',
    category: 'security'
  },
  {
    id: 's3',
    title: 'Dokumentasi & Live Report Workshop AI',
    description: 'Mengambil foto sambutan, video reel Instagram, dan live tweet jalannya acara.',
    activity_date: tomorrowDate,
    activity_time: '09:30',
    location: 'Auditorium Hall B',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u2', 'u3'],
    created_by: 'u1',
    status: 'upcoming',
    category: 'event'
  },
  {
    id: 's4',
    title: 'Piket Konsumsi Rapat Kerja Semester 1',
    description: 'Menyiapkan snack box, air mineral, dan makan siang pemateri.',
    activity_date: dayAfterTomorrow,
    activity_time: '11:45',
    location: 'Ruang Rapat Senat',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u3', 'u5'],
    created_by: 'u1',
    status: 'upcoming',
    category: 'other'
  }
]

const initialReminders: Reminder[] = [
  {
    id: 'r1',
    schedule_id: 's1',
    schedule_title: 'Piket Kebersihan Basecamp & Lab',
    reminder_time: '07:00 Hari ini',
    status: 'sent',
    sent_at: '2026-09-03 07:00',
    target: '085040466426',
    message_preview: 'Halo semuanya 👋 Pengingat piket jam 08:00 WIB...'
  },
  {
    id: 'r2',
    schedule_id: 's2',
    schedule_title: 'Piket Keamanan & Cek Inventaris Malam',
    reminder_time: '20:00 Hari ini',
    status: 'pending',
    target: '085040466426',
    message_preview: 'Pemberitahuan piket keamanan malam nanti...'
  }
]

const syncHtmlDarkClass = (isDark: boolean) => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

interface AppState {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  isDarkMode: boolean
  toggleDarkMode: () => void

  users: User[]
  addUser: (user: Omit<User, 'id'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void

  schedules: Schedule[]
  addSchedule: (schedule: Omit<Schedule, 'id'>) => string
  updateSchedule: (id: string, updates: Partial<Schedule>) => void
  deleteSchedule: (id: string) => void

  reminders: Reminder[]
  addReminder: (reminder: Omit<Reminder, 'id'>) => void
  markReminderSent: (id: string) => void

  orgName: string
  setOrgName: (name: string) => void
  whatsappConfig: WhatsAppConfig
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void
  aiConfig: AIConfig
  updateAIConfig: (config: Partial<AIConfig>) => void

  chatMessages: ChatMessage[]
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChat: () => void

  fetchFromSupabase: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: initialUsers[0],
      setCurrentUser: (user) => set({ currentUser: user }),

      isDarkMode: false,
      toggleDarkMode: () => {
        const next = !get().isDarkMode
        set({ isDarkMode: next })
        syncHtmlDarkClass(next)
      },

      users: initialUsers,
      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: 'u_' + Date.now()
        }
        set({ users: [...get().users, newUser] })
        dbUsers.insert(newUser)
      },
      updateUser: (id, updates) => {
        set({
          users: get().users.map((u) => (u.id === id ? { ...u, ...updates } : u))
        })
        dbUsers.update(id, updates)
      },
      deleteUser: (id) => {
        set({ users: get().users.filter((u) => u.id !== id) })
        dbUsers.delete(id)
      },

      schedules: initialSchedules,
      addSchedule: (scheduleData) => {
        const id = 's_' + Date.now()
        const newSched: Schedule = {
          ...scheduleData,
          id
        }
        set({ schedules: [newSched, ...get().schedules] })
        dbSchedules.insert(newSched)

        if (newSched.reminder_enabled) {
          const pjNames = get().users
            .filter((u) => newSched.pj_ids.includes(u.id))
            .map((u) => u.name)
            .join(' & ')

          get().addReminder({
            schedule_id: id,
            schedule_title: newSched.title,
            reminder_time: `${newSched.activity_date} ${newSched.activity_time}`,
            status: 'pending',
            target: newSched.whatsapp_target || get().whatsappConfig.targetDestination,
            message_preview: `Halo! Pengingat jadwal: ${newSched.title} pada ${newSched.activity_time} WIB. PJ: ${pjNames || 'Semua'}`
          })
        }
        return id
      },
      updateSchedule: (id, updates) => {
        set({
          schedules: get().schedules.map((s) => (s.id === id ? { ...s, ...updates } : s))
        })
        dbSchedules.update(id, updates)
      },
      deleteSchedule: (id) => {
        set({ schedules: get().schedules.filter((s) => s.id !== id) })
        dbSchedules.delete(id)
      },

      reminders: initialReminders,
      addReminder: (rem) => {
        const newRem: Reminder = {
          ...rem,
          id: 'r_' + Date.now()
        }
        set({ reminders: [newRem, ...get().reminders] })
        dbReminders.insert(newRem)
      },
      markReminderSent: (id) => {
        const sent_at = new Date().toLocaleString('id-ID')
        set({
          reminders: get().reminders.map((r) =>
            r.id === id ? { ...r, status: 'sent', sent_at } : r
          )
        })
        dbReminders.update(id, { status: 'sent', sent_at })
      },

      orgName: 'BEM Fasilkom & Tim Piket Pusat 2026',
      setOrgName: (orgName) => {
        set({ orgName })
        dbSettings.save({ orgName })
      },

      whatsappConfig: {
        apiKey: 'pk_live_wabot_98a7sd8f7a9s8d7f',
        phoneNumberId: '628991234567',
        targetType: 'personal',
        targetDestination: '085040466426',
        targetName: 'Nomor WhatsApp Saya (085040466426)',
        autoH1: true,
        autoH1Hour: true,
        personalReminder: true
      },
      updateWhatsAppConfig: (config) => {
        const next = { ...get().whatsappConfig, ...config }
        set({ whatsappConfig: next })
        dbSettings.save({ whatsappConfig: next })
      },

      aiConfig: {
        apiKey: '',
        model: 'gpt-4o-mini',
        tone: 'friendly',
        customPrompt: 'Buat pesan pengingat yang ringkas, bersahabat, dan jelas menyertakan waktu, lokasi, dan daftar nama PJ.'
      },
      updateAIConfig: (config) => {
        const next = { ...get().aiConfig, ...config }
        set({ aiConfig: next })
        dbSettings.save({ aiConfig: next })
      },

      chatMessages: [
        {
          id: 'm1',
          sender: 'assistant',
          text: 'Halo! Saya PiketAI Assistant 🤖 Siap membantu membuat jadwal otomatis, mengecek jadwal bentrok, merekomendasikan pembagian PJ, atau membuat pesan WhatsApp pengingat otomatis. Coba ketik: *"Meeting besok jam 8 pagi PJ Andi dan Budi"*',
          timestamp: '10:00'
        }
      ],
      addChatMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: 'm_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
        set({ chatMessages: [...get().chatMessages, newMsg] })
      },
      clearChat: () => {
        set({
          chatMessages: [
            {
              id: 'm_init',
              sender: 'assistant',
              text: 'Obrolan telah dibersihkan. Ada jadwal kegiatan atau pembagian PJ yang ingin dibantu?',
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        })
      },

      fetchFromSupabase: async () => {
        const [usersData, schedulesData, remindersData, settingsData] = await Promise.all([
          dbUsers.getAll(),
          dbSchedules.getAll(),
          dbReminders.getAll(),
          dbSettings.get()
        ])

        const updates: Partial<AppState> = {}
        if (usersData && usersData.length > 0) updates.users = usersData
        if (schedulesData && schedulesData.length > 0) updates.schedules = schedulesData
        if (remindersData && remindersData.length > 0) updates.reminders = remindersData
        if (settingsData) {
          if (settingsData.orgName) updates.orgName = settingsData.orgName
          if (settingsData.whatsappConfig) {
            updates.whatsappConfig = { ...get().whatsappConfig, ...settingsData.whatsappConfig }
          }
          if (settingsData.aiConfig) {
            updates.aiConfig = { ...get().aiConfig, ...settingsData.aiConfig }
          }
        }

        if (Object.keys(updates).length > 0) {
          set(updates)
        }
      }
    }),
    {
      name: 'piketai-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          syncHtmlDarkClass(state.isDarkMode)
        }
      }
    }
  )
)
