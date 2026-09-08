import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, target, message } = req.body || {}
    const authHeader = req.headers['authorization'] || token || ''

    if (!target || !message) {
      return res.status(400).json({ status: false, reason: 'Target and message are required' })
    }

    const formData = new URLSearchParams()
    formData.append('target', target)
    formData.append('message', message)
    formData.append('countryCode', '62')

    const fonnteRes = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })

    const data = await fonnteRes.json()
    return res.status(fonnteRes.status).json(data)
  } catch (err: any) {
    return res.status(500).json({ status: false, reason: err.message || 'Internal Server Error' })
  }
}
