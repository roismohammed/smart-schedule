import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { AppLayout, NavTab } from '@/components/layout/AppLayout'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { SchedulesView } from '@/components/schedule/SchedulesView'
import { CalendarView } from '@/components/calendar/CalendarView'
import { PJView } from '@/components/pj/PJView'
import { AssistantView } from '@/components/assistant/AssistantView'
import { SettingsView } from '@/components/settings/SettingsView'
import { AuthView } from '@/components/auth/AuthView'
import { ScheduleModal } from '@/components/schedule/ScheduleModal'
import { useWhatsAppScheduler } from '@/lib/useWhatsAppScheduler'
import { Schedule } from '@/types'

export function App() {
  const { currentUser, isDarkMode, fetchFromSupabase } = useAppStore()
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null)

  // Fetch initial data from Supabase if configured
  useEffect(() => {
    fetchFromSupabase()
  }, [fetchFromSupabase])

  // Background auto-trigger loop for scheduled WhatsApp messages
  useWhatsAppScheduler()

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleOpenAddSchedule = () => {
    setScheduleToEdit(null)
    setIsScheduleModalOpen(true)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setScheduleToEdit(schedule)
    setIsScheduleModalOpen(true)
  }

  // If user not authenticated, render auth view
  if (!currentUser) {
    return <AuthView />
  }

  return (
    <AppLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      onOpenAddSchedule={handleOpenAddSchedule}
    >
      {currentTab === 'dashboard' && (
        <DashboardView
          onOpenAddSchedule={handleOpenAddSchedule}
          onNavigateTab={setCurrentTab}
          onEditSchedule={handleEditSchedule}
        />
      )}

      {currentTab === 'schedules' && (
        <SchedulesView
          onOpenAddSchedule={handleOpenAddSchedule}
          onEditSchedule={handleEditSchedule}
        />
      )}

      {currentTab === 'calendar' && (
        <CalendarView
          onOpenAddSchedule={handleOpenAddSchedule}
          onEditSchedule={handleEditSchedule}
        />
      )}

      {currentTab === 'pj' && <PJView />}

      {currentTab === 'assistant' && <AssistantView />}

      {currentTab === 'settings' && <SettingsView />}

      {/* Global Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setScheduleToEdit(null)
        }}
        scheduleToEdit={scheduleToEdit}
      />
    </AppLayout>
  )
}

export default App
