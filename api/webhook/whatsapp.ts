import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dqfdmgawzdnishfxwqnv.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmRtZ2F3emRuaXNoZnh3cW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzY1OTcsImV4cCI6MjA5NjAxMjU5N30.QnJmof6wKL_Hh6mTBnE1_wZQO-xEIxKVH72miKv69Eo'

const supabase = createClient(supabaseUrl, supabaseKey)

// Indonesian Date Parser
function parseDate(text: string): string {
  const lower = text.toLowerCase()
  const today = new Date()

  const daysMatch = lower.match(/(?:sebelum|dalam|selama)?\s*(\d+)\s*hari/i)
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10)
    if (!isNaN(days) && days > 0) {
      return new Date(Date.now() + 86400000 * days).toISOString().split('T')[0]
    }
  }

  if (lower.includes('lusa')) {
    return new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  }
  if (lower.includes('besok') || lower.includes('bsk')) {
    return new Date(Date.now() + 86400000).toISOString().split('T')[0]
  }
  if (lower.includes('hari ini') || lower.includes('hr ini')) {
    return today.toISOString().split('T')[0]
  }

  const daysMap: Record<string, number> = {
    minggu: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6
  }

  for (const [day, idx] of Object.entries(daysMap)) {
    if (lower.includes(day)) {
      const cur = today.getDay()
      let diff = idx - cur
      if (diff <= 0) diff += 7
      return new Date(today.getTime() + diff * 86400000).toISOString().split('T')[0]
    }
  }

  return new Date(Date.now() + 86400000).toISOString().split('T')[0]
}

function parseTime(text: string): string {
  const match = text.match(/(?:jam|pukul|pkl)?\s*(\d{1,2})[:.]?(\d{2})?\s*(pagi|siang|sore|malam)?/i)
  if (match) {
    let hour = parseInt(match[1], 10)
    const min = match[2] ? match[2].padStart(2, '0') : '00'
    const period = match[3]?.toLowerCase()
    if ((period === 'malam' || period === 'sore') && hour < 12) hour += 12
    if (period === 'siang' && hour < 10) hour += 12
    return `${hour.toString().padStart(2, '0')}:${min}`
  }
  return '08:00'
}

function extractTitle(text: string): string {
  const cleaned = text
    .replace(/^(?:tolong|mohon|bisa|coba|tolong dong)?\s*(?:catat(?:kan)?|ingat(?:kan)?|tambah(?:kan)?)\s*(?:tugas|jadwal|kegiatan)?\s*/i, '')
    .trim()

  const match = cleaned.match(/^(.*?)(?:\s+dan\s+ingatkan|\s+sebelum|\s+dalam|\s+pada|\s+jam|\s+pukul|\s+tgl|\s+tanggal|\s+untuk|$)/i)
  if (match && match[1] && match[1].trim().length > 2) {
    return match[1].trim()
  }
  return cleaned || 'Tugas Baru'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    const data = req.body || {}
    const incomingMsg = (data.message || data.text || '').toString().trim()
    const sender = (data.sender || data.from || 'WhatsApp User').toString()

    if (!incomingMsg) {
      return res.status(200).json({ status: false, reason: 'Empty message' })
    }

    const lower = incomingMsg.toLowerCase()

    // 1. Sapaan / Greeting
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
      const reply = `🤖 *Halo! Saya RoisAI Assistant*\n━━━━━━━━━━━━━━━━━━━━\nSiap membantu mencatat tugas, jadwal piket, dan pengingat WhatsApp otomatis.\n\nContoh perintah:\n1️⃣ *Catat Tugas:*\n_"Tolong catat tugas laporan lab dan ingatkan sebelum 3 hari mengerjakan"_\n\n2️⃣ *Cek Daftar Tugas:*\n_"Cek jadwal"_\n\n3️⃣ *Selesai/Hapus:*\n_"Tugas ini sudah selesai"_ (otomatis terhapus dari database)`

      return res.status(200).json({ reply, message: reply })
    }

    // 2. Tugas Selesai -> Hapus dari Database Supabase
    const isDone =
      lower.includes('sudah selesai') ||
      lower.includes('selesai') ||
      lower.includes('hapus tugas') ||
      lower.includes('sudah beres')

    if (isDone) {
      const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .order('activity_date', { ascending: true })

      if (!schedules || schedules.length === 0) {
        const reply = `ℹ️ *TIDAK ADA TUGAS AKTIF*\nSaat ini tidak ada daftar tugas atau jadwal piket di database.`
        return res.status(200).json({ reply, message: reply })
      }

      let target = schedules[0]
      for (const s of schedules) {
        const words = (s.title || '').toLowerCase().split(' ')
        if (words.some((w: string) => w.length > 3 && lower.includes(w))) {
          target = s
          break
        }
      }

      // Delete from Supabase
      await supabase.from('schedules').delete().eq('id', target.id)

      const reply = `✅ *TUGAS SELESAI & DIHAPUS DARI DATABASE!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Tugas:* ${target.title}\n📅 *Jadwal:* ${target.activity_date} ${target.activity_time} WIB\n\n🎉 Data tugas dan pengingat berhasil dihapus dari database PiketAI.`
      return res.status(200).json({ reply, message: reply })
    }

    // 3. Cek Daftar Tugas
    const isList =
      lower.includes('cek jadwal') ||
      lower.includes('daftar tugas') ||
      lower.includes('list tugas') ||
      lower.includes('jadwal apa saja') ||
      lower.includes('cek tugas')

    if (isList) {
      const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .order('activity_date', { ascending: true })
        .limit(5)

      if (!schedules || schedules.length === 0) {
        const reply = `📋 *DAFTAR TUGAS KOSONG*\nTidak ada jadwal tugas aktif di database.`
        return res.status(200).json({ reply, message: reply })
      }

      const items = schedules
        .map((s, idx) => `${idx + 1}. *${s.title}*\n   📅 ${s.activity_date} ${s.activity_time} WIB | 📍 ${s.location || '-'}`)
        .join('\n\n')

      const reply = `📋 *DAFTAR TUGAS AKTIF (${schedules.length})*\n━━━━━━━━━━━━━━━━━━━━\n${items}\n\n_Ketik "Tugas ini sudah selesai" jika tugas telah beres._`
      return res.status(200).json({ reply, message: reply })
    }

    // 4. Catat Tugas Baru ke Database Supabase
    let title = extractTitle(incomingMsg)
    const date = parseDate(incomingMsg)
    const time = parseTime(incomingMsg)
    const newId = 's_' + Date.now()

    let category = 'cleaning'
    if (lower.includes('keamanan') || lower.includes('patroli')) category = 'security'
    else if (lower.includes('rapat') || lower.includes('meeting')) category = 'event'
    else if (lower.includes('lab')) category = 'cleaning'
    else if (lower.includes('konsumsi')) category = 'other'

    let location = 'Sekretariat Utama'
    if (lower.includes('lab')) location = 'Lab Komputer'
    else if (lower.includes('auditorium')) location = 'Auditorium'

    // Insert to Supabase schedules
    await supabase.from('schedules').insert({
      id: newId,
      title,
      description: `Dibuat via WhatsApp chat: "${incomingMsg}"`,
      activity_date: date,
      activity_time: time,
      location,
      target_type: 'personal',
      whatsapp_target: sender,
      reminder_enabled: true,
      pj_ids: ['u1'],
      created_by: 'whatsapp_bot',
      status: 'upcoming',
      category
    })

    // Insert reminder
    await supabase.from('reminders').insert({
      id: 'r_' + Date.now(),
      schedule_id: newId,
      schedule_title: title,
      reminder_time: `${date} ${time}`,
      status: 'pending',
      target: sender,
      message_preview: `Pengingat jadwal: ${title} pada ${date} ${time} WIB.`
    })

    const reply = `✅ *TUGAS BERHASIL DICATAT OLEH ROISAI!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Tugas:* ${title}\n📅 *Tenggat/Jadwal:* ${date}\n⏰ *Pukul:* ${time} WIB\n📍 *Lokasi:* ${location}\n\n🔔 *Pengingat:* Aktif. Bot akan mengingatkan sebelum waktu tiba!\n\n_Ketik "Tugas ini sudah selesai" jika tugas telah dikerjakan._\n\n_PiketAI Automation_`

    return res.status(200).json({
      reply,
      message: reply
    })
  }

  return res.status(200).json({
    status: 'active',
    message: 'PiketAI WhatsApp Inbound Webhook is running.'
  })
}
