import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Schedule, Reminder, WhatsAppConfig, AIConfig, ChatMessage } from '@/types'
import { dbUsers, dbSchedules, dbReminders, dbSettings } from '@/lib/dbService'

const initialUsers: User[] = [
  {
    id: 'u_rois',
    name: 'Rois',
    email: 'rois@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    phone: '085040466426',
    status: 'active',
    tasksCompleted: 16
  },
  {
    id: 'u_karimah',
    name: 'Karimah',
    email: 'karimah@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567890',
    status: 'active',
    tasksCompleted: 14
  },
  {
    id: 'u_farah',
    name: 'Farah',
    email: 'farah@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567891',
    status: 'active',
    tasksCompleted: 8
  },
  {
    id: 'u_ibrahim',
    name: 'Ibrahim',
    email: 'ibrahim@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567892',
    status: 'active',
    tasksCompleted: 9
  },
  {
    id: 'u_lely',
    name: 'Lely',
    email: 'lely@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567893',
    status: 'active',
    tasksCompleted: 11
  },
  {
    id: 'u_alfi',
    name: 'Alfi',
    email: 'alfi@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567894',
    status: 'active',
    tasksCompleted: 7
  },
  {
    id: 'u_danel',
    name: 'Danel',
    email: 'danel@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567895',
    status: 'active',
    tasksCompleted: 13
  },
  {
    id: 'u_sandy',
    name: 'Sandy',
    email: 'sandy@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567896',
    status: 'active',
    tasksCompleted: 8
  },
  {
    id: 'u_alifah',
    name: 'Alifah',
    email: 'alifah@piketai.app',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'pj',
    phone: '6281234567897',
    status: 'active',
    tasksCompleted: 10
  }
]

const getDayDate = (targetDay: number): string => {
  const d = new Date()
  const currentDay = d.getDay() // 0 = Sun, 1 = Mon ...
  const diff = targetDay - (currentDay === 0 ? 7 : currentDay)
  const target = new Date(d.getTime() + diff * 86400000)
  return target.toISOString().split('T')[0]
}

const monday = getDayDate(1)
const tuesday = getDayDate(2)
const wednesday = getDayDate(3)
const thursday = getDayDate(4)
const friday = getDayDate(5)

const initialSchedules: Schedule[] = [
  // SENIN
  {
    id: 's_sen_1',
    title: 'Praktikum Jarkom / Komjar (Sesi 1)',
    description: 'Praktikum Jaringan Komputer di Lab Komjar (08.00 - 10.00 WIB)',
    activity_date: monday,
    activity_time: '08:00',
    location: 'Lab Komjar',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_rois'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'cleaning'
  },
  {
    id: 's_sen_2',
    title: 'Praktikum Jarkom / Komjar (Sesi 2)',
    description: 'Praktikum Jaringan Komputer di Lab Komjar (10.00 - 12.00 WIB)',
    activity_date: monday,
    activity_time: '10:00',
    location: 'Lab Komjar',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_rois'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'cleaning'
  },
  {
    id: 's_sen_3',
    title: 'Orkom (Bu Nuru)',
    description: 'Mata Kuliah Organisasi Komputer dengan Dosen Bu Nuru (14.10 - 15.50 WIB)',
    activity_date: monday,
    activity_time: '14:10',
    location: 'Ruang 208',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_farah'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },

  // SELASA
  {
    id: 's_sel_1',
    title: 'Elektro (P. Sigit)',
    description: 'Mata Kuliah Elektro dengan Dosen P. Sigit (07.00 - 08.40 WIB)',
    activity_date: tuesday,
    activity_time: '07:00',
    location: 'Ruang 207',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_ibrahim'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },
  {
    id: 's_sel_2',
    title: 'MTK Diskrit (B. Ariesta)',
    description: 'Mata Kuliah Matematika Diskrit dengan Dosen B. Ariesta (08.40 - 10.20 WIB)',
    activity_date: tuesday,
    activity_time: '08:40',
    location: 'Ruang 306',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_lely'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },
  {
    id: 's_sel_3',
    title: 'P. Karya Ilmiah (P. Wanda)',
    description: 'Mata Kuliah Penulisan Karya Ilmiah dengan Dosen P. Wanda (10.20 - 12.00 WIB)',
    activity_date: tuesday,
    activity_time: '10:20',
    location: 'Ruang 208',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_alfi'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },
  {
    id: 's_sel_4',
    title: 'Basis Data (P. Afif)',
    description: 'Mata Kuliah Basis Data dengan Dosen P. Afif (14.10 - 15.50 WIB)',
    activity_date: tuesday,
    activity_time: '14:10',
    location: 'Ruang 306',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_danel'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },

  // RABU
  {
    id: 's_rab_1',
    title: 'Psikologi Pendidikan (P. Krisna)',
    description: 'Mata Kuliah Psikologi Pendidikan dengan Dosen P. Krisna (07.00 - 08.40 WIB)',
    activity_date: wednesday,
    activity_time: '07:00',
    location: 'Ruang 307',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_sandy'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },
  {
    id: 's_rab_2',
    title: 'Evaluasi Pembelajaran Kejuruan (B. Maya)',
    description: 'Mata Kuliah Evaluasi Pembelajaran Kejuruan dengan Dosen B. Maya (08.40 - 10.20 WIB)',
    activity_date: wednesday,
    activity_time: '08:40',
    location: 'Ruang 307',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_alifah'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },

  // KAMIS
  {
    id: 's_kam_1',
    title: 'Jarkom (P. Muhlis)',
    description: 'Mata Kuliah Jaringan Komputer dengan Dosen P. Muhlis (08.40 - 10.20 WIB)',
    activity_date: thursday,
    activity_time: '08:40',
    location: 'Ruang 207',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_rois'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },
  {
    id: 's_kam_2',
    title: 'Kecerdasan Buatan (B. Laili)',
    description: 'Mata Kuliah Kecerdasan Buatan dengan Dosen B. Laili (10.20 - 12.00 WIB)',
    activity_date: thursday,
    activity_time: '10:20',
    location: 'Ruang 208',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_karimah'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },
  {
    id: 's_kam_3',
    title: 'Filsafat Pendidikan (P. Imron)',
    description: 'Mata Kuliah Filsafat Pendidikan dengan Dosen P. Imron (12.30 - 14.10 WIB)',
    activity_date: thursday,
    activity_time: '12:30',
    location: 'Ruang 306',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_alifah'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'event'
  },

  // JUMAT
  {
    id: 's_jum_1',
    title: 'Praktikum Basdat / Komjar (Sesi 1)',
    description: 'Praktikum Basis Data di Lab Komjar (07.00 - 09.00 WIB)',
    activity_date: friday,
    activity_time: '07:00',
    location: 'Lab Komjar',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_danel'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'cleaning'
  },
  {
    id: 's_jum_2',
    title: 'Praktikum Basdat / Komjar (Sesi 2)',
    description: 'Praktikum Basis Data di Lab Komjar (09.00 - 11.00 WIB)',
    activity_date: friday,
    activity_time: '09:00',
    location: 'Lab Komjar',
    target_type: 'personal',
    whatsapp_target: '085040466426',
    reminder_enabled: true,
    pj_ids: ['u_danel'],
    created_by: 'u_rois',
    status: 'upcoming',
    category: 'cleaning'
  }
]

const initialReminders: Reminder[] = initialSchedules.map((s, idx) => ({
  id: `r_init_${idx + 1}`,
  schedule_id: s.id,
  schedule_title: s.title,
  reminder_time: `${s.activity_date} ${s.activity_time}`,
  status: 'pending',
  target: '085040466426',
  message_preview: `Pengingat jadwal: ${s.title} jam ${s.activity_time} WIB di ${s.location}.`
}))

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

      orgName: 'Jadwal Kuliah & Piket Komjar 2026',
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
          text: 'Halo! Saya RoisAI Assistant 🤖 Semua jadwal kuliah & praktikum (Senin - Jumat) telah tersimpan. Ada jadwal tambahan atau pengingat yang ingin dibantu?',
          timestamp: '07:00'
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
