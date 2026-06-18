const STORAGE_KEY = "nexusmark_entries";

// ── Get All ───────────────────────────────────────────

export async function getAllEntries() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}

// ── Save ──────────────────────────────────────────────

export async function saveEntry(entry) {
  const entries = await getAllEntries();

  entry.id = crypto.randomUUID();

  // unshift = newest entry appears first in the library
  entries.unshift(entry);

  await chrome.storage.local.set({ [STORAGE_KEY]: entries });
}

// ── Delete ────────────────────────────────────────────

export async function deleteEntry(id) {
  const entries = await getAllEntries();
  const updated = entries.filter(e => e.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}
