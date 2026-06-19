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
