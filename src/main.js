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
    <section id="title-screen" class="screen title-screen visible">
      <div class="title-art" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#111526" />
              <stop offset=".62" stop-color="#29202e" />
              <stop offset="1" stop-color="#100f18" />
            </linearGradient>
            <linearGradient id="old-stone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#716078" />
              <stop offset=".5" stop-color="#383044" />
              <stop offset="1" stop-color="#211e2c" />
            </linearGradient>
            <radialGradient id="gate-light">
              <stop offset="0" stop-color="#f8dca0" stop-opacity=".7" />
              <stop offset=".35" stop-color="#e7a767" stop-opacity=".2" />
              <stop offset="1" stop-color="#d37469" stop-opacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#night-sky)" />
          <circle cx="1095" cy="192" r="95" fill="#ded8cc" opacity=".58" />
          <circle cx="1095" cy="192" r="137" fill="none" stroke="#e8c994" stroke-opacity=".18" />
          <path d="M0 615 160 485 246 548 404 395 560 565 704 430 850 566 1037 388 1221 562 1346 462 1440 515V900H0Z" fill="#1b1b2b" />
          <path d="M0 680 178 563 308 642 462 514 617 665 774 535 918 661 1092 501 1250 664 1392 550 1440 584V900H0Z" fill="#151725" />
          <path d="M0 756 174 665 318 723 465 625 592 749 737 649 884 742 1016 632 1168 739 1305 649 1440 718V900H0Z" fill="#11131f" />
          <g fill="#282536" stroke="#8c736c" stroke-opacity=".24" stroke-width="4">
            <path d="M482 778V427H532V366H591V319H849V366H908V427H958V778Z" />
            <path d="M553 779V461Q720 241 887 461V779Z" fill="url(#old-stone)" />
            <path d="M603 780V483Q720 329 837 483V780Z" fill="#171724" />
            <path d="M648 778V520Q720 424 792 520V778Z" fill="#100f18" stroke="#d6a86a" stroke-opacity=".48" />
            <path d="M696 778V585Q720 551 744 585V778Z" fill="#e5aa6f" fill-opacity=".12" stroke="#e9c586" stroke-opacity=".5" />
            <path d="M449 431H991V451H449ZM507 371H933V390H507ZM577 324H863V342H577Z" />
          </g>
          <g fill="#e8bb7e" opacity=".78">
            <path d="M582 480Q598 452 614 480V506H582Z" />
            <path d="M826 480Q842 452 858 480V506H826Z" />
            <path d="M694 410Q720 379 746 410V448H694Z" />
            <path d="M704 354 720 328 736 354 720 380Z" />
          </g>
          <ellipse cx="720" cy="606" rx="360" ry="260" fill="url(#gate-light)" />
          <path d="M0 820 236 785 396 806 526 774 651 811 778 771 919 807 1065 772 1206 804 1440 768V900H0Z" fill="#0c0d15" />
          <path d="M475 834 604 815 720 840 836 815 965 834M524 865 636 849 720 869 804 849 916 865" fill="none" stroke="#b48b69" stroke-opacity=".36" stroke-width="3" />
          <g fill="#f3d9a1" opacity=".52">
            <circle cx="173" cy="191" r="3" /><circle cx="328" cy="281" r="2" /><circle cx="482" cy="158" r="2" />
            <circle cx="856" cy="235" r="3" /><circle cx="940" cy="119" r="2" /><circle cx="1270" cy="319" r="3" />
            <circle cx="1350" cy="142" r="2" /><circle cx="256" cy="382" r="2" /><circle cx="1160" cy="432" r="2" />
          </g>
        </svg>
      </div>
      <div class="title-panel">
        <div class="title-sigil" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="27" />
            <path d="M20 43V31a12 12 0 0 1 24 0v12M26 43V32a6 6 0 0 1 12 0v11M17 47h30M24 51h16" />
            <path d="m32 8 2.2 5.2 5.6.4-4.3 3.6 1.4 5.4-4.9-2.9-4.9 2.9 1.4-5.4-4.3-3.6 5.6-.4z" />
          </svg>
        </div>
        <p class="eyebrow">Uma lenda • Cem descidas • Dez guardiões</p>
        <h1>Asterra</h1>
        <h2>Abismo</h2>
        <div class="title-divider" aria-hidden="true"><span></span><i>✦</i><span></span></div>
        <p class="game-title-tagline">Uma aventura roguelike de fantasia sombria</p>
        <div class="story-mini">
          Sob as ruínas, cem andares guardam uma antiga maldição.<br />
          Desça. Enfrente os guardiões. Encontre o caminho de volta à luz.
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
