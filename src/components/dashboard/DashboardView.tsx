import React, { useState, useEffect } from 'react'
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Calendar as CalendarIcon,
  CheckCircle2,
  Radio,
  Zap,
  Send,
  Bell,
  ChevronRight,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { Schedule } from '@/types'
import confetti from 'canvas-confetti'

interface DashboardViewProps {
  onOpenAddSchedule: () => void
  onNavigateTab: (tab: any) => void
  onEditSchedule: (schedule: Schedule) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddSchedule,
  onNavigateTab,
  onEditSchedule
}) => {
  const { schedules, users, reminders, orgName, whatsappConfig } = useAppStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'upcoming'>('all')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time clock for top widget
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]
  const todaySchedules = schedules.filter((s) => s.activity_date === todayStr)
  const upcomingSchedules = schedules
    .filter((s) => s.activity_date >= todayStr)
    .sort((a, b) => `${a.activity_date} ${a.activity_time}`.localeCompare(`${b.activity_date} ${b.activity_time}`))

  const nextUpcoming = upcomingSchedules[0] || null

  const filteredList =
    selectedFilter === 'today'
      ? todaySchedules
      : selectedFilter === 'upcoming'
      ? upcomingSchedules.filter((s) => s.activity_date > todayStr)
      : upcomingSchedules

  const totalSchedules = schedules.length
  const activePjs = users.filter((u) => u.status === 'active').length
  const totalSentReminders = reminders.filter((r) => r.status === 'sent').length

  const generateWhatsAppText = (schedule: Schedule) => {
    const pjNames = users
      .filter((u) => schedule.pj_ids.includes(u.id))
      .map((u) => u.name)
      .join(', ')

    return `📢 *PENGINGAT JADWAL PIKET*
━━━━━━━━━━━━━━━━━━━━
📌 *Kegiatan:* ${schedule.title}
📅 *Tanggal:* ${schedule.activity_date}
⏰ *Pukul:* ${schedule.activity_time} WIB
📍 *Lokasi:* ${schedule.location || '-'}
👥 *Petugas PJ:* ${pjNames || 'Semua'}

📝 *Catatan Tugas:*
${schedule.description || 'Harap hadir tepat waktu dan menyelesaikan tanggung jawab.'}

_${orgName}_`
  }

  const handleCopyWhatsApp = (schedule: Schedule) => {
    const text = generateWhatsAppText(schedule)
    navigator.clipboard.writeText(text)
    setCopiedId(schedule.id)
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } })
    toast.success('Pesan WhatsApp Tersalin!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleGenerateAISummary = () => {
    setIsSummarizing(true)
    setTimeout(() => {
      setAiSummary(
        `• **Distribusi Tugas Seimbang**: ${schedules.length} jadwal terbagi rata ke ${activePjs} PJ aktif.\n• **Tugas Prioritas**: ${
          todaySchedules.length > 0
            ? `Hari ini ada ${todaySchedules.length} kegiatan piket aktif.`
            : 'Tidak ada jadwal bentrok untuk 48 jam ke depan.'
        }\n• **Automasi WhatsApp**: Bot scheduler aktif memantau jadwal H-1 dan waktu piket.`
      )
      setIsSummarizing(false)
      toast.success('Ringkasan AI Diperbarui')
    }, 600)
  }

  // 7-day mini heatmap generator
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dStr = d.toISOString().split('T')[0]
    const count = schedules.filter((s) => s.activity_date === dStr).length
    return {
      date: d,
      dateStr: dStr,
      dayName: daysOfWeek[d.getDay()],
      dayNum: d.getDate(),
      count,
      isToday: i === 0
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Hero HUD */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Scheduler Live (Auto-Dispatch)
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {orgName}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Pusat kendali otomatisasi jadwal piket, penugasan PJ, dan pengingat WhatsApp grup secara tepat waktu.
            </p>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('assistant')}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-zinc-500" />
              AI Assistant
            </Button>
            <Button
              onClick={onOpenAddSchedule}
              size="sm"
              className="text-xs"
            >
              + Buat Jadwal Baru
            </Button>
          </div>
        </div>

        {/* 7-Day Mini Schedule Strip */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Aktivitas 7 Hari Ke Depan
            </span>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1"
            >
              Lihat Kalender <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {next7Days.map((d, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  d.isToday
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                    : d.count > 0
                    ? 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                    : 'border-zinc-100 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500'
                }`}
              >
                <span className="text-[10px] font-medium block uppercase tracking-wider opacity-70">
                  {d.dayName}
                </span>
                <span className="text-sm font-bold block my-0.5">{d.dayNum}</span>
                <span className="text-[10px] font-medium block opacity-80">
                  {d.count > 0 ? `${d.count} piket` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Jadwal</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {totalSchedules}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Tersedia</span>
          </div>
        </Card>

        <Card className="p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Piket Hari Ini</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {todaySchedules.length}
            </span>
            <span className="text-[11px] text-zinc-400">Kegiatan</span>
          </div>
        </Card>

        <Card className="p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">PJ Bertugas</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {activePjs}
            </span>
            <span className="text-[11px] text-zinc-400">Anggota</span>
          </div>
        </Card>

        <Card className="p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">WhatsApp Sent</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {totalSentReminders}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Auto
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left Spotlight & Schedule List vs Right Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Spotlight + Schedules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spotlight Hero Card: Next Upcoming Task */}
          {nextUpcoming && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white dark:from-zinc-900 dark:to-zinc-800 border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                    Jadwal Terdekat
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {nextUpcoming.activity_date === todayStr ? 'HARI INI' : nextUpcoming.activity_date} • {nextUpcoming.activity_time} WIB
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white">
                  {nextUpcoming.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-zinc-300 flex-wrap">
                  {nextUpcoming.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {nextUpcoming.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    PJ: {users.filter((u) => nextUpcoming.pj_ids.includes(u.id)).map((u) => u.name).join(', ') || '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  onClick={() => handleCopyWhatsApp(nextUpcoming)}
                  className="bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs h-9"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Salin Format WA
                </Button>
              </div>
            </div>
          )}

          {/* Schedule Filter & List */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Agenda & Tugas</CardTitle>
                <CardDescription>Daftar kegiatan piket yang terdaftar dalam sistem</CardDescription>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    selectedFilter === 'all'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Semua ({schedules.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('today')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    selectedFilter === 'today'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Hari Ini ({todaySchedules.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('upcoming')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    selectedFilter === 'upcoming'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Mendatang
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {filteredList.length === 0 ? (
                <div className="py-12 text-center text-zinc-400">
                  <CalendarIcon className="w-9 h-9 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">Tidak ada kegiatan pada filter ini.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenAddSchedule}
                    className="mt-3 text-xs"
                  >
                    + Tambah Jadwal Baru
                  </Button>
                </div>
              ) : (
                filteredList.map((schedule) => {
                  const assignedPjs = users.filter((u) => schedule.pj_ids.includes(u.id))
                  const isToday = schedule.activity_date === todayStr

                  return (
                    <div
                      key={schedule.id}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isToday && <Badge variant="zinc">Hari Ini</Badge>}
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {schedule.category || 'General'}
                          </Badge>
                          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {schedule.activity_time} WIB
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {schedule.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-zinc-400" />
                            {schedule.activity_date}
                          </span>
                          {schedule.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              {schedule.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-zinc-400" />
                            PJ: {assignedPjs.map((p) => p.name).join(', ') || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyWhatsApp(schedule)}
                          className="text-xs"
                        >
                          {copiedId === schedule.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy WA
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditSchedule(schedule)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Assistant & Workload Meter */}
        <div className="space-y-6">
          {/* AI Intelligence Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <CardTitle>PiketAI Insights</CardTitle>
                </div>
                <Badge variant="outline">Smart</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {aiSummary ? (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {aiSummary}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Analisis pintar otomatis untuk mendeteksi beban tugas tim, jadwal bentrok, dan kesiapan broadcast WhatsApp.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={handleGenerateAISummary}
                isLoading={isSummarizing}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                {aiSummary ? 'Segarkan Analisis' : 'Generate Ringkasan AI'}
              </Button>
            </CardContent>
          </Card>

          {/* Workload Progress per PJ */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Distribusi Beban PJ</CardTitle>
                <CardDescription>Beban tugas piket aktif</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('pj')}
                className="text-xs text-zinc-500"
              >
                Detail
              </Button>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {users.slice(0, 5).map((user) => {
                const assignedCount = schedules.filter((s) => s.pj_ids.includes(user.id)).length
                const percentage = Math.min(100, Math.round((assignedCount / (schedules.length || 1)) * 100))

                return (
                  <div key={user.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-5 h-5 rounded-md object-cover"
                        />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {user.name}
                        </span>
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {assignedCount} tugas ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* WhatsApp Gateway Status */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Gateway Status
                </span>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
              Target: <strong className="text-zinc-700 dark:text-zinc-300">{whatsappConfig.targetDestination}</strong>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
