import {
  getAllEntries, deleteEntry,
  getDeletedEntries, restoreEntry, permanentlyDeleteEntry, emptyRecycleBin
} from '../utils/storage.js';

let allEntries = [];

// ── Preview Modal ──────────────────────────────────────

let previewEntry = null;

function openPreview(entry) {
  previewEntry = entry;
  document.getElementById('preview-img').src = entry.screenshot || '';
  document.getElementById('preview-title-text').textContent = entry.title || 'Untitled';
  document.getElementById('preview-url-text').textContent = entry.url || '';
  document.getElementById('preview-ts').textContent = new Date(entry.timestamp).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('preview-note-text').textContent = entry.note || '';

  const tagsWrap = document.getElementById('preview-tags-wrap');
  tagsWrap.innerHTML = '';
  (entry.tags || []).forEach(tag => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.textContent = tag;
    tagsWrap.appendChild(pill);
  });

  document.getElementById('preview-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  document.getElementById('preview-modal').classList.add('hidden');
  document.body.style.overflow = '';
  previewEntry = null;
}

document.getElementById('preview-close').addEventListener('click', closePreview);
document.getElementById('preview-backdrop').addEventListener('click', closePreview);

document.getElementById('preview-visit').addEventListener('click', () => {
  if (previewEntry) chrome.tabs.create({ url: previewEntry.url });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePreview();
});

// ── Init ──────────────────────────────────────────────

async function init() {
  allEntries = await getAllEntries();
  renderEntries(allEntries);
  refreshRecycleBadge();
  document.getElementById('search-input').addEventListener('input', handleSearch);
}

// ── Render ────────────────────────────────────────────

function renderEntries(entries) {
  const grid = document.getElementById('entries-grid');
  const template = document.getElementById('entry-card-template');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('entry-count');

  grid.innerHTML = '';
  countEl.textContent = `${entries.length} SAVED`;

  if (entries.length === 0) {
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  entries.forEach(entry => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.nx-card');

    const img = clone.querySelector('.card-screenshot');
    img.src = entry.screenshot || '';

    clone.querySelector('.card-title').textContent = entry.title || 'Untitled';
    clone.querySelector('.card-url').textContent = entry.url || '';
    clone.querySelector('.card-note').textContent = entry.note || '';

    clone.querySelector('.card-ts').textContent =
      new Date(entry.timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

    const tagsContainer = clone.querySelector('.card-tags');
    (entry.tags || []).forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.textContent = tag;
      tagsContainer.appendChild(pill);
    });

    // Preview on thumb click
    clone.querySelector('.card-thumb').addEventListener('click', () => {
      openPreview(entry);
    });

    // Visit
    clone.querySelector('.btn-visit').addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.tabs.create({ url: entry.url });
    });

    // Delete (soft delete → moves to recycle bin)
    clone.querySelector('.btn-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteEntry(entry.id);
      allEntries = allEntries.filter(e => e.id !== entry.id);
      card.remove();
      document.getElementById('entry-count').textContent = `${allEntries.length} SAVED`;
      refreshRecycleBadge();
      if (allEntries.length === 0) {
        document.getElementById('empty-state').classList.add('visible');
      }
    });

    grid.appendChild(clone);
  });
}

// ── Search ────────────────────────────────────────────

function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const filtered = allEntries.filter(entry => {
    const searchable = [
      entry.title, entry.url, entry.note,
      ...(entry.tags || [])
    ].join(' ').toLowerCase();
    return searchable.includes(query);
  });
  renderEntries(filtered);
}

// ── Recycle Bin ─────────────────────────────────────────

async function refreshRecycleBadge() {
  const deleted = await getDeletedEntries();
  document.getElementById('recycle-count').textContent = deleted.length;
}

async function openRecycleBin() {
  const deleted = await getDeletedEntries();
  renderRecycleList(deleted);
  document.getElementById('recycle-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRecycleBin() {
  document.getElementById('recycle-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderRecycleList(deleted) {
  const list = document.getElementById('recycle-list');
  const empty = document.getElementById('recycle-empty-state');
  const template = document.getElementById('recycle-item-template');

  list.innerHTML = '';

  if (deleted.length === 0) {
    empty.classList.add('visible');
    list.style.display = 'none';
    return;
  }
  empty.classList.remove('visible');
  list.style.display = '';

  deleted.forEach(entry => {
    const clone = template.content.cloneNode(true);
    const item = clone.querySelector('.recycle-item');

    clone.querySelector('.recycle-thumb').src = entry.screenshot || '';
    clone.querySelector('.recycle-item-title').textContent = entry.title || 'Untitled';
    clone.querySelector('.recycle-item-deleted-ts').textContent =
      'Deleted ' + new Date(entry.deletedAt).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      });

    clone.querySelector('.btn-restore').addEventListener('click', async () => {
      await restoreEntry(entry.id);
      item.remove();
      allEntries = await getAllEntries();
      renderEntries(allEntries);
      refreshRecycleBadge();
    });

    clone.querySelector('.btn-purge').addEventListener('click', async () => {
      await permanentlyDeleteEntry(entry.id);
      item.remove();
      refreshRecycleBadge();
    });

    list.appendChild(clone);
  });
}

document.getElementById('recycle-btn').addEventListener('click', openRecycleBin);
document.getElementById('recycle-close').addEventListener('click', closeRecycleBin);
document.getElementById('recycle-backdrop').addEventListener('click', closeRecycleBin);

document.getElementById('empty-recycle-btn').addEventListener('click', async () => {
  await emptyRecycleBin();
  document.getElementById('recycle-list').innerHTML = '';
  document.getElementById('recycle-empty-state').classList.add('visible');
  refreshRecycleBadge();
});

init();
