import { useAppStore } from '@/store/appStore'
import { Schedule } from '@/types'

export interface ParsedWhatsAppResult {
  action: 'greet' | 'create' | 'complete' | 'list'
  title?: string
  date?: string
  time?: string
  location?: string
  pjIds?: string[]
  pjNames?: string[]
  category?: Schedule['category']
  description?: string
  rawText: string
}

// Indonesian Date Parser
export const parseIndonesianDate = (text: string): string => {
  const lower = text.toLowerCase()
  const today = new Date()

  // Match N hari (e.g. "3 hari", "sebelum 3 hari", "dalam 4 hari")
  const daysMatch = lower.match(/(?:sebelum|dalam|selama)?\s*(\d+)\s*hari/i)
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10)
    if (!isNaN(days) && days > 0) {
      const d = new Date(Date.now() + 86400000 * days)
      return d.toISOString().split('T')[0]
    }
  }

  if (lower.includes('lusa')) {
    const d = new Date(Date.now() + 86400000 * 2)
    return d.toISOString().split('T')[0]
  }

  if (lower.includes('besok') || lower.includes('bsk')) {
    const d = new Date(Date.now() + 86400000)
    return d.toISOString().split('T')[0]
  }

  if (lower.includes('hari ini') || lower.includes('hr ini') || lower.includes('now')) {
    return today.toISOString().split('T')[0]
  }

  const daysMap: Record<string, number> = {
    minggu: 0,
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6
  }

  for (const [dayName, dayIndex] of Object.entries(daysMap)) {
    if (lower.includes(dayName)) {
      const currentDay = today.getDay()
      let diff = dayIndex - currentDay
      if (diff <= 0) diff += 7
      const targetDate = new Date(today.getTime() + diff * 86400000)
      return targetDate.toISOString().split('T')[0]
    }
  }

  // Default to 1 day later
  const defaultDate = new Date(Date.now() + 86400000)
  return defaultDate.toISOString().split('T')[0]
}

// Indonesian Time Parser
export const parseIndonesianTime = (text: string): string => {
  const timeRegex = /(?:jam|pukul|pkl)?\s*(\d{1,2})[:.]?(\d{2})?\s*(pagi|siang|sore|malam)?/i
  const match = text.match(timeRegex)

  if (match) {
    let hour = parseInt(match[1], 10)
    const minute = match[2] ? match[2].padStart(2, '0') : '00'
    const period = match[3]?.toLowerCase()

    if (period === 'malam' && hour < 12) hour += 12
    if (period === 'sore' && hour < 12) hour += 12
    if (period === 'siang' && hour < 10) hour += 12

    return `${hour.toString().padStart(2, '0')}:${minute}`
  }

  return '08:00'
}

// Extract task title from natural sentence
export const extractTaskTitle = (text: string): string => {
  const cleaned = text
    .replace(/^(?:tolong|mohon|bisa|coba|tolong dong|please)?\s*(?:catat(?:kan)?|ingat(?:kan)?|tambah(?:kan)?)\s*(?:tugas|jadwal|kegiatan)?\s*/i, '')
    .trim()

  const match = cleaned.match(/^(.*?)(?:\s+dan\s+ingatkan|\s+sebelum|\s+dalam|\s+pada|\s+jam|\s+pukul|\s+tgl|\s+tanggal|\s+untuk|$)/i)
  if (match && match[1] && match[1].trim().length > 2) {
    return match[1].trim()
  }

  return cleaned || 'Tugas Baru'
}

// Process Inbound WhatsApp text
export const processInboundWhatsAppMessage = (
  rawText: string
): { parsed: ParsedWhatsAppResult; replyMessage: string } => {
  const store = useAppStore.getState()
  const { users, schedules, addSchedule, deleteSchedule, orgName, whatsappConfig } = store
  const lower = rawText.toLowerCase().trim()

  // 1. GREETING / ROISAI CHECK
  const isGreeting =
    lower.startsWith('hallo rois') ||
    lower.startsWith('halo rois') ||
    lower === 'roisai' ||
    lower === 'rois ai' ||
    lower === 'hai rois' ||
    lower === 'halo' ||
    lower === 'hallo' ||
    lower === 'ping' ||
    lower === 'p'

  if (isGreeting && !lower.includes('catat') && !lower.includes('selesai') && !lower.includes('hapus')) {
    const replyMessage = `🤖 *Halo! Saya RoisAI Assistant*\n━━━━━━━━━━━━━━━━━━━━\nSiap membantu Anda mencatat tugas, jadwal piket, dan pengingat WhatsApp otomatis.\n\nContoh perintah:\n1️⃣ *Catat Tugas:*\n_"Tolong catat tugas laporan lab dan ingatkan sebelum 3 hari mengerjakan"_\n\n2️⃣ *Cek Daftar Tugas:*\n_"Cek jadwal"_ atau _"Daftar tugas"_\n\n3️⃣ *Selesaikan Tugas:*\n_"Tugas ini sudah selesai"_ (otomatis terhapus dari database)`

    return {
      parsed: { action: 'greet', rawText },
      replyMessage
    }
  }

  // 2. TASK COMPLETION / DELETION (Tugas Selesai -> Hapus dari Database)
  const isDone =
    lower.includes('sudah selesai') ||
    lower.includes('selesai') ||
    lower.includes('hapus tugas') ||
    lower.includes('sudah beres') ||
    lower.includes('telah selesai')

  if (isDone) {
    if (schedules.length === 0) {
      return {
        parsed: { action: 'complete', rawText },
        replyMessage: `ℹ️ *TIDAK ADA TUGAS AKTIF*\nSaat ini tidak ada daftar tugas atau jadwal piket yang tersimpan di database.`
      }
    }

    // Try finding specific task by keyword or take latest/first active
    let targetSchedule = schedules[0]
    for (const s of schedules) {
      const titleWords = s.title.toLowerCase().split(' ')
      if (titleWords.some((w) => w.length > 3 && lower.includes(w))) {
        targetSchedule = s
        break
      }
    }

    // Delete from Zustand and Supabase
    deleteSchedule(targetSchedule.id)

    const replyMessage = `✅ *TUGAS SELESAI & TERHAPUS DARI DATABASE!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Tugas:* ${targetSchedule.title}\n📅 *Jadwal:* ${targetSchedule.activity_date} ${targetSchedule.activity_time} WIB\n📍 *Lokasi:* ${targetSchedule.location}\n\n🎉 *Status:* Tugas telah ditandai selesai dan data berhasil dihapus dari database PiketAI.\n\n_${orgName}_`

    return {
      parsed: {
        action: 'complete',
        title: targetSchedule.title,
        rawText
      },
      replyMessage
    }
  }

  // 3. CHECK / LIST SCHEDULES
  const isList =
    lower.includes('cek jadwal') ||
    lower.includes('daftar tugas') ||
    lower.includes('list tugas') ||
    lower.includes('jadwal apa saja') ||
    lower.includes('cek tugas') ||
    lower.includes('lihat tugas')

  if (isList) {
    if (schedules.length === 0) {
      return {
        parsed: { action: 'list', rawText },
        replyMessage: `📋 *DAFTAR TUGAS KOSONG*\nTidak ada tugas atau jadwal piket aktif saat ini. Kirim chat: *"Tolong catat tugas X sebelum Y hari"* untuk menambah baru.`
      }
    }

    const items = schedules
      .slice(0, 5)
      .map((s, idx) => `${idx + 1}. *${s.title}*\n   📅 ${s.activity_date} ${s.activity_time} WIB | 📍 ${s.location}`)
      .join('\n\n')

    return {
      parsed: { action: 'list', rawText },
      replyMessage: `📋 *DAFTAR TUGAS AKTIF (${schedules.length})*\n━━━━━━━━━━━━━━━━━━━━\n${items}\n\n_Ketik "Tugas ini sudah selesai" untuk menghapus tugas yang telah beres._`
    }
  }

  // 4. TASK RECORDING / CREATION (Default)
  let category: Schedule['category'] = 'cleaning'
  let extracted = extractTaskTitle(rawText)
  let title = extracted

  if (lower.includes('keamanan') || lower.includes('patroli') || lower.includes('kunci') || lower.includes('ronda')) {
    category = 'security'
  } else if (lower.includes('rapat') || lower.includes('meeting') || lower.includes('briefing') || lower.includes('evaluasi')) {
    category = 'event'
  } else if (lower.includes('konsumsi') || lower.includes('snack') || lower.includes('makan')) {
    category = 'other'
  } else if (lower.includes('lab') || lower.includes('laboratorium')) {
    category = 'cleaning'
  }

  const targetDate = parseIndonesianDate(rawText)
  const targetTime = parseIndonesianTime(rawText)

  let location = 'Sekretariat Utama'
  if (lower.includes('lab 204') || lower.includes('lab kom')) location = 'Lab Komputer 204'
  else if (lower.includes('lab')) location = 'Laboratorium Komputer'
  else if (lower.includes('auditorium')) location = 'Auditorium Utama'
  else if (lower.includes('ruang rapat') || lower.includes('senat')) location = 'Ruang Rapat Senat'
  else if (lower.includes('basecamp')) location = 'Basecamp Pengurus'

  const matchedUsers = users.filter((u) => lower.includes(u.name.toLowerCase().split(' ')[0]))
  const pjIds = matchedUsers.length > 0 ? matchedUsers.map((u) => u.id) : ['u1']
  const pjNames = matchedUsers.length > 0 ? matchedUsers.map((u) => u.name) : ['Andi Pratama']

  const parsed: ParsedWhatsAppResult = {
    action: 'create',
    title,
    date: targetDate,
    time: targetTime,
    location,
    pjIds,
    pjNames,
    category,
    description: `Dibuat via WhatsApp: "${rawText}"`,
    rawText
  }

  // Save into Zustand & Supabase
  addSchedule({
    title,
    description: parsed.description || '',
    activity_date: targetDate,
    activity_time: targetTime,
    location,
    target_type: whatsappConfig.targetType || 'personal',
    whatsapp_target: whatsappConfig.targetDestination || '085040466426',
    reminder_enabled: true,
    pj_ids: pjIds,
    created_by: 'u1',
    status: 'upcoming',
    category
  })

  const replyMessage = `✅ *TUGAS BERHASIL DICATAT OLEH ROISAI!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Tugas:* ${title}\n📅 *Tenggat/Jadwal:* ${targetDate}\n⏰ *Pukul:* ${targetTime} WIB\n📍 *Lokasi:* ${location}\n👥 *PJ Bertugas:* ${pjNames.join(', ')}\n\n🔔 *Pengingat:* Aktif. Bot akan mengingatkan sebelum jadwal tiba!\n\n_Ketik "Tugas ini sudah selesai" jika tugas telah dikerjakan._\n\n_${orgName}_`

  return { parsed, replyMessage }
}
