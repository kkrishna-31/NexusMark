// ── Folder Handle Storage (IndexedDB) ───────────────────
// chrome.storage cannot hold a FileSystemDirectoryHandle,
// so we persist it in IndexedDB instead.

const DB_NAME = "nexusmark_fs";
const STORE = "handles";
const KEY = "save_folder";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Open native folder picker, persist the handle ──────

export async function pickFolder() {
  const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(handle, KEY);
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
  return handle;
}

// ── Retrieve the previously picked handle ──────────────

export async function getStoredFolder() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// ── Clear stored handle (reset) ─────────────────────────

export async function clearStoredFolder() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(KEY);
}

// ── Confirm/request write permission before saving ─────
// Browsers can revoke or expire permission between sessions,
// so call this before every actual file write.

export async function ensurePermission(handle) {
  const opts = { mode: "readwrite" };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  return (await handle.requestPermission(opts)) === "granted";
}

// ── Convert a base64 data URL screenshot into a Blob ───

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);base64/)[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

// ── Build a safe, collision-resistant filename ──────────

function buildFilename(title, timestamp) {
  const safeTitle = (title || 'screenshot')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  const stamp = new Date(timestamp)
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);

  return `${safeTitle || 'screenshot'}_${stamp}.png`;
}

// ── Write a screenshot into the picked folder ───────────
// Best-effort: returns a result object instead of throwing,
// so a failed disk write never blocks the library save.

export async function writeScreenshotFile(dataUrl, title, timestamp) {
  const handle = await getStoredFolder();
  if (!handle) {
    return { success: false, reason: 'no-folder-set' };
  }

  const granted = await ensurePermission(handle);
  if (!granted) {
    return { success: false, reason: 'permission-denied' };
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const filename = buildFilename(title, timestamp);

    const fileHandle = await handle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();

    return { success: true, filename };
  } catch (err) {
    console.error('NexusMark: failed to write screenshot to disk', err);
    return { success: false, reason: 'write-error', error: err.message };
  }
}