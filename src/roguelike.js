export const MAX_FLOOR = 100;

export const FLOOR_THEMES = [
  { name: 'Coroa da Lâmina', ground: 0x26373a, tile: 0x30474a, accent: 0x76b8a2, glow: 0xe7a857, boss: 'Cavaleiro da Fenda' },
  { name: 'Coroa da Magia', ground: 0x282640, tile: 0x373453, accent: 0xb18df2, glow: 0x72d9e5, boss: 'Bruxa Coral' },
  { name: 'Coroa da Estratégia', ground: 0x38303a, tile: 0x4c3a42, accent: 0xd89073, glow: 0xe2c37b, boss: 'Arquiteto Tático' },
  { name: 'Coroa da Força', ground: 0x39302c, tile: 0x50403a, accent: 0xe28052, glow: 0xffc364, boss: 'Colosso do Basalto' },
  { name: 'Coroa do Relâmpago', ground: 0x202c3f, tile: 0x2d3e56, accent: 0x68bbff, glow: 0xa59cff, boss: 'Serpe do Trovão Negro' },
  { name: 'Coroa dos Elementos', ground: 0x263a32, tile: 0x355346, accent: 0x8dd374, glow: 0x65d3cb, boss: 'Quimera Elemental' },
  { name: 'Coroa do Conhecimento', ground: 0x37343d, tile: 0x4c4655, accent: 0xe7cd84, glow: 0xc29dff, boss: 'Oráculo de Cinzas' },
  { name: 'Submundo: Portões', ground: 0x281e31, tile: 0x39263f, accent: 0xb45bdd, glow: 0xf25d6b, boss: 'Carrasco do Umbral' },
  { name: 'Submundo: Abismo', ground: 0x211c2c, tile: 0x33243b, accent: 0xd25f8f, glow: 0xa579ff, boss: 'Arauto do Eclipse' },
  { name: 'Submundo: Trono Sombrio', ground: 0x21191f, tile: 0x362129, accent: 0xea6674, glow: 0xb54bdf, boss: 'Monarca Sombrio' }
];

export function getFloorConfig(floor) {
  const currentFloor = Number.isFinite(floor) ? Math.floor(floor) : 1;
  if (currentFloor < 1 || currentFloor > MAX_FLOOR) {
    throw new RangeError(`Andar deve estar entre 1 e ${MAX_FLOOR}.`);
  }
  const zoneIndex = Math.floor((currentFloor - 1) / 10);
  const bossFloor = currentFloor % 10 === 0;
  const theme = FLOOR_THEMES[zoneIndex];
  return {
    floor: currentFloor,
    zoneIndex,
    region: theme.name,
    theme,
    bossFloor,
    bossName: bossFloor ? theme.boss : null,
    recommendedLevel: Math.max(1, Math.ceil(currentFloor * 1.35))
  };
}

export function getEnemyStats(floor, elite = false) {
  const safeFloor = Math.max(1, Math.floor(floor));
  const scale = 1 + (safeFloor - 1) * 0.095;
  return {
    health: Math.round((elite ? 76 : 38) * scale),
    damage: Math.round((elite ? 13 : 7) * (1 + (safeFloor - 1) * 0.035)),
    speed: Math.min(elite ? 88 : 74, (elite ? 52 : 42) + safeFloor * 0.25),
    xp: Math.round((elite ? 34 : 18) * scale)
  };
}

export function getBossStats(floor) {
  const config = getFloorConfig(floor);
  if (!config.bossFloor) {
    throw new RangeError('Este andar não é um andar de chefe.');
  }
  return {
    health: 250 + floor * 34,
    damage: 12 + Math.floor(floor * 0.55),
    speed: Math.min(74, 44 + floor * 0.22),
    xp: 180 + floor * 20
  };
}

export function getFloorEnemyCount(floor) {
  const config = getFloorConfig(floor);
  if (config.bossFloor) return 1;
  return Math.min(8, 3 + Math.floor((floor - 1) / 14));
}
