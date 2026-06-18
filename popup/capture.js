import { saveEntry } from '../utils/storage.js';
import { captureTab } from '../utils/capture.js';

let captureData = null;

async function init() {
  const sessionData = await chrome.storage.session.get("pendingCapture");

  if (sessionData.pendingCapture) {
    captureData = sessionData.pendingCapture;
    await chrome.storage.session.remove("pendingCapture");
  } else {
    captureData = await captureTab();
  }

  document.getElementById('screenshot-preview').src = captureData.screenshot;
  document.getElementById('page-title').value = captureData.title || '';
  document.getElementById('page-url').textContent = captureData.url || '';
  document.getElementById('timestamp').textContent =
    new Date(captureData.timestamp).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
}

document.getElementById('save-btn').addEventListener('click', async () => {
  if (!captureData) return;

  const tags = document.getElementById('tags-input').value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  await saveEntry({
    url: captureData.url,
    title: document.getElementById('page-title').value || captureData.title,
    screenshot: captureData.screenshot,
    timestamp: captureData.timestamp,
    note: document.getElementById('note-input').value,
    tags
  });

  window.close();
});

document.getElementById('cancel-btn').addEventListener('click', () => {
  window.close();
});

document.getElementById('open-library-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('library/library.html') });
  window.close();
});

init();
