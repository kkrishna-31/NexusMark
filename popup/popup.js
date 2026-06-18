import { getAllEntries } from '../utils/storage.js';
import { captureTab } from '../utils/capture.js';

// ── Hotkey display ─────────────────────────────────────

async function loadHotkey() {
  const commands = await chrome.commands.getAll();
  const capture = commands.find(c => c.name === 'capture');
  const shortcut = capture?.shortcut || 'Not set';
  document.getElementById('hotkey-display').textContent = shortcut || 'Not set';
}

// ── Library count ──────────────────────────────────────

async function loadLibraryCount() {
  const entries = await getAllEntries();
  const sub = document.getElementById('library-count-sub');
  sub.textContent = entries.length === 1 ? '1 entry saved' : `${entries.length} entries saved`;
}

// ── Folder preference ──────────────────────────────────

async function loadFolder() {
  const data = await chrome.storage.local.get('nexusmark_folder');
  const folder = data.nexusmark_folder || '';
  const sub = document.getElementById('folder-sub');
  sub.textContent = folder ? folder : 'default downloads';
  document.getElementById('folder-input').value = folder;
}

async function saveFolder(value) {
  await chrome.storage.local.set({ nexusmark_folder: value });
  const sub = document.getElementById('folder-sub');
  sub.textContent = value ? value : 'default downloads';
}

// ── Capture ────────────────────────────────────────────

document.getElementById('btn-capture').addEventListener('click', async () => {
  const btn = document.getElementById('btn-capture');
  btn.classList.add('loading');
  btn.querySelector('.tile-label').textContent = 'CAPTURING...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) throw new Error('No active tab');

    const captureData = await captureTab();
    await chrome.storage.session.set({ pendingCapture: captureData });

    chrome.windows.create({
      url: chrome.runtime.getURL('popup/capture.html'),
      type: 'popup',
      width: 400,
      height: 580
    });

    window.close();
  } catch (err) {
    btn.classList.remove('loading');
    btn.querySelector('.tile-label').textContent = 'CAPTURE NOW';
    console.error(err);
  }
});

// ── Hotkey ─────────────────────────────────────────────

document.getElementById('btn-hotkey').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  window.close();
});

document.getElementById('hotkey-badge').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  window.close();
});

// ── Folder overlay ─────────────────────────────────────

document.getElementById('btn-folder').addEventListener('click', () => {
  document.getElementById('folder-overlay').classList.remove('hidden');
});

document.getElementById('folder-close').addEventListener('click', () => {
  document.getElementById('folder-overlay').classList.add('hidden');
});

document.getElementById('folder-save').addEventListener('click', async () => {
  const val = document.getElementById('folder-input').value.trim()
    .replace(/^\/+|\/+$/g, ''); // strip leading/trailing slashes
  await saveFolder(val);
  document.getElementById('folder-overlay').classList.add('hidden');
  showStatus('FOLDER SAVED');
});

document.getElementById('folder-reset').addEventListener('click', async () => {
  document.getElementById('folder-input').value = '';
  await saveFolder('');
  document.getElementById('folder-overlay').classList.add('hidden');
  showStatus('RESET TO DEFAULT');
});

// ── Library ────────────────────────────────────────────

document.getElementById('btn-library').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('library/library.html') });
  window.close();
});

// ── Status helper ──────────────────────────────────────

function showStatus(msg) {
  const el = document.getElementById('status-text-home');
  el.textContent = msg;
  setTimeout(() => { el.textContent = 'READY'; }, 2000);
}

// ── Init ───────────────────────────────────────────────

async function init() {
  await Promise.all([loadHotkey(), loadLibraryCount(), loadFolder()]);
}

init();
