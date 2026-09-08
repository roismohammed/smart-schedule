import React, { useState } from 'react'
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  Copy,
  Check,
  Edit2,
  Trash2,
  Download,
  Plus,
  MessageSquare,
  Sparkles,
  Smartphone,
  UserCheck
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { Schedule } from '@/types'
import { normalizeWhatsAppNumber } from '@/lib/whatsappService'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SchedulesViewProps {
  onOpenAddSchedule: () => void
  onEditSchedule: (schedule: Schedule) => void
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  onOpenAddSchedule,
  onEditSchedule
}) => {
  const { schedules, users, deleteSchedule, orgName } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPjFilter, setSelectedPjFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Filter Logic
  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory
    const matchesPj = selectedPjFilter === 'all' || s.pj_ids.includes(selectedPjFilter)

    return matchesSearch && matchesCategory && matchesPj
  })

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal "${title}"?`)) {
      deleteSchedule(id)
      toast.success('Jadwal Dihapus', `Jadwal "${title}" telah dihapus.`)
    }
  }

  const handleCopyWhatsApp = (schedule: Schedule) => {
    const pjNames = users
      .filter((u) => schedule.pj_ids.includes(u.id))
      .map((u) => u.name)
      .join(', ')

    const text = `📢 *PENGINGAT JADWAL PIKET*
━━━━━━━━━━━━━━━━━━━━
📌 *Kegiatan:* ${schedule.title}
📅 *Tanggal:* ${schedule.activity_date}
⏰ *Pukul:* ${schedule.activity_time} WIB
📍 *Lokasi:* ${schedule.location || '-'}
👥 *Petugas PJ:* ${pjNames || 'Semua'}

📝 *Deskripsi:*
${schedule.description || 'Harap hadir tepat waktu dan memastikan seluruh tugas selesai.'}

_PiketAI Automation - ${orgName}_`

    navigator.clipboard.writeText(text)
    setCopiedId(schedule.id)
    toast.success('Format WhatsApp Tersalin!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Export PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Title & Header
    doc.setFontSize(18)
    doc.text(`Laporan Jadwal Piket - ${orgName}`, 14, 20)
    doc.setFontSize(10)
    doc.text(`Digenerate otomatis oleh PiketAI pada ${new Date().toLocaleDateString('id-ID')}`, 14, 28)

    const tableRows = filteredSchedules.map((s, index) => {
      const pjNames = users
        .filter((u) => s.pj_ids.includes(u.id))
        .map((u) => u.name)
        .join(', ')

      return [
        index + 1,
        s.title,
        `${s.activity_date}\n${s.activity_time} WIB`,
        s.location || '-',
        pjNames || '-',
        s.whatsapp_target || '-'
      ]
    })

    autoTable(doc, {
      startY: 35,
      head: [['No', 'Kegiatan', 'Waktu', 'Lokasi', 'Penanggung Jawab (PJ)', 'Target WhatsApp']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105] },
      styles: { fontSize: 8, cellPadding: 3 }
    })

    doc.save(`PiketAI_Jadwal_${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('Ekspor PDF Berhasil!', 'File PDF jadwal piket telah diunduh.')
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Manajemen Jadwal</h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Kelola seluruh jadwal piket, filter berdasarkan kategori dan petugas PJ bertugas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs">
            <Download className="w-3.5 h-3.5" />
            Ekspor PDF
          </Button>
          <Button onClick={onOpenAddSchedule} size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <Input
              placeholder="Cari kegiatan, lokasi, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="cleaning">🧹 Kebersihan</option>
              <option value="security">🔒 Keamanan</option>
              <option value="event">🎤 Acara / Event</option>
              <option value="patrol">🚶 Ronda</option>
              <option value="other">📌 Lainnya</option>
            </select>
          </div>

          {/* PJ Filter */}
          <div>
            <select
              value={selectedPjFilter}
              onChange={(e) => setSelectedPjFilter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Petugas PJ</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Schedule Items List */}
      {filteredSchedules.length === 0 ? (
        <Card className="p-12 text-center text-zinc-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <h4 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
            Tidak ada jadwal yang cocok
          </h4>
          <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((schedule) => {
            const assignedPjs = users.filter((u) => schedule.pj_ids.includes(u.id))
            const isPersonal = schedule.target_type === 'personal' || (schedule.whatsapp_target && !schedule.whatsapp_target.includes('@'))

            return (
              <Card
                key={schedule.id}
                className="p-5 flex flex-col justify-between hover:border-emerald-500/50 transition duration-150 group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="purple" className="capitalize">
                        {schedule.category || 'Piket'}
                      </Badge>
                      {schedule.reminder_enabled && (
                        <Badge variant="success" className="text-[10px]">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {isPersonal ? 'Direct WA' : 'Grup WA'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {schedule.activity_time} WIB
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {schedule.title}
                    </h4>
                    {schedule.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {schedule.description}
                      </p>
                    )}
                  </div>

                  {/* Details (Date, Location, WA Target) */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{schedule.activity_date}</span>
                    </div>
                    {schedule.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate">{schedule.location}</span>
                      </div>
                    )}
                    {schedule.whatsapp_target && (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Target: {schedule.whatsapp_target}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned PJs */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-zinc-400 font-medium">PJ:</span>
                      <div className="flex -space-x-1.5">
                        {assignedPjs.map((pj) => (
                          <img
                            key={pj.id}
                            src={pj.avatar}
                            alt={pj.name}
                            title={pj.name}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                        {assignedPjs.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
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
                        <Copy className="w-3 h-3" /> Copy Pesan WA
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditSchedule(schedule)}
                      className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit Jadwal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id, schedule.title)}
                      className="p-2 text-zinc-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
