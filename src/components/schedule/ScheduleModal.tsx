import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Check,
  UserCheck,
  Smartphone
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store/appStore'
import { Schedule } from '@/types'
import { toast } from '@/components/ui/Toast'
import { normalizeWhatsAppNumber } from '@/lib/whatsappService'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  scheduleToEdit?: Schedule | null
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  scheduleToEdit
}) => {
  const { users, addSchedule, updateSchedule, schedules, whatsappConfig, currentUser } = useAppStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activityDate, setActivityDate] = useState('')
  const [activityTime, setActivityTime] = useState('')
  const [location, setLocation] = useState('')
  const [targetType, setTargetType] = useState<'personal' | 'group'>('personal')
  const [whatsappTarget, setWhatsappTarget] = useState('085040466426')
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [selectedPjIds, setSelectedPjIds] = useState<string[]>([])
  const [category, setCategory] = useState<Schedule['category']>('cleaning')
  const [conflicts, setConflicts] = useState<string[]>([])
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // Populate data if editing
  useEffect(() => {
    if (scheduleToEdit) {
      setTitle(scheduleToEdit.title)
      setDescription(scheduleToEdit.description)
      setActivityDate(scheduleToEdit.activity_date)
      setActivityTime(scheduleToEdit.activity_time)
      setLocation(scheduleToEdit.location)
      setTargetType(scheduleToEdit.target_type || 'personal')
      setWhatsappTarget(scheduleToEdit.whatsapp_target || whatsappConfig.targetDestination || '085040466426')
      setReminderEnabled(scheduleToEdit.reminder_enabled)
      setSelectedPjIds(scheduleToEdit.pj_ids || [])
      setCategory(scheduleToEdit.category || 'cleaning')
    } else {
      // Default new form values
      setTitle('')
      setDescription('')
      setActivityDate(new Date().toISOString().split('T')[0])
      setActivityTime('08:00')
      setLocation('Sekretariat Utama')
      setTargetType(whatsappConfig.targetType || 'personal')
      setWhatsappTarget(whatsappConfig.targetDestination || '085040466426')
      setReminderEnabled(true)
      setSelectedPjIds(['u1', 'u2'])
      setCategory('cleaning')
    }
  }, [scheduleToEdit, isOpen, whatsappConfig])

  // Conflict Detection on date/time/PJ change
  useEffect(() => {
    if (!activityDate || !activityTime || selectedPjIds.length === 0) {
      setConflicts([])
      return
    }

    const detected: string[] = []
    schedules.forEach((s) => {
      if (scheduleToEdit && s.id === scheduleToEdit.id) return

      if (s.activity_date === activityDate) {
        const overlappingPJs = s.pj_ids.filter((id) => selectedPjIds.includes(id))
        if (overlappingPJs.length > 0) {
          const names = users.filter((u) => overlappingPJs.includes(u.id)).map((u) => u.name).join(', ')
          detected.push(`⚠️ PJ ${names} sudah memiliki jadwal "${s.title}" pada jam ${s.activity_time}`)
        }
      }
    })

    setConflicts(detected)
  }, [activityDate, activityTime, selectedPjIds, schedules, scheduleToEdit, users])

  const togglePj = (userId: string) => {
    if (selectedPjIds.includes(userId)) {
      setSelectedPjIds(selectedPjIds.filter((id) => id !== userId))
    } else {
      setSelectedPjIds([...selectedPjIds, userId])
    }
  }

  const handleAiSmartFill = () => {
    setIsAiGenerating(true)
    setTimeout(() => {
      setTitle('Piket Koordinasi & Kebersihan Rutin')
      setDescription('Mempersiapkan ruangan, memeriksa papan pengumuman, dan merapikan arsip mingguan.')
      setLocation('Ruang Kerja Lantai 2')
      setCategory('cleaning')
      setIsAiGenerating(false)
      toast.success('AI Smart Template', 'Deskripsi dan detail berhasil diisi secara otomatis!')
    }, 600)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Gagal Menyimpan', 'Judul kegiatan wajib diisi.')
      return
    }

    if (selectedPjIds.length === 0) {
      toast.error('PJ Belum Dipilih', 'Pilih minimal 1 PJ bertugas.')
      return
    }

    const payload = {
      title,
      description,
      activity_date: activityDate,
      activity_time: activityTime,
      location,
      target_type: targetType,
      whatsapp_target: whatsappTarget,
      reminder_enabled: reminderEnabled,
      pj_ids: selectedPjIds,
      created_by: currentUser?.id || 'u1',
      category,
      status: 'upcoming' as const
    }

    if (scheduleToEdit) {
      updateSchedule(scheduleToEdit.id, payload)
      toast.success('Jadwal Diperbarui', `Jadwal "${title}" berhasil diubah. Target WA: ${whatsappTarget}`)
    } else {
      addSchedule(payload)
      toast.success('Jadwal Dibuat', `Jadwal "${title}" berhasil dijadwalkan & disiapkan notifikasi ke: ${whatsappTarget}`)
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scheduleToEdit ? 'Edit Jadwal Piket' : 'Buat Jadwal Piket Baru'}
      description="Atur nama kegiatan, tanggal, waktu, target nomor WhatsApp pribadi/grup, dan tetapkan PJ bertugas."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* AI Generator Helper Button */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              Gunakan Rekomendasi AI Piket
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiSmartFill}
            isLoading={isAiGenerating}
            className="text-xs border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
          >
            Auto-Fill AI
          </Button>
        </div>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Potensi Jadwal Bentrok Terdeteksi:</span>
            </div>
            {conflicts.map((c, i) => (
              <p key={i} className="text-xs text-amber-700 dark:text-amber-400 pl-6">
                {c}
              </p>
            ))}
          </div>
        )}

        {/* Title */}
        <Input
          label="Nama Kegiatan / Piket *"
          placeholder="Contoh: Piket Kebersihan Lab Komputer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Category & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">
              Kategori
            </label>
            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Schedule['category'])}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="cleaning">🧹 Kebersihan / Cleaning</option>
                <option value="security">🔒 Keamanan / Patroli</option>
                <option value="event">🎤 Acara / Dokumentasi</option>
                <option value="patrol">🚶 Ronda / Piket Umum</option>
                <option value="other">📌 Lainnya</option>
              </select>
            </div>
          </div>

          <Input
            label="Lokasi / Ruangan"
            placeholder="Contoh: Lab 204 Lt.2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tanggal Kegiatan *"
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />

          <Input
            label="Jam Kegiatan (WIB) *"
            type="time"
            value={activityTime}
            onChange={(e) => setActivityTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">
            Deskripsi Tugas
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tuliskan checklist atau hal-hal yang perlu dikerjakan..."
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg placeholder:text-zinc-400 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        {/* Multi-Select PJ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Pilih Person In Charge (PJ) *
            </label>
            <span className="text-xs text-zinc-400 font-medium">
              {selectedPjIds.length} PJ Terpilih
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
            {users.map((u) => {
              const isSelected = selectedPjIds.includes(u.id)
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => togglePj(u.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left border transition text-xs ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                  <span className="truncate flex-1">{u.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* WhatsApp & Reminder Integration */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Pengingat Otomatis WhatsApp
              </span>
            </div>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
            />
          </div>

          {reminderEnabled && (
            <div className="space-y-3 pt-1">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('personal')
                    if (!whatsappTarget || whatsappTarget.includes('@')) {
                      setWhatsappTarget(whatsappConfig.targetDestination || '085040466426')
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
                    targetType === 'personal'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nomor HP Pribadi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('group')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
                    targetType === 'group'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Grup WhatsApp</span>
                </button>
              </div>

              {/* Target input */}
              <Input
                label={targetType === 'personal' ? 'Nomor WhatsApp Target' : 'Group WhatsApp / JID'}
                placeholder={targetType === 'personal' ? '085040466426' : '120363045678901234@g.us'}
                value={whatsappTarget}
                onChange={(e) => setWhatsappTarget(e.target.value)}
                helper={targetType === 'personal' ? `Format dikirim: ${normalizeWhatsAppNumber(whatsappTarget)}` : 'ID atau JID Grup'}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            {scheduleToEdit ? 'Simpan Perubahan' : 'Buat Jadwal Sekarang'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
