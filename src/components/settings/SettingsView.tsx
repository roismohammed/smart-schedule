import React, { useState } from 'react'
import {
  Settings,
  MessageSquare,
  Bot,
  Building2,
  Key,
  ShieldCheck,
  Send,
  Sparkles,
  Smartphone,
  Check,
  UserCheck,
  Users,
  ExternalLink
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { processInboundWhatsAppMessage } from '@/lib/inboundWhatsAppService'
import { normalizeWhatsAppNumber, sendWhatsAppViaGateway, getWhatsAppDirectUrl } from '@/lib/whatsappService'

export const SettingsView: React.FC = () => {
  const {
    orgName,
    setOrgName,
    whatsappConfig,
    updateWhatsAppConfig,
    aiConfig,
    updateAIConfig
  } = useAppStore()

  // Local form states
  const [localOrgName, setLocalOrgName] = useState(orgName)
  const [waApiKey, setWaApiKey] = useState(whatsappConfig.apiKey)
  const [waPhoneNumberId, setWaPhoneNumberId] = useState(whatsappConfig.phoneNumberId)
  const [targetType, setTargetType] = useState<'personal' | 'group'>(whatsappConfig.targetType || 'personal')
  const [targetDestination, setTargetDestination] = useState(whatsappConfig.targetDestination || '085040466426')
  const [targetName, setTargetName] = useState(whatsappConfig.targetName || 'Nomor WhatsApp Saya')
  const [autoH1, setAutoH1] = useState(whatsappConfig.autoH1)
  const [autoH1Hour, setAutoH1Hour] = useState(whatsappConfig.autoH1Hour)

  const [aiApiKey, setAiApiKey] = useState(aiConfig.apiKey)
  const [aiModel, setAiModel] = useState(aiConfig.model)
  const [aiTone, setAiTone] = useState(aiConfig.tone)
  const [aiCustomPrompt, setAiCustomPrompt] = useState(aiConfig.customPrompt || '')

  const [isTestingWa, setIsTestingWa] = useState(false)

  // Sync with store when fetched from Supabase
  React.useEffect(() => {
    setLocalOrgName(orgName)
    setWaApiKey(whatsappConfig.apiKey)
    setWaPhoneNumberId(whatsappConfig.phoneNumberId)
    setTargetType(whatsappConfig.targetType || 'personal')
    setTargetDestination(whatsappConfig.targetDestination || '085040466426')
    setTargetName(whatsappConfig.targetName || 'Nomor WhatsApp Saya')
    setAutoH1(whatsappConfig.autoH1)
    setAutoH1Hour(whatsappConfig.autoH1Hour)
    setAiApiKey(aiConfig.apiKey)
    setAiModel(aiConfig.model)
    setAiTone(aiConfig.tone)
    setAiCustomPrompt(aiConfig.customPrompt || '')
  }, [orgName, whatsappConfig, aiConfig])

  // Inbound WhatsApp Simulator State
  const [simulatedChat, setSimulatedChat] = useState('Piket lab besok jam 8 pagi PJ Andi')
  const [simulationResult, setSimulationResult] = useState<string | null>(null)

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault()

    setOrgName(localOrgName)
    updateWhatsAppConfig({
      apiKey: waApiKey,
      phoneNumberId: waPhoneNumberId,
      targetType,
      targetDestination,
      targetName,
      autoH1,
      autoH1Hour
    })
    updateAIConfig({
      apiKey: aiApiKey,
      model: aiModel,
      tone: aiTone,
      customPrompt: aiCustomPrompt
    })

    toast.success('Pengaturan Disimpan', `Target broadcast tersimpan ke: ${targetDestination}`)
  }

  const handleTestWhatsApp = async () => {
    setIsTestingWa(true)
    const normalized = normalizeWhatsAppNumber(targetDestination)
    const testMsg = `🧪 *TES KONEKSI PIKETAI*\n━━━━━━━━━━━━━━━━━━━━\nHalo! Ini adalah pesan uji coba dari sistem PiketAI ke nomor Anda (${normalized}).\n\nWaktu: ${new Date().toLocaleTimeString('id-ID')} WIB\nStatus: Terhubung!`

    const res = await sendWhatsAppViaGateway(
      { ...whatsappConfig, apiKey: waApiKey, targetDestination },
      targetDestination,
      testMsg
    )

    setIsTestingWa(false)
    if (res.success) {
      toast.success('Pesan Terkirim!', res.message)
    } else {
      toast.error('Gagal Mengirim', res.message)
    }
  }

  const handleSimulateInboundChat = () => {
    if (!simulatedChat.trim()) return
    const { replyMessage } = processInboundWhatsAppMessage(simulatedChat)
    setSimulationResult(replyMessage)
    toast.success('Chat WA Masuk Terproses!', 'Jadwal otomatis tersimpan ke dashboard & kalender.')
  }

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pengaturan Sistem</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Atur nomor WhatsApp target penerima pengingat (Personal / Grup) dan API Gateway.
          </p>
        </div>

        <Button type="submit" size="sm" className="text-xs self-start sm:self-auto">
          Simpan Semua Pengaturan
        </Button>
      </div>

      {/* Target WhatsApp Recipient Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base">Target Penerima WhatsApp (Nomor Pribadi / Grup)</CardTitle>
            </div>
            <Badge variant="success">Nomor Aktif</Badge>
          </div>
          <CardDescription>
            Pilih apakah pesan otomatis akan dikirim ke nomor WhatsApp pribadi Anda atau ke grup tim.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Target Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Tipe Penerima Pengingat
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('personal')
                  if (!targetDestination || targetDestination.includes('@')) {
                    setTargetDestination('085040466426')
                    setTargetName('Nomor WhatsApp Saya (085040466426)')
                  }
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                  targetType === 'personal'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Nomor HP Pribadi (Direct WA)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetType('group')
                  setTargetName('Grup Pengurus Harian')
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                  targetType === 'group'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Grup WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Number / Group Destination Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={targetType === 'personal' ? 'Nomor WhatsApp Target (Penerima) *' : 'Group ID (JID) *'}
              placeholder={targetType === 'personal' ? '085040466426 atau 6285040466426' : '120363045678901234@g.us'}
              value={targetDestination}
              onChange={(e) => setTargetDestination(e.target.value)}
              helper={targetType === 'personal' ? 'Bisa pakai format 08xxx atau 628xxx (otomatis dinormalisasi)' : 'ID JID grup WhatsApp'}
              required
            />

            <Input
              label="Label Nama Tujuan"
              placeholder="Contoh: WhatsApp Utama Saya"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
            />
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestWhatsApp}
                isLoading={isTestingWa}
                className="text-xs"
              >
                <Send className="w-3.5 h-3.5" /> Kirim Otomatis via Gateway ke {targetDestination || 'Nomor'}
              </Button>

              <a
                href={getWhatsAppDirectUrl(
                  targetDestination,
                  `🧪 *TES KONEKSI PIKETAI*\n━━━━━━━━━━━━━━━━━━━━\nHalo! Pesan uji coba berhasil dibuka dari web PiketAI ke nomor Anda (${normalizeWhatsAppNumber(targetDestination)}).\n\nWaktu: ${new Date().toLocaleTimeString('id-ID')} WIB`
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Tes Buka di WhatsApp Web
              </a>
            </div>

            <span className="text-[11px] text-zinc-400">
              Format: <strong>{normalizeWhatsAppNumber(targetDestination)}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Simulator 2-Way WhatsApp: Chat WA -> Masuk Jadwal */}
      <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base">Simulasi Chat WA Otomatis Jadi Jadwal</CardTitle>
            </div>
            <Badge variant="success">Auto NLP</Badge>
          </div>
          <CardDescription>
            Ketik pesan chat apa saja. AI otomatis mengekstrak dan menyimpannya sebagai jadwal pengingat ke nomor Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={simulatedChat}
              onChange={(e) => setSimulatedChat(e.target.value)}
              placeholder="Contoh: Piket lab besok jam 8 pagi PJ Andi"
              className="flex-1 w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              type="button"
              onClick={handleSimulateInboundChat}
              size="sm"
              className="w-full sm:w-auto text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Kirim Chat WA
            </Button>
          </div>

          {simulationResult && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs text-zinc-800 dark:text-zinc-200 animate-in fade-in">
              <div className="flex items-center justify-between text-emerald-600 font-bold border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Balasan Otomatis Bot WhatsApp:
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">Tersimpan ke Database</span>
              </div>
              <div className="whitespace-pre-line pt-1 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] leading-relaxed">
                {simulationResult}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gateway API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <CardTitle className="text-base">WhatsApp Gateway API (Fonnte / Wablas)</CardTitle>
            </div>
            <Badge variant="outline">Gateway Token</Badge>
          </div>
          <CardDescription>Masukkan Token Fonnte untuk mengirim chat WhatsApp sungguhan ke nomor HP tujuan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1 text-amber-800 dark:text-amber-200">
            <p className="font-semibold">⚠️ Cara Agar Pesan Masuk ke WhatsApp Asli:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-700 dark:text-amber-300">
              <li>Daftar gratis di <strong>fonnte.com</strong> dan scan QR WhatsApp Anda.</li>
              <li>Salin token akun dari Fonnte.</li>
              <li>Tempelkan token ke input di bawah ini lalu klik <strong>Simpan Semua Pengaturan</strong>.</li>
            </ol>
          </div>

          <Input
            label="WhatsApp API Key / Token (Fonnte)"
            type="password"
            placeholder="Contoh token: a1b2c3d4e5f6..."
            value={waApiKey}
            onChange={(e) => setWaApiKey(e.target.value)}
            helper="Jika token diisi token Fonnte asli, pesan akan langsung terkirim ke WhatsApp nomor HP nyata."
            leftIcon={<Key className="w-4 h-4" />}
          />

          {/* Automations */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Pemicu Pengingat Otomatis (Triggers):
            </span>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Kirim pengingat otomatis <strong>H-1 (Malam sebelum hari kegiatan)</strong>
              </span>
              <input
                type="checkbox"
                checked={autoH1}
                onChange={(e) => setAutoH1(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Kirim pengingat otomatis <strong>1 Jam Sebelum Jam Kegiatan</strong>
              </span>
              <input
                type="checkbox"
                checked={autoH1Hour}
                onChange={(e) => setAutoH1Hour(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-base">Profil Organisasi</CardTitle>
          </div>
          <CardDescription>Nama instansi/organisasi yang dicantumkan pada footer pesan WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            label="Nama Organisasi / Komunitas / Tim"
            placeholder="Contoh: BEM Fasilkom 2026"
            value={localOrgName}
            onChange={(e) => setLocalOrgName(e.target.value)}
          />
        </CardContent>
      </Card>
    </form>
  )
}
