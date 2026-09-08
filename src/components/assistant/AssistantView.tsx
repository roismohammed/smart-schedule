import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  Check,
  Calendar,
  Clock,
  MapPin,
  Users,
  Copy,
  Trash2,
  Lightbulb,
  CornerDownLeft,
  Wand2
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { Schedule } from '@/types'

export const AssistantView: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    users,
    schedules,
    addSchedule,
    aiConfig,
    orgName
  } = useAppStore()

  const [inputPrompt, setInputPrompt] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isTyping])

  // Smart NLP schedule extractor
  const parseNaturalLanguage = (text: string) => {
    const lower = text.toLowerCase()

    // Title inference
    let title = 'Piket / Kegiatan Rutin'
    if (lower.includes('meeting') || lower.includes('rapat')) title = 'Rapat Koordinasi Tim'
    else if (lower.includes('kebersihan') || lower.includes('bersih')) title = 'Piket Kebersihan Lingkungan'
    else if (lower.includes('dokumentasi') || lower.includes('foto')) title = 'Dokumentasi & Publikasi Acara'
    else if (lower.includes('keamanan') || lower.includes('patroli')) title = 'Piket Keamanan & Ronda Malam'
    else if (lower.includes('konsumsi')) title = 'Piket Konsumsi & Logistik'

    // Date inference
    const today = new Date()
    let targetDate = today.toISOString().split('T')[0]
    if (lower.includes('besok')) {
      const tomorrow = new Date(today.getTime() + 86400000)
      targetDate = tomorrow.toISOString().split('T')[0]
    } else if (lower.includes('lusa')) {
      const lusa = new Date(today.getTime() + 86400000 * 2)
      targetDate = lusa.toISOString().split('T')[0]
    }

    // Time inference
    let targetTime = '08:00'
    const timeMatch = lower.match(/(\d{1,2})([.:]\d{2})?\s*(pagi|siang|sore|malam)?/)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10)
      const period = timeMatch[3]
      if (period === 'siang' && hour < 12) hour += 0
      if (period === 'sore' && hour < 12) hour += 12
      if (period === 'malam' && hour < 12) hour += 12
      targetTime = `${hour.toString().padStart(2, '0')}:00`
    }

    // PJ match
    const matchedPjs = users.filter((u) => lower.includes(u.name.toLowerCase().split(' ')[0]))
    const pjIds = matchedPjs.length > 0 ? matchedPjs.map((u) => u.id) : ['u1', 'u2']

    return {
      title,
      activity_date: targetDate,
      activity_time: targetTime,
      location: lower.includes('lab') ? 'Lab Komputer' : lower.includes('hall') ? 'Auditorium' : 'Sekretariat Utama',
      pj_ids: pjIds,
      category: (lower.includes('bersih') ? 'cleaning' : lower.includes('rapat') ? 'event' : 'other') as Schedule['category'],
      description: `Dibuat otomatis oleh PiketAI dari instruksi: "${text}"`,
      whatsapp_group: 'Grup Pengurus Harian 2026',
      reminder_enabled: true,
      created_by: 'u1'
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt
    if (!query.trim() || isTyping) return

    addChatMessage({
      sender: 'user',
      text: query
    })
    setInputPrompt('')
    setIsTyping(true)

    setTimeout(() => {
      const lower = query.toLowerCase()

      if (lower.includes('besok') || lower.includes('jam') || lower.includes('jadwal') || lower.includes('pj') || lower.includes('rapat') || lower.includes('meeting')) {
        const parsed = parseNaturalLanguage(query)
        const pjNames = users.filter((u) => parsed.pj_ids.includes(u.id)).map((u) => u.name).join(' & ')

        addChatMessage({
          sender: 'assistant',
          text: `✨ Berhasil mengekstrak data jadwal dari pesan Anda:\n\n📌 **Kegiatan:** ${parsed.title}\n📅 **Tanggal:** ${parsed.activity_date}\n⏰ **Pukul:** ${parsed.activity_time} WIB\n📍 **Lokasi:** ${parsed.location}\n👥 **PJ Bertugas:** ${pjNames}\n\nIngin langsung saya jadwalkan ke kalender dan aktifkan notifikasi WhatsApp?`,
          parsedSchedule: parsed,
          suggestedAction: 'create_schedule'
        })
      } else if (lower.includes('rekomendasi') || lower.includes('beban')) {
        addChatMessage({
          sender: 'assistant',
          text: `💡 **Rekomendasi Penugasan PJ oleh PiketAI:**\n\n1. **Dimas Setiawan** memiliki beban tugas paling sedikit minggu ini (hanya 1 jadwal aktif). Sangat direkomendasikan untuk tugas berikutnya.\n2. **Andi Pratama & Citra Dewi** saat ini telah memegang 3 jadwal piket. Hindari memberikan tugas beruntun agar workload tetap seimbang.`
        })
      } else if (lower.includes('ingatkan') || lower.includes('wa') || lower.includes('whatsapp')) {
        addChatMessage({
          sender: 'assistant',
          text: `📢 **Contoh Pesan Pengingat Otomatis:**\n\n"Halo rekan-rekan pengurus 👋\nPengingat piket untuk besok pagi pukul 08.00 WIB.\nPetugas PJ: *Andi & Budi*.\nLokasi: Ruang Sekretariat Utama.\n\nMohon hadir 10 menit sebelum waktu dimulai ya. Semangat bertugas!"`
        })
      } else {
        addChatMessage({
          sender: 'assistant',
          text: `Saya mengerti! Saya dapat membantu Anda dengan:\n- Membuat jadwal baru via obrolan (contoh: *"Jadwalkan piket lab besok jam 9 pagi PJ Dimas"*)\n- Menganalisis beban kerja anggota PJ (*"Rekomendasikan PJ yang sedang senggang"*)\n- Membuat format broadcast WhatsApp (*"Buatkan pesan pengingat rapat"*)\n\nSilakan coba salah satu contoh di atas!`
        })
      }
      setIsTyping(false)
    }, 900)
  }

  const handleConfirmAddParsedSchedule = (parsed: Partial<Schedule>) => {
    if (!parsed.title || !parsed.activity_date) return

    addSchedule({
      title: parsed.title,
      description: parsed.description || '',
      activity_date: parsed.activity_date,
      activity_time: parsed.activity_time || '08:00',
      location: parsed.location || 'Sekretariat Utama',
      target_type: parsed.target_type || 'personal',
      whatsapp_target: parsed.whatsapp_target || '085040466426',
      reminder_enabled: true,
      pj_ids: parsed.pj_ids || ['u1'],
      created_by: 'u1',
      status: 'upcoming',
      category: parsed.category || 'cleaning'
    })

    toast.success('Jadwal Berhasil Dibuat!', `"${parsed.title}" sudah masuk ke kalender dan antrean WhatsApp.`)
  }

  const quickPrompts = [
    'Meeting besok jam 8 pagi PJ Andi dan Budi',
    'Piket kebersihan lab lusa jam 10 PJ Citra dan Dimas',
    'Rekomendasikan PJ yang beban kerjanya paling sedikit',
    'Buatkan template broadcast pengingat WhatsApp'
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              PiketAI Assistant
              <Badge variant="purple" className="text-[10px]">
                {aiConfig.model}
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konversi bahasa alami jadi jadwal, deteksi jadwal bentrok, dan generate pesan WhatsApp.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          className="text-xs text-slate-500 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Bersihkan Chat
        </Button>
      </div>

      {/* Main Chat Window */}
      <Card className="flex flex-col h-[560px] overflow-hidden border-slate-200 dark:border-slate-800">
        {/* Messages Flow Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user'

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Extracted Schedule Card Action */}
                    {msg.parsedSchedule && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <Wand2 className="w-3.5 h-3.5" /> Data Terstruktur AI
                          </span>
                          <Badge variant="success">Valid</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <div>📅 {msg.parsedSchedule.activity_date}</div>
                          <div>⏰ {msg.parsedSchedule.activity_time} WIB</div>
                          <div className="col-span-2">📍 {msg.parsedSchedule.location}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAddParsedSchedule(msg.parsedSchedule!)}
                          className="w-full text-xs mt-2"
                        >
                          <Check className="w-3.5 h-3.5" /> Konfirmasi & Simpan Jadwal
                        </Button>
                      </div>
                    )}
                  </div>

                  <span className={`block text-[10px] text-slate-400 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            )
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">PiketAI sedang memproses...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage()
            }}
            placeholder="Ketik instruksi jadwal atau minta bantuan AI... (Tekan Enter)"
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            onClick={() => handleSendMessage()}
            isLoading={isTyping}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl"
            size="md"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
