import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState } from '../src/gameData.js';
import { saveGame, loadGame, clearSave } from '../src/saveSystem.js';

describe('Asterra save system', () => {
  beforeEach(() => {
    clearSave();
  });

  it('creates a valid initial state', () => {
    const state = createInitialState();
    expect(state.version).toBe(1);
    expect(state.character).toBe('male');
    expect(state.inventory.length).toBeGreaterThan(0);
  });

  it('saves and loads progress without corrupting data', () => {
    const state = createInitialState();
    state.character = 'female';
    state.companion = 'tiger';
    state.weapon = 'bow';
    saveGame(state);

    const loaded = loadGame();
    expect(loaded.character).toBe('female');
    expect(loaded.companion).toBe('tiger');
    expect(loaded.weapon).toBe('bow');
    expect(loaded.settings.music).toBeGreaterThan(0);
  });
});
