import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatWhatsAppMessage, sendWhatsAppViaGateway } from './whatsappService'
import { toast } from '@/components/ui/Toast'

export const useWhatsAppScheduler = () => {
  const { schedules, users, orgName, whatsappConfig, addReminder, markReminderSent } = useAppStore()
  const processedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Check every 10 seconds
    const interval = setInterval(async () => {
      const now = new Date()
      const currentDateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
      const currentHours = now.getHours().toString().padStart(2, '0')
      const currentMins = now.getMinutes().toString().padStart(2, '0')
      const currentTimeStr = `${currentHours}:${currentMins}`

      for (const schedule of schedules) {
        if (!schedule.reminder_enabled) continue

        const scheduleDate = schedule.activity_date
        const scheduleTime = schedule.activity_time
        const target = schedule.whatsapp_target || whatsappConfig.targetDestination

        // 1. Exact Time Trigger Check
        const exactTriggerKey = `${schedule.id}_exact_${scheduleDate}_${scheduleTime}`
        if (
          scheduleDate === currentDateStr &&
          scheduleTime === currentTimeStr &&
          !processedRef.current.has(exactTriggerKey)
        ) {
          processedRef.current.add(exactTriggerKey)

          const message = formatWhatsAppMessage(schedule, users, orgName, 'exact')
          const result = await sendWhatsAppViaGateway(
            whatsappConfig,
            target,
            message
          )

          if (result.success) {
            addReminder({
              schedule_id: schedule.id,
              schedule_title: schedule.title,
              reminder_time: `${scheduleDate} ${scheduleTime}`,
              status: 'sent',
              sent_at: `${currentDateStr} ${currentTimeStr}`,
              target: target,
              message_preview: message.slice(0, 100) + '...'
            })

            toast.success(
              '⚡ Auto-Sent WhatsApp!',
              `Pesan otomatis terkirim untuk "${schedule.title}" ke ${target} pada jam ${currentTimeStr}`
            )
          }
        }

        // 2. 1-Hour Prior Trigger Check (if enabled)
        if (whatsappConfig.autoH1Hour) {
          const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`)
          const diffMs = scheduleDateTime.getTime() - now.getTime()
          const diffMinutes = Math.floor(diffMs / 60000)

          const priorTriggerKey = `${schedule.id}_1hour_${scheduleDate}`
          // If within 55-60 minutes before
          if (diffMinutes >= 55 && diffMinutes <= 60 && !processedRef.current.has(priorTriggerKey)) {
            processedRef.current.add(priorTriggerKey)

            const message = formatWhatsAppMessage(schedule, users, orgName, '1-hour')
            await sendWhatsAppViaGateway(whatsappConfig, target, message)

            toast.info(
              '📢 Auto-Reminder (1 Jam Sebelum)',
              `Pengingat 1 jam terkirim untuk "${schedule.title}" ke ${target}`
            )
          }
        }
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [schedules, users, orgName, whatsappConfig, addReminder, markReminderSent])
}
