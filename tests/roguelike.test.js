import { describe, expect, it } from 'vitest';
import {
  FLOOR_THEMES,
  MAX_FLOOR,
  getBossStats,
  getEnemyStats,
  getFloorConfig,
  getFloorEnemyCount
} from '../src/roguelike.js';

describe('100-floor roguelike progression', () => {
  it('covers all 100 floors and maps every decade to a boss encounter', () => {
    expect(MAX_FLOOR).toBe(100);
    expect(FLOOR_THEMES).toHaveLength(10);
    for (let floor = 1; floor <= MAX_FLOOR; floor += 1) {
      expect(getFloorConfig(floor).floor).toBe(floor);
      expect(getFloorConfig(floor).bossFloor).toBe(floor % 10 === 0);
    }
    expect(getFloorConfig(100).bossName).toBe('Monarca Sombrio');
  });

  it('increases ordinary encounters and boss durability with floor depth', () => {
    expect(getFloorEnemyCount(1)).toBe(3);
    expect(getFloorEnemyCount(99)).toBeGreaterThan(getFloorEnemyCount(1));
    expect(getEnemyStats(50).health).toBeGreaterThan(getEnemyStats(1).health);
    expect(getBossStats(100).health).toBeGreaterThan(getBossStats(10).health);
  });

  it('rejects invalid floors and boss stats on ordinary floors', () => {
    expect(() => getFloorConfig(0)).toThrow(RangeError);
    expect(() => getFloorConfig(101)).toThrow(RangeError);
    expect(() => getBossStats(9)).toThrow(RangeError);
  });
});
