import { useState } from 'react'
import { motion as Motion } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://safeweb-phishing-api.onrender.com'

export default function PhishingDetection() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)

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
      const data = await res.json()
      if (data.error) setErr(data.error)
      setResult(data)
    } catch (e) {
      setErr(e?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const verdictColor =
    result?.final_verdict === 'Phishing'
      ? 'text-red-600'
      : result?.final_verdict === 'Likely Phishing'
        ? 'text-amber-600'
        : 'text-green-600'

  const verdictBgColor =
    result?.final_verdict === 'Phishing'
      ? 'bg-red-50 border-red-200'
      : result?.final_verdict === 'Likely Phishing'
        ? 'bg-amber-50 border-amber-200'
        : 'bg-green-50 border-green-200'

  const verdictIconColor =
    result?.final_verdict === 'Phishing'
      ? 'text-red-600'
      : result?.final_verdict === 'Likely Phishing'
        ? 'text-amber-600'
        : 'text-green-600'

  function prettyKey(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  function renderEnrichment(enrichment) {
    if (!enrichment) return null

    const rows = []

    if (enrichment.domain) {
      rows.push({ label: 'Domain', value: enrichment.domain, icon: '🌐' })
    }

    const sslDays = enrichment.ssl_days ?? null
    if (typeof sslDays === 'number') {
      rows.push({ label: 'SSL Days Remaining', value: String(sslDays), icon: '🔒' })
    } else if (enrichment.ssl_valid_to && enrichment.ssl_valid_from) {
      rows.push({ label: 'SSL Valid From', value: enrichment.ssl_valid_from, icon: '🔒' })
      rows.push({ label: 'SSL Valid To', value: enrichment.ssl_valid_to, icon: '🔒' })
    }

    const extCount =
      enrichment.external_links ??
      enrichment.external_links_count ??
      null
    if (typeof extCount === 'number') {
      rows.push({ label: 'External Links', value: String(extCount), icon: '🔗' })
    } else if (
      Array.isArray(enrichment.top_external_domains) &&
      enrichment.top_external_domains.length > 0
    ) {
      rows.push({
        label: 'Top External Domains',
        value: enrichment.top_external_domains.join(', '),
        icon: '🔗'
      })
    }

    for (const [k, v] of Object.entries(enrichment)) {
      if (
        [
          'domain',
          'ssl_days',
          'ssl_valid_to',
          'ssl_valid_from',
          'external_links',
          'external_links_count',
          'top_external_domains'
        ].includes(k)
      )
        continue
      if (v == null) continue
      if (
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean'
      ) {
        rows.push({ label: prettyKey(k), value: String(v), icon: '📊' })
      }
    }

    if (rows.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Signals & Enrichment Data
        </h3>
        <div className="grid gap-3">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{r.icon}</span>
                <div className="text-sm text-gray-700 font-medium">{r.label}</div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {r.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-6 sm:py-8">
      <div className="mx-auto max-w-4xl px-3 sm:px-4">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg sm:h-16 sm:w-16">
              <svg className="h-7 w-7 text-white sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Phishing URL Detection
            </h1>
          </div>
          <p className="text-base text-gray-600 sm:text-lg">
            Protect yourself from malicious websites. Enter a URL to check if it's safe.
          </p>
        </Motion.div>

        {/* Main Card */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-8"
        >
          {/* Input Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Enter URL to Scan
              </div>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <input
                  type="url"
                  className="w-full rounded-xl border-2 border-gray-300 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && url && onCheck()}
                />
              </div>
              <button
                onClick={onCheck}
                disabled={loading || !url}
                className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:px-8"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Scan URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Progress Bar */}
          {loading && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <Motion.div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">Analyzing URL for security threats...</p>
            </Motion.div>
          )}

          {/* Error Message */}
          {err && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{err}</span>
              </div>
            </Motion.div>
          )}

          {/* Results */}
          {result && !err && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8"
            >
              <div className={`rounded-xl p-6 border-2 ${verdictBgColor} transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 mb-2">Final Verdict</div>
                    <div className={`text-4xl font-bold ${verdictColor} flex items-center gap-3`}>
                      {result.final_verdict === 'Phishing' && (
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {result.final_verdict === 'Likely Phishing' && (
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {result.final_verdict !== 'Phishing' && result.final_verdict !== 'Likely Phishing' && (
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {result.final_verdict || '—'}
                    </div>
                    {result.confidence && (
                      <div className="mt-2 text-sm text-gray-600">
                        Confidence: <span className="font-semibold">{result.confidence}%</span>
                      </div>
                    )}
                  </div>

                  <Motion.div
                    className={`w-16 h-16 rounded-full ${verdictBgColor} flex items-center justify-center border-2 ${verdictIconColor.replace('text-', 'border-')}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {result.final_verdict === 'Phishing' && (
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {result.final_verdict === 'Likely Phishing' && (
                      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {result.final_verdict !== 'Phishing' && result.final_verdict !== 'Likely Phishing' && (
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </Motion.div>
                </div>

                {renderEnrichment(result.enrichment)}
              </div>
            </Motion.div>
          )}

          {/* Tips Section */}
          {!result && !loading && (
            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips to Stay Safe
              </h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Always check the URL carefully before entering credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Look for HTTPS and a valid SSL certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Be cautious of URLs with misspellings or unusual domains</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Never click on suspicious links in emails or messages</span>
                </li>
              </ul>
            </div>
          )}
        </Motion.div>
      </div>
    </div>
  )
}
