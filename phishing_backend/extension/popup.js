async function getApiBase() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ apiBase: 'http://localhost:8000' }, (res) => resolve(res.apiBase))
  })
}

async function scanUrl(value) {
  const status = document.getElementById('status')
  const verdict = document.getElementById('verdict')
  const pulse = document.getElementById('pulse')
  verdict.textContent = '—'
  pulse.style.background = '#9aa4b2'
  status.textContent = 'Scanning...'
  try {
    const apiBase = await getApiBase()
    const res = await fetch(`${apiBase}/api/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: value })
    })
    const data = await res.json()
    const v = data.final_verdict || '—'
    verdict.textContent = v
    let color = '#00ffa3'
    if (v === 'Phishing') color = '#ff3864'
    else if (v === 'Likely Phishing') color = '#fbbf24'
    pulse.style.background = color
    pulse.animate([
      { transform: 'scale(0.9)', opacity: 0.7 },
      { transform: 'scale(1.1)', opacity: 1 }
    ], { duration: 800, iterations: Infinity, direction: 'alternate' })
    status.textContent = ''
  } catch (e) {
    status.textContent = `Error: ${e.message || e}`
  }
}

document.getElementById('scan').addEventListener('click', () => {
  const v = document.getElementById('url').value.trim()
  if (v) scanUrl(v)
})

document.getElementById('use-tab').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.url) {
    document.getElementById('url').value = tab.url
    scanUrl(tab.url)
  }
})


