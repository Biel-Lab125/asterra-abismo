import { createInitialState } from './gameData.js';

const STORAGE_KEY = 'asterra-save-v1';

function normalizeState(raw = {}) {
  const base = createInitialState();
  return {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    inventory: Array.isArray(raw.inventory) ? raw.inventory : base.inventory,
    quickSlots: Array.isArray(raw.quickSlots) ? raw.quickSlots : base.quickSlots,
    story: Array.isArray(raw.story) ? raw.story : base.story,
    version: 1
  };
}

export function saveGame(state) {
  const payload = normalizeState(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function loadGame() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const valid = normalizeState(parsed);
    return valid;
  } catch (error) {
    console.warn('Save inválido, resetando estado.', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(STORAGE_KEY);
}
