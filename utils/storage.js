const STORAGE_KEY = "nexusmark_entries";

// ── Get All (active only) ──────────────────────────────

export async function getAllEntries() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const entries = data[STORAGE_KEY] || [];
  return entries.filter(e => !e.deleted);
}

// ── Get Deleted (recycle bin) ──────────────────────────

export async function getDeletedEntries() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const entries = data[STORAGE_KEY] || [];
  return entries.filter(e => e.deleted);
}

// ── Save ──────────────────────────────────────────────

export async function saveEntry(entry) {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const entries = data[STORAGE_KEY] || [];

  entry.id = crypto.randomUUID();
  entries.unshift(entry);

  await chrome.storage.local.set({ [STORAGE_KEY]: entries });
}

// ── Soft Delete (moves to recycle bin) ─────────────────

export async function deleteEntry(id) {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const entries = data[STORAGE_KEY] || [];

  const updated = entries.map(e =>
    e.id === id ? { ...e, deleted: true, deletedAt: Date.now() } : e
  );

  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

// ── Restore from Recycle Bin ───────────────────────────

export async function restoreEntry(id) {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const entries = data[STORAGE_KEY] || [];

  const updated = entries.map(e => {
    if (e.id !== id) return e;
    const { deleted, deletedAt, ...rest } = e;
    return rest;
  });

  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

// ── Permanently Delete (from recycle bin) ──────────────

export async function permanentlyDeleteEntry(id) {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const entries = data[STORAGE_KEY] || [];
  const updated = entries.filter(e => e.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

// ── Empty Recycle Bin (purge all deleted) ──────────────

export async function emptyRecycleBin() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const entries = data[STORAGE_KEY] || [];
  const updated = entries.filter(e => !e.deleted);
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}
