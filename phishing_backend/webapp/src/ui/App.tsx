import { useState } from 'react'
import { motion } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

type ApiResult = {
  model_prediction?: string
  enrichment?: any
  ai_review?: string
  final_verdict?: string
  error?: string
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onCheck() {
    setErr(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data: ApiResult = await res.json()
      if ((data as any).error) setErr((data as any).error)
      setResult(data)
    } catch (e: any) {
      setErr(e?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const verdictColor = result?.final_verdict === 'Phishing'
    ? 'text-cyber-danger'
    : result?.final_verdict === 'Likely Phishing'
      ? 'text-yellow-400'
      : 'text-cyber-success'

  return (
    <div className="min-h-full p-6">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          className="text-4xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-cyber-neon">Phish</span>
          <span className="text-cyber-accent">Guard</span>
        </motion.h1>

        <motion.div
          className="mt-6 glass neon-border rounded-2xl p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex gap-3">
            <input
              className="flex-1 bg-transparent outline-none border border-white/10 rounded-xl px-4 py-3 focus:border-cyber-neon"
              placeholder="Paste a URL to scan..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <button
              onClick={onCheck}
              disabled={loading || !url}
              className="px-5 py-3 rounded-xl bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/40 hover:bg-cyber-neon/30 disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Scan'}
            </button>
          </div>

          <motion.div
            className="mt-6 h-1 bg-white/5 rounded overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 1 : 0 }}
          >
            <motion.div
              className="h-full bg-cyber-neon"
              initial={{ x: '-100%' }}
              animate={{ x: loading ? '0%' : '-100%' }}
              transition={{ duration: 1.2, repeat: loading ? Infinity : 0, ease: 'easeInOut' }}
            />
          </motion.div>

          {err && (
            <div className="mt-4 text-cyber-danger text-sm">{err}</div>
          )}

          {result && !err && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass rounded-2xl p-6 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/60">Final verdict</div>
                  <div className={`mt-1 text-3xl font-extrabold ${verdictColor}`}>{result.final_verdict ?? '—'}</div>
                </div>
                <motion.div
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center"
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1.05, opacity: 1 }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                >
                  <div className={`w-3 h-3 rounded-full ${result?.final_verdict === 'Phishing' ? 'bg-cyber-danger' : result?.final_verdict === 'Likely Phishing' ? 'bg-yellow-400' : 'bg-cyber-success'}`}></div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="mt-8 text-xs text-white/40">
          API: {API_BASE}
        </div>
      </div>
    </div>
  )
}


