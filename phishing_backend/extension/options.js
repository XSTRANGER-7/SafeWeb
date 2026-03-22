function load() {
  chrome.storage.sync.get({ apiBase: 'http://localhost:8000' }, (res) => {
    document.getElementById('apiBase').value = res.apiBase
  })
}

function save() {
  const apiBase = document.getElementById('apiBase').value.trim()
  chrome.storage.sync.set({ apiBase }, () => {
    alert('Saved')
  })
}

document.getElementById('save').addEventListener('click', save)
document.addEventListener('DOMContentLoaded', load)


