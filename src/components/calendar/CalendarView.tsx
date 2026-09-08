import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Plus,
  Copy,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useAppStore } from '@/store/appStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Schedule } from '@/types'
import { toast } from '@/components/ui/Toast'

interface CalendarViewProps {
  onOpenAddSchedule: () => void
  onEditSchedule: (schedule: Schedule) => void
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenAddSchedule,
  onEditSchedule
}) => {
  const { schedules, users, orgName } = useAppStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const selectedDaySchedules = schedules.filter((s) => s.activity_date === selectedDateStr)

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleCopyWA = (schedule: Schedule) => {
    const pjNames = users
      .filter((u) => schedule.pj_ids.includes(u.id))
      .map((u) => u.name)
      .join(', ')

    const text = `📢 *PENGINGAT JADWAL PIKET (${schedule.activity_date})*
📌 *Kegiatan:* ${schedule.title}
⏰ *Pukul:* ${schedule.activity_time} WIB
📍 *Lokasi:* ${schedule.location || '-'}
👥 *Petugas PJ:* ${pjNames || 'Semua Anggota'}

${schedule.description || 'Mohon hadir tepat waktu.'}
_PiketAI Automation - ${orgName}_`

    navigator.clipboard.writeText(text)
    toast.success('Pesan WhatsApp Tersalin!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kalender & Agenda Piket</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tampilan jadwal visual bulanan dan detail harian tugas anggota.
          </p>
        </div>

        <Button onClick={onOpenAddSchedule} size="sm" className="text-xs self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5" /> Tambah Jadwal
        </Button>
      </div>

      {/* Main Calendar Grid & Day Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar Grid */}
        <Card className="lg:col-span-2 p-5">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
            </h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentMonth(new Date())
                  setSelectedDate(new Date())
                }}
                className="text-xs px-2.5"
              >
                Hari Ini
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 pt-4 text-center">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
              <div key={day} className="text-[11px] font-bold text-slate-400 uppercase py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const daySchedules = schedules.filter((s) => s.activity_date === dateStr)
              const isSelected = isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isCurrentDay = isToday(day)

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[72px] sm:min-h-[85px] p-2 rounded-2xl flex flex-col items-start justify-between border transition-all text-left relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : isCurrentMonth
                      ? 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      : 'border-transparent opacity-30 bg-slate-50 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-lg w-5 h-5 flex items-center justify-center ${
                        isCurrentDay
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isSelected
                          ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  {/* Tiny Schedule preview pills */}
                  <div className="w-full space-y-1 mt-1">
                    {daySchedules.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate w-full"
                        title={s.title}
                      >
                        {s.activity_time} {s.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold pl-1">
                        +{daySchedules.length - 2} lagi
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Selected Date Detail Panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedDaySchedules.length} Kegiatan Terjadwal
                  </p>
                </div>
                {isToday(selectedDate) && <Badge variant="success">Hari Ini</Badge>}
              </div>
            </CardHeader>

            <CardContent className="p-0 pt-4 space-y-3 max-h-[480px] overflow-y-auto">
              {selectedDaySchedules.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">Tidak ada kegiatan piket pada tanggal ini.</p>
                  <Button variant="outline" size="sm" onClick={onOpenAddSchedule} className="text-xs">
                    + Jadwalkan di Tanggal Ini
                  </Button>
                </div>
              ) : (
                selectedDaySchedules.map((sched) => {
                  const assignedPjs = users.filter((u) => sched.pj_ids.includes(u.id))

                  return (
                    <div
                      key={sched.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5 transition hover:border-emerald-500/50"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="purple" className="capitalize text-[10px]">
                          {sched.category || 'Piket'}
                        </Badge>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {sched.activity_time} WIB
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {sched.title}
                      </h4>

                      {sched.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{sched.location}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {assignedPjs.map((p) => p.name).join(', ') || '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyWA(sched)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600"
                            title="Salin WA"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditSchedule(sched)}
                            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
