import './style.css';
import Phaser from 'phaser';
import {
  CHARACTER_OPTIONS,
  WEAPON_OPTIONS,
  createInitialState
} from './gameData.js';
import { loadGame, saveGame } from './saveSystem.js';
import { PlatformerScene } from './platformerScene.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="game-shell" aria-label="Asterra game canvas"></div>
  <div id="ui-shell">
    <section id="title-screen" class="screen visible">
      <div class="title-panel">
        <p class="eyebrow">Roguelike • 100 andares • Fantasia sombria</p>
        <h1>Asterra</h1>
        <h2>Abismo</h2>
        <p class="game-title-tagline">Uma descida roguelike por 100 andares</p>
        <div class="story-mini">
          Desça por cem andares corrompidos, vença dez guardiões e encare o Monarca Sombrio.
        </div>
        <div class="actions">
          <button id="new-game-btn" class="primary">Novo jogo</button>
          <button id="continue-btn" class="secondary">Continuar</button>
        </div>
      </div>
    </section>

    <section id="selection-screen" class="screen hidden">
      <div class="selection-panel">
        <div class="selection-header">
          <p class="eyebrow">Criação do protagonista</p>
          <h3>Escolha seu destino</h3>
        </div>
        <div id="character-selection" class="option-grid"></div>
        <div id="weapon-selection" class="option-grid"></div>
        <div class="actions combined">
          <button id="begin-adventure" class="primary">Começar aventura</button>
          <button id="back-to-title" class="secondary">Voltar</button>
        </div>
      </div>
    </section>

    <div id="hud" class="hud hidden">
      <div class="topbar">
        <div class="stat-group">
          <span class="label">HP</span>
          <strong id="hud-health">100/100</strong>
        </div>
        <div class="stat-group">
          <span class="label">Energia</span>
          <strong id="hud-energy">100</strong>
        </div>
        <div class="stat-group">
          <span class="label">Nível</span>
          <strong id="hud-level">1</strong>
        </div>
        <div class="stat-group">
          <span class="label">XP</span>
          <strong id="hud-xp">0/100</strong>
        </div>
        <div class="stat-group">
          <span class="label">Arma</span>
          <strong id="hud-weapon">Espada</strong>
        </div>
        <div class="stat-group floor-stat">
          <span class="label">Andar</span>
          <strong id="hud-floor">1 / 100</strong>
        </div>
      </div>
      <div class="floor-track"><span id="floor-progress"></span></div>
      <div class="side-info">
        <div id="quest-status">Andar 1 / 100</div>
        <div id="run-best">Recorde: andar 1</div>
      </div>
      <div class="run-controls" aria-label="Controles do jogo">
        <span><kbd>A</kbd><kbd>D</kbd> mover</span>
        <span><kbd>Space</kbd> saltar</span>
        <span><kbd>J</kbd> / clique atacar</span>
        <span><kbd>K</kbd> esquiva</span>
        <span><kbd>Shift</kbd> correr</span>
        <span><kbd>E</kbd> interagir</span>
        <span><kbd>1</kbd> poção</span>
        <span><kbd>I</kbd> inventário <kbd>Tab</kbd> diário</span>
      </div>
      <button id="descend-floor" class="descend-button hidden" disabled>Descer de andar <span>↓</span></button>
      <div class="touch-controls" aria-label="Controles táteis">
        <div class="touch-movement">
          <button type="button" data-touch-control="left" aria-label="Mover para a esquerda">◀</button>
          <button type="button" data-touch-control="right" aria-label="Mover para a direita">▶</button>
        </div>
        <div class="touch-actions">
          <button type="button" data-touch-control="dash" aria-label="Esquivar">Esquiva</button>
          <button type="button" data-touch-control="attack" aria-label="Atacar">Atacar</button>
          <button type="button" data-touch-control="jump" aria-label="Saltar">Saltar</button>
          <button type="button" data-touch-control="interact" aria-label="Interagir">Usar</button>
        </div>
      </div>
      <div id="message-log" class="message-log">Refúgio seguro. O mundo ainda aguarda.</div>
    </div>

    <div id="inventory-panel" class="panel hidden">
      <h4>Inventário</h4>
      <ul id="inventory-list"></ul>
    </div>

    <div id="journal-panel" class="panel hidden">
      <h4>Diário</h4>
      <p id="journal-goal">Objetivo: encontrar Bokuto e vencer o treinamento.</p>
      <ul>
        <li>Limpe cada andar para abrir o portal.</li>
        <li>A cada 10 andares, derrote o guardião.</li>
        <li>Alcance o Monarca Sombrio no andar 100.</li>
      </ul>
    </div>

    <section id="run-end-screen" class="screen hidden">
      <div class="title-panel run-end-panel">
        <p class="eyebrow">Jornada roguelike</p>
        <h3 id="run-end-title">A jornada termina…</h3>
        <p id="run-end-copy"></p>
        <button id="restart-run" class="primary">Nova jornada</button>
      </div>
    </section>
    <div class="rotate-notice" role="status">
      <span class="rotate-icon">↻</span>
      <strong>Gire o aparelho</strong>
      <span>Jogue Asterra: Abismo na horizontal</span>
    </div>
  </div>
`;

const state = loadGame() || createInitialState();
const selection = {
  character: state.character,
  weapon: state.weapon
};

const ui = {
  title: document.querySelector('#title-screen'),
  selection: document.querySelector('#selection-screen'),
  hud: document.querySelector('#hud'),
  inventory: document.querySelector('#inventory-panel'),
  journal: document.querySelector('#journal-panel'),
  message: document.querySelector('#message-log'),
  inventoryList: document.querySelector('#inventory-list'),
  journalGoal: document.querySelector('#journal-goal'),
  health: document.querySelector('#hud-health'),
  energy: document.querySelector('#hud-energy'),
  level: document.querySelector('#hud-level'),
  xp: document.querySelector('#hud-xp'),
  weapon: document.querySelector('#hud-weapon'),
  questStatus: document.querySelector('#quest-status'),
  floor: document.querySelector('#hud-floor'),
  floorProgress: document.querySelector('#floor-progress'),
  runBest: document.querySelector('#run-best'),
  descendButton: document.querySelector('#descend-floor')
};
window.asterraUI = ui;

function renderOptionGroup(containerId, options, chosen, type) {
  const container = document.querySelector(containerId);
  container.innerHTML = '';

  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `option-card ${chosen === option.id ? 'selected' : ''}`;
    button.dataset[type] = option.id;
    button.innerHTML = `
      <span class="badge" style="background:${option.accent || '#fb923c'}"></span>
      <strong>${option.name}</strong>
      <small>${option.type || option.title || option.label || option.description}</small>
      <em>${option.description}</em>
    `;
    button.addEventListener('click', () => {
      selection[type] = option.id;
      renderSelectionPanels();
    });
    container.appendChild(button);
  });
}

function renderSelectionPanels() {
  renderOptionGroup('#character-selection', CHARACTER_OPTIONS, selection.character, 'character');
  renderOptionGroup('#weapon-selection', WEAPON_OPTIONS, selection.weapon, 'weapon');
}

function applyCurrentSelection() {
  const merged = {
    ...createInitialState(),
    character: selection.character,
    weapon: selection.weapon,
    playerName: selection.character === 'male' ? 'Aster' : 'Astra',
    bestFloor: (loadGame()?.bestFloor) || state.bestFloor || 1,
    questStage: 'roguelike',
    questText: 'Limpe o primeiro andar e alcance o portal.'
  };
  saveGame(merged);
  return merged;
}

function startAdventure(profile = applyCurrentSelection()) {
  if (profile.runEnded) {
    ui.title.classList.remove('hidden');
    ui.selection.classList.add('hidden');
    ui.hud.classList.add('hidden');
    document.querySelector('#run-end-title').textContent = 'Jornada concluída';
    document.querySelector('#run-end-copy').textContent = `Seu recorde foi o andar ${profile.bestFloor || profile.floor}. Comece uma nova jornada para tentar novamente.`;
    document.querySelector('#run-end-screen').classList.remove('hidden');
    return;
  }
  document.querySelector('#run-end-screen').classList.add('hidden');
  ui.title.classList.add('hidden');
  ui.selection.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  document.querySelector('#game-shell').classList.add('playing');

  const baseState = {
    ...createInitialState(),
    ...profile,
    started: true,
    floor: profile.floor || 1,
    bestFloor: profile.bestFloor || 1,
    questStage: 'roguelike',
    questText: profile.questText || 'Limpe os andares e alcance o próximo portal.'
  };
  saveGame(baseState);
  if (window.asterraGame) {
    window.asterraGame.destroy(true);
  }

  window.asterraGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-shell',
    backgroundColor: '#0b0d16',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720
    },
    scene: [PlatformerScene]
  });

  window.asterraGame.scene.start('AsterraScene', baseState);
  updateHud(baseState);
}

function showTitle() {
  ui.title.classList.remove('hidden');
  ui.selection.classList.add('hidden');
  ui.hud.classList.add('hidden');
  document.querySelector('#game-shell').classList.remove('playing');
}

function showSelection() {
  ui.title.classList.add('hidden');
  ui.selection.classList.remove('hidden');
}

function refreshInventoryPanel(profile) {
  const items = Array.isArray(profile.inventory) ? profile.inventory : [];
  ui.inventoryList.innerHTML = items
    .map((item) => `<li><span>${item.name}</span><strong>x${item.amount}</strong></li>`)
    .join('');
}

function updateHud(profile) {
  const selectedWeapon = WEAPON_OPTIONS.find((weapon) => weapon.id === profile.weapon) || WEAPON_OPTIONS[0];
  ui.health.textContent = `${Math.max(0, profile.health)}/${profile.maxHealth}`;
  ui.energy.textContent = `${Math.max(0, profile.energy)}`;
  ui.level.textContent = `${profile.level}`;
  ui.xp.textContent = `${profile.xp}/${profile.nextLevel}`;
  ui.weapon.textContent = selectedWeapon.name;
  ui.questStatus.textContent = `Andar ${profile.floor || 1}/100 • ${profile.region}`;
  ui.journalGoal.textContent = `Objetivo: ${profile.questText}`;
  ui.floor.textContent = `${profile.floor || 1} / 100`;
  ui.floorProgress.style.width = `${profile.floor || 1}%`;
  ui.runBest.textContent = `Recorde: andar ${profile.bestFloor || 1}`;
  refreshInventoryPanel(profile);
}

if (state.started) {
  startAdventure(state);
} else {
  renderSelectionPanels();
  showTitle();
}

document.querySelector('#new-game-btn').addEventListener('click', () => {
  renderSelectionPanels();
  showSelection();
});

document.querySelector('#continue-btn').addEventListener('click', () => {
  const saved = loadGame() || createInitialState();
  startAdventure(saved);
});

document.querySelector('#begin-adventure').addEventListener('click', () => {
  startAdventure();
});

document.querySelector('#back-to-title').addEventListener('click', () => {
  showTitle();
});

document.querySelector('#restart-run').addEventListener('click', () => {
  document.querySelector('#run-end-screen').classList.add('hidden');
  startAdventure(applyCurrentSelection());
});

window.addEventListener('beforeunload', () => {
  if (window.asterraGame) {
    window.asterraGame.destroy(true);
  }
});
