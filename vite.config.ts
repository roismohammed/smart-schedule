import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig, type Plugin } from 'vite'

// Vite plugin for WhatsApp Inbound & Outbound Webhook proxy (Bypass CORS browser)
function whatsappWebhookPlugin(): Plugin {
  return {
    name: 'whatsapp-webhook-handler',
    configureServer(server) {
      // 1. Proxy Outbound Dispatch to Fonnte (Bypass CORS)
      server.middlewares.use('/api/fonnte/send', (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { token, target, message } = JSON.parse(body || '{}')
              const authHeader = (req.headers['authorization'] as string) || token || ''

              const formData = new URLSearchParams()
              formData.append('target', target)
              formData.append('message', message)
              formData.append('countryCode', '62')

              const fonnteRes = await fetch('https://api.fonnte.com/send', {
                method: 'POST',
                headers: {
                  Authorization: authHeader.trim(),
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
              })

              const data = await fonnteRes.json()
              res.setHeader('Content-Type', 'application/json')
              res.writeHead(fonnteRes.status || 200)
              res.end(JSON.stringify(data))
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json')
              res.writeHead(500)
              res.end(JSON.stringify({ status: false, reason: err.message }))
            }
          })
        } else {
          next()
        }
      })

      // 2. Inbound Webhook Handler
      server.middlewares.use('/api/webhook/whatsapp', (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}')
              const incomingMsg = data.message || data.text || ''
              const sender = data.from || data.sender || 'WhatsApp User'

              res.setHeader('Content-Type', 'application/json')
              res.writeHead(200)
              res.end(
                JSON.stringify({
                  success: true,
                  status: 'processed',
                  sender,
                  receivedText: incomingMsg,
                  timestamp: new Date().toISOString()
                })
              )
            } catch (err: any) {
              res.writeHead(400)
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
        } else if (req.url === '/api/webhook/whatsapp') {
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(200)
          res.end(
            JSON.stringify({
              status: 'active',
              message: 'PiketAI WhatsApp Inbound Webhook endpoint is running.'
            })
          )
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), whatsappWebhookPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname || __dirname, './src'),
    },
  },
})
