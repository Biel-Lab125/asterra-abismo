export const CHARACTER_OPTIONS = [
  {
    id: 'male',
    name: 'Herói de Lâmina',
    title: 'Guardião de Asterra',
    color: 0xf76845,
    accent: '#f76845',
    description: 'Determinado, silencioso e preciso nas ações decisivas.'
  },
  {
    id: 'female',
    name: 'Heróina de Esperança',
    title: 'Guardiã de Asterra',
    color: 0xf3c971,
    accent: '#f3c971',
    description: 'Corajosa, compassiva e hábil no combate de precisão.'
  }
];

export const COMPANION_OPTIONS = [
  {
    id: 'fenhir',
    name: 'Fenhir',
    type: 'Lobo ancestral',
    color: 0xa86bff,
    accent: '#a86bff',
    description: 'Guerreiro feroz, rápido e fiel em combate.'
  },
  {
    id: 'falcon',
    name: 'Falcão Antigo',
    type: 'Águia de asas negras',
    color: 0x75d0ff,
    accent: '#75d0ff',
    description: 'Observa o campo e ataca por ângulos inesperados.'
  },
  {
    id: 'tiger',
    name: 'Tigresa Lendária',
    type: 'Predadora da sombra',
    color: 0xff8a3d,
    accent: '#ff8a3d',
    description: 'Concentra potência, resistência e ferocidade.'
  }
];

export const WEAPON_OPTIONS = [
  {
    id: 'sword',
    name: 'Espada',
    label: 'Aço Solar',
    damage: 18,
    range: 48,
    speed: 450,
    description: 'Ataque equilibrado com alcance curto e alta eficiência.'
  },
  {
    id: 'bow',
    name: 'Arco',
    label: 'Raimo do Vento',
    damage: 14,
    range: 180,
    speed: 600,
    description: 'Combate à distância com disparo rápido e dano preciso.'
  },
  {
    id: 'spear',
    name: 'Lança',
    label: 'Lança do Faro',
    damage: 20,
    range: 72,
    speed: 520,
    description: 'Média distância com alcance e controle de linha.'
  }
];

export function createInitialState() {
  return {
    version: 1,
    started: false,
    character: 'male',
    companion: 'fenhir',
    weapon: 'sword',
    playerName: 'Aster',
    safePoint: 'Refúgio de Lâmina',
    region: 'Coroa da Lâmina',
    level: 1,
    xp: 0,
    nextLevel: 100,
    floor: 1,
    bestFloor: 1,
    defeatedBosses: [],
    runEnded: false,
    maxHealth: 100,
    health: 100,
    energy: 100,
    attack: 18,
    defense: 5,
    herbCount: 0,
    slimeKills: 0,
    bossReady: false,
    questStage: 'awakening',
    questText: 'Acorde na segurança do refúgio e siga a voz de Bokuto.',
    inventory: [
      { id: 'potion', name: 'Poção de cura', amount: 2 },
      { id: 'herb', name: 'Erva do refúgio', amount: 0 },
      { id: 'relic', name: 'Relíquia quebrada', amount: 1 }
    ],
    quickSlots: [
      { id: 'potion', amount: 2 },
      { id: 'herb', amount: 0 },
      { id: 'relic', amount: 1 }
    ],
    gold: 35,
    story: [
      'Asterra foi salva antes, mas as sombras já se movem novamente.',
      'Você precisa cruzar as regiões e encontrar os fragmentos da esperança.'
    ],
    settings: {
      music: 0.7,
      sound: 0.75,
      muted: false
    }
  };
}
