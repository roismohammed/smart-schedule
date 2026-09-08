import { Schedule, User, WhatsAppConfig } from '@/types'

export interface SendWhatsAppResult {
  success: boolean
  message: string
  timestamp: string
  directUrl?: string
}

// Convert 08xxx / 8xxx / +62xxx to 628xxx standard
export const normalizeWhatsAppNumber = (phoneOrGroup: string): string => {
  if (!phoneOrGroup) return ''
  const trimmed = phoneOrGroup.trim()
  if (trimmed.includes('@')) return trimmed

  const cleanDigits = trimmed.replace(/\D/g, '')
  if (cleanDigits.startsWith('0')) {
    return '62' + cleanDigits.slice(1)
  }
  if (cleanDigits.startsWith('8')) {
    return '62' + cleanDigits
  }
  return cleanDigits
}

export const getWhatsAppDirectUrl = (phone: string, text: string): string => {
  const normalized = normalizeWhatsAppNumber(phone)
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`
}

export const formatWhatsAppMessage = (
  schedule: Schedule,
  users: User[],
  orgName: string,
  type: 'h-1' | '1-hour' | 'exact' = 'exact'
) => {
  const pjNames = users
    .filter((u) => schedule.pj_ids.includes(u.id))
    .map((u) => u.name)
    .join(', ')

  const prefix =
    type === 'h-1'
      ? '🔔 *PENGINGAT H-1 PIKET*'
      : type === '1-hour'
      ? '⚡ *PENGINGAT 1 JAM SEBELUM KEGIATAN*'
      : '📢 *PENGINGAT JADWAL PIKET*'

  return `${prefix}
━━━━━━━━━━━━━━━━━━━━
📌 *Kegiatan:* ${schedule.title}
📅 *Tanggal:* ${schedule.activity_date}
⏰ *Pukul:* ${schedule.activity_time} WIB
📍 *Lokasi:* ${schedule.location || '-'}
👥 *Petugas PJ:* ${pjNames || 'Semua'}

📝 *Tugas:*
${schedule.description || 'Harap hadir tepat waktu.'}

_${orgName}_`
}

export const sendWhatsAppViaGateway = async (
  config: WhatsAppConfig,
  targetDestination: string,
  message: string
): Promise<SendWhatsAppResult> => {
  const nowStr = new Date().toLocaleTimeString('id-ID')
  const formattedTarget = normalizeWhatsAppNumber(targetDestination || config.targetDestination)
  const token = (config.apiKey || '').trim()
  const directUrl = getWhatsAppDirectUrl(formattedTarget, message)

  // Validate Token existence
  if (!token || token.startsWith('pk_live') || token.length < 6) {
    return {
      success: false,
      message: 'Token Fonnte belum diisi. Masukkan token dari fonnte.com di menu Pengaturan, atau gunakan tombol Buka WhatsApp Web.',
      timestamp: nowStr,
      directUrl
    }
  }

  // 1. Fonnte Gateway Dispatch via Local Vite Proxy
  try {
    const response = await fetch('/api/fonnte/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        token,
        target: formattedTarget,
        message
      })
    })

    const data = await response.json()
    if (data.status === true || data.status === 'true') {
      return {
        success: true,
        message: `Berhasil terkirim via Fonnte ke ${formattedTarget}`,
        timestamp: nowStr,
        directUrl
      }
    } else {
      const reason = data.reason || data.message || data.detail || 'Ditolak Fonnte (Pastikan Device WhatsApp terhubung/scan QR)'
      return {
        success: false,
        message: `Fonnte: ${reason}`,
        timestamp: nowStr,
        directUrl
      }
    }
  } catch (proxyErr: any) {
    // 2. Direct fetch fallback
    try {
      const formData = new URLSearchParams()
      formData.append('target', formattedTarget)
      formData.append('message', message)
      formData.append('countryCode', '62')

      const directRes = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
      const directData = await directRes.json()
      if (directData.status === true || directData.status === 'true') {
        return {
          success: true,
          message: `Berhasil terkirim ke ${formattedTarget}`,
          timestamp: nowStr,
          directUrl
        }
      } else {
        return {
          success: false,
          message: directData.reason || directData.message || 'Gagal mengirim dari Fonnte',
          timestamp: nowStr,
          directUrl
        }
      }
    } catch (directErr: any) {
      return {
        success: false,
        message: `Koneksi Gateway Gagal (${directErr.message || 'CORS'}). Pastikan server Vite di-restart.`,
        timestamp: nowStr,
        directUrl
      }
    }
  }
}
