import Phaser from 'phaser';
import { COMPANION_OPTIONS, WEAPON_OPTIONS, createInitialState } from './gameData.js';
import {
  getBossStats,
  getEnemyStats,
  getFloorConfig,
  getFloorEnemyCount,
  MAX_FLOOR
} from './roguelike.js';
import { saveGame } from './saveSystem.js';

const ROOM = { width: 1280, height: 720 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ui = new Proxy({}, { get: (_target, key) => window.asterraUI[key] });

function setMessage(text) {
  ui.message.textContent = text;
}

function pixelRect(context, x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function makeHeroTexture(scene, key, palette) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, 24, 32);
  const context = texture.context;
  pixelRect(context, 7, 1, 10, 3, '#4a221c');
  pixelRect(context, 5, 4, 14, 7, palette.hair);
  pixelRect(context, 7, 5, 10, 7, '#f4cba3');
  pixelRect(context, 5, 8, 3, 3, palette.hair);
  pixelRect(context, 8, 8, 2, 1, '#281e20');
  pixelRect(context, 15, 8, 2, 1, '#281e20');
  pixelRect(context, 5, 12, 14, 10, palette.cloak);
  pixelRect(context, 8, 13, 8, 8, palette.armor);
  pixelRect(context, 10, 14, 4, 2, '#f4d378');
  pixelRect(context, 3, 14, 3, 8, palette.cloak);
  pixelRect(context, 18, 14, 3, 8, palette.cloak);
  pixelRect(context, 7, 22, 4, 8, '#34283c');
  pixelRect(context, 14, 22, 4, 8, '#34283c');
  pixelRect(context, 5, 29, 7, 2, '#c69a62');
  pixelRect(context, 13, 29, 7, 2, '#c69a62');
  texture.refresh();
}

function makeCompanionTexture(scene, type, color) {
  const key = `companion-${type}`;
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 32, 24);
  const ctx = texture.context;
  const body = Phaser.Display.Color.IntegerToColor(color).rgba;

  if (type === 'falcon') {
    pixelRect(ctx, 14, 7, 8, 12, '#7b8294');
    pixelRect(ctx, 4, 5, 11, 8, '#333748');
    pixelRect(ctx, 2, 3, 9, 3, '#485064');
    pixelRect(ctx, 18, 5, 11, 8, '#333748');
    pixelRect(ctx, 22, 3, 8, 3, '#485064');
    pixelRect(ctx, 20, 8, 8, 7, '#aeb4c2');
    pixelRect(ctx, 27, 10, 4, 2, '#f0b854');
    pixelRect(ctx, 22, 10, 2, 2, '#f2dfad');
    pixelRect(ctx, 17, 18, 2, 4, '#e1aa54');
    pixelRect(ctx, 21, 18, 2, 4, '#e1aa54');
  } else {
    pixelRect(ctx, 5, 11, 21, 9, type === 'tiger' ? '#e08b44' : '#736d82');
    pixelRect(ctx, 19, 7, 9, 8, type === 'tiger' ? '#e08b44' : '#8a8298');
    pixelRect(ctx, 20, 5, 3, 4, type === 'tiger' ? '#f0c77e' : '#c7bacd');
    pixelRect(ctx, 26, 5, 3, 4, type === 'tiger' ? '#f0c77e' : '#c7bacd');
    pixelRect(ctx, 27, 10, 4, 2, '#211c28');
    pixelRect(ctx, 6, 9, 5, 4, type === 'tiger' ? '#e08b44' : '#736d82');
    pixelRect(ctx, 2, 8, 5, 3, type === 'tiger' ? '#e08b44' : '#8a8298');
    pixelRect(ctx, 7, 19, 3, 5, '#d2bea3');
    pixelRect(ctx, 20, 19, 3, 5, '#d2bea3');
    if (type === 'tiger') {
      pixelRect(ctx, 10, 11, 2, 7, '#3a2630');
      pixelRect(ctx, 16, 11, 2, 7, '#3a2630');
      pixelRect(ctx, 22, 9, 2, 3, '#3a2630');
    } else {
      pixelRect(ctx, 4, 8, 2, 7, '#b39bce');
      pixelRect(ctx, 3, 6, 4, 2, '#b39bce');
    }
  }
  pixelRect(ctx, 12, 16, 7, 2, body);
  texture.refresh();
  return key;
}

function makeCreatureTexture(scene, key, kind, color) {
  if (scene.textures.exists(key)) return;
  const width = kind === 'boss' ? 48 : 24;
  const height = kind === 'boss' ? 48 : 24;
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.context;
  const accent = Phaser.Display.Color.IntegerToColor(color).rgba;

  if (kind === 'boss') {
    pixelRect(ctx, 13, 2, 7, 12, '#17131d');
    pixelRect(ctx, 28, 2, 7, 12, '#17131d');
    pixelRect(ctx, 9, 12, 31, 25, '#32263c');
    pixelRect(ctx, 14, 6, 20, 13, accent);
    pixelRect(ctx, 17, 10, 4, 3, '#ffe0a2');
    pixelRect(ctx, 27, 10, 4, 3, '#ffe0a2');
    pixelRect(ctx, 14, 21, 21, 4, '#17131d');
    pixelRect(ctx, 6, 19, 7, 18, '#241a2d');
    pixelRect(ctx, 36, 19, 7, 18, '#241a2d');
    pixelRect(ctx, 12, 37, 10, 9, '#1c1724');
    pixelRect(ctx, 28, 37, 10, 9, '#1c1724');
    pixelRect(ctx, 16, 26, 17, 3, '#c66a77');
    pixelRect(ctx, 22, 22, 3, 12, '#a94f68');
  } else if (kind === 'shade') {
    pixelRect(ctx, 8, 2, 8, 5, accent);
    pixelRect(ctx, 5, 7, 14, 6, '#282133');
    pixelRect(ctx, 3, 12, 18, 8, '#352840');
    pixelRect(ctx, 6, 20, 4, 3, '#231a2d');
    pixelRect(ctx, 14, 20, 4, 3, '#231a2d');
    pixelRect(ctx, 8, 9, 3, 2, '#fff0bd');
    pixelRect(ctx, 14, 9, 3, 2, '#fff0bd');
  } else if (kind === 'thorn') {
    pixelRect(ctx, 8, 8, 9, 13, '#40583d');
    pixelRect(ctx, 4, 6, 7, 5, '#658651');
    pixelRect(ctx, 15, 5, 6, 6, '#658651');
    pixelRect(ctx, 2, 11, 6, 4, accent);
    pixelRect(ctx, 17, 11, 5, 4, accent);
    pixelRect(ctx, 9, 4, 3, 7, '#a8cf72');
    pixelRect(ctx, 14, 2, 3, 8, '#a8cf72');
    pixelRect(ctx, 9, 14, 3, 2, '#f3e5b7');
    pixelRect(ctx, 15, 14, 3, 2, '#f3e5b7');
  } else {
    pixelRect(ctx, 5, 9, 14, 10, accent);
    pixelRect(ctx, 7, 6, 10, 5, '#9effce');
    pixelRect(ctx, 8, 10, 3, 3, '#fff4d3');
    pixelRect(ctx, 14, 10, 3, 3, '#fff4d3');
    pixelRect(ctx, 9, 11, 1, 2, '#1b2029');
    pixelRect(ctx, 15, 11, 1, 2, '#1b2029');
    pixelRect(ctx, 4, 17, 4, 4, '#477a74');
    pixelRect(ctx, 16, 17, 4, 4, '#477a74');
  }
  texture.refresh();
}

export class RoguelikeScene extends Phaser.Scene {
  constructor() {
    super('AsterraScene');
  }

  init(data) {
    this.profile = { ...createInitialState(), ...data };
    this.profile.floor = clamp(Math.floor(this.profile.floor || 1), 1, MAX_FLOOR);
    this.profile.bestFloor = Math.max(this.profile.bestFloor || 1, this.profile.floor);
    this.lastAttackAt = 0;
    this.lastDamageAt = 0;
    this.lastCompanionAt = 0;
    this.lastHudAt = 0;
    this.projectiles = [];
    this.floorVisuals = [];
    this.enemies = [];
    this.chests = [];
    this.floorCleared = false;
    this.runEnded = false;
    this.playerFacing = { x: 1, y: 0 };
    this.dashUntil = 0;
  }

  create() {
    this.physics.world.setBounds(0, 0, ROOM.width, ROOM.height);
    this.createTextures();
    this.createActors();
    this.createControls();
    this.createFixedUI();
    this.enterFloor(this.profile.floor);
  }

  createTextures() {
    makeHeroTexture(this, 'hero-male', { hair: '#f67a42', cloak: '#763c4b', armor: '#c19c6b' });
    makeHeroTexture(this, 'hero-female', { hair: '#f4b545', cloak: '#65476e', armor: '#d8b877' });
    COMPANION_OPTIONS.forEach((companion) => makeCompanionTexture(this, companion.id, companion.color));
  }

  createActors() {
    const heroKey = this.profile.character === 'female' ? 'hero-female' : 'hero-male';
    this.playerShadow = this.add.ellipse(210, 370, 34, 13, 0x08070b, 0.4).setDepth(5);
    this.player = this.physics.add.sprite(210, 350, heroKey).setScale(1.65).setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(10, 9).setOffset(7, 21);
    this.player.body.setMaxVelocity(250);

    const companion = COMPANION_OPTIONS.find((entry) => entry.id === this.profile.companion) || COMPANION_OPTIONS[0];
    this.companionSprite = this.add.image(164, 382, `companion-${companion.id}`).setScale(1.55).setDepth(9);
    this.companionShadow = this.add.ellipse(164, 397, 31, 10, 0x08070b, 0.32).setDepth(4);
    this.companionDamage = companion.id === 'tiger' ? 30 : companion.id === 'falcon' ? 22 : 26;
  }

  createControls() {
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
      potion: Phaser.Input.Keyboard.KeyCodes.ONE,
      dash: Phaser.Input.Keyboard.KeyCodes.Q
    });
    this.input.keyboard.on('keydown-E', () => this.interact());
    this.input.keyboard.on('keydown-SPACE', () => this.performAttack());
    this.input.keyboard.on('keydown-ONE', () => this.usePotion());
    this.input.keyboard.on('keydown-Q', () => this.dash());
    this.input.keyboard.on('keydown-I', () => this.togglePanel(ui.inventory));
    this.input.keyboard.on('keydown-J', () => this.togglePanel(ui.journal));
    this.input.keyboard.on('keydown-ESC', () => {
      ui.inventory.classList.add('hidden');
      ui.journal.classList.add('hidden');
    });
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.setFacing(worldPoint.x - this.player.x, worldPoint.y - this.player.y);
        this.performAttack();
      } else if (pointer.rightButtonDown()) {
        this.dash();
      }
    });
  }

  togglePanel(panel) {
    panel.classList.toggle('hidden');
  }

  createFixedUI() {
    this.floorLabel = this.add.text(640, 126, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#f8d78a',
      stroke: '#17121d',
      strokeThickness: 5
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);
    this.bossLabel = this.add.text(640, 162, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#ffd7be',
      stroke: '#160e18',
      strokeThickness: 5
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);
    this.hintLabel = this.add.text(640, 680, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#eadfc7',
      stroke: '#101015',
      strokeThickness: 4
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(30);
    this.bossBar = this.add.graphics().setScrollFactor(0).setDepth(30);
  }

  enterFloor(floor, announce = true) {
    const config = getFloorConfig(floor);
    this.profile.floor = config.floor;
    this.profile.region = config.region;
    this.profile.bestFloor = Math.max(this.profile.bestFloor, floor);
    this.floorCleared = false;
    this.bossEntity = null;
    this.bossLabel.setText(config.bossFloor ? `CHEFE • ${config.bossName}` : '');
    this.floorLabel.setText(`ANDAR ${floor} / ${MAX_FLOOR}     •     ${config.region.toUpperCase()}`);
    this.profile.questText = config.bossFloor
      ? `Derrote ${config.bossName} e encontre a saída.`
      : `Limpe o andar ${floor} e alcance o portal.`;

    this.clearFloorEntities();
    this.drawFloor(config);
    this.spawnFloorContent(config);
    this.player.setPosition(210, 350);
    this.player.body.setVelocity(0, 0);
    this.companionSprite.setPosition(164, 382);
    this.floorLabel.setColor(config.bossFloor ? '#ffd0aa' : '#f8d78a');
    if (announce) {
      this.flashFloorTitle(floor, config);
      setMessage(config.bossFloor
        ? `O selo se rompe. ${config.bossName} guarda o andar ${floor}.`
        : `Andar ${floor}: ${config.region}. Derrote os inimigos para liberar a passagem.`);
    }
    this.updateHud();
    saveGame(this.profile);
  }

  drawFloor(config) {
    this.floorVisuals.forEach((object) => object.destroy());
    this.floorVisuals = [];
    this.playerWallCollider?.destroy();
    if (this.walls) this.walls.clear(true, true);
    this.walls = this.physics.add.staticGroup();

    const { theme } = config;
    const floor = this.add.graphics();
    floor.fillStyle(theme.ground, 1).fillRect(0, 0, ROOM.width, ROOM.height);
    for (let y = 76; y < 660; y += 48) {
      for (let x = 70; x < 1210; x += 48) {
        const alternating = ((x / 48 + y / 48) % 2) === 0;
        floor.fillStyle(alternating ? theme.tile : theme.ground, alternating ? 0.36 : 0.2);
        floor.fillRoundedRect(x, y, 44, 44, 5);
        floor.lineStyle(1, theme.accent, 0.08).strokeRoundedRect(x, y, 44, 44, 5);
      }
    }
    for (let i = 0; i < 80; i += 1) {
      const x = Phaser.Math.Between(72, 1208);
      const y = Phaser.Math.Between(76, 650);
      floor.fillStyle(i % 5 === 0 ? theme.glow : theme.accent, i % 5 === 0 ? 0.12 : 0.08);
      floor.fillRect(x, y, Phaser.Math.Between(2, 6), Phaser.Math.Between(2, 4));
    }
    this.floorVisuals.push(floor);

    const ambient = this.add.graphics().setDepth(1);
    for (let i = 0; i < 6; i += 1) {
      const x = 120 + i * 210;
      ambient.fillStyle(theme.glow, 0.08).fillCircle(x, 110 + (i % 2) * 470, 48);
      ambient.fillStyle(theme.glow, 0.12).fillCircle(x, 110 + (i % 2) * 470, 20);
    }
    this.floorVisuals.push(ambient);

    const edgeGlow = this.add.graphics().setDepth(2);
    edgeGlow.lineStyle(3, theme.accent, 0.36).strokeRoundedRect(56, 58, 1168, 604, 18);
    edgeGlow.lineStyle(1, theme.glow, 0.2).strokeRoundedRect(62, 64, 1156, 592, 14);
    this.floorVisuals.push(edgeGlow);
    if (config.bossFloor) {
      const arena = this.add.graphics().setDepth(2);
      arena.fillStyle(theme.glow, 0.08).fillCircle(820, 350, 184);
      arena.lineStyle(5, theme.accent, 0.38).strokeCircle(820, 350, 154);
      arena.lineStyle(2, theme.glow, 0.34).strokeCircle(820, 350, 128);
      arena.lineStyle(2, theme.accent, 0.24);
      for (let rune = 0; rune < 8; rune += 1) {
        const angle = (Math.PI * 2 * rune) / 8;
        const x1 = 820 + Math.cos(angle) * 112;
        const y1 = 350 + Math.sin(angle) * 112;
        const x2 = 820 + Math.cos(angle) * 146;
        const y2 = 350 + Math.sin(angle) * 146;
        arena.lineBetween(x1, y1, x2, y2);
      }
      this.floorVisuals.push(arena);
    }

    const boundary = [
      [640, 55, 1180, 32], [640, 665, 1180, 32],
      [55, 360, 32, 580], [1225, 360, 32, 580]
    ];
    boundary.forEach(([x, y, width, height]) => this.addWall(x, y, width, height, theme));

    const pillars = [
      [390, 195], [640, 235], [890, 195], [390, 525], [640, 565], [890, 525]
    ];
    pillars.forEach(([x, y], index) => {
      const pillar = this.add.graphics().setDepth(y - 10);
      pillar.fillStyle(0x0d0e16, 0.38).fillEllipse(x, y + 22, 66, 22);
      pillar.fillStyle(theme.accent, 0.12).fillRoundedRect(x - 25, y - 28, 50, 62, 10);
      pillar.fillStyle(0x292a37, 1).fillRoundedRect(x - 20, y - 32, 40, 60, 9);
      pillar.fillStyle(theme.tile, 1).fillRoundedRect(x - 16, y - 28, 32, 52, 7);
      pillar.fillStyle(theme.glow, 0.34).fillRect(x - 3, y - 24, 6, 42);
      pillar.lineStyle(2, theme.accent, 0.65).strokeRoundedRect(x - 20, y - 32, 40, 60, 9);
      this.floorVisuals.push(pillar);
      this.addWall(x, y, index % 2 ? 26 : 24, index % 2 ? 38 : 32, theme, true);
    });
    this.playerWallCollider = this.physics.add.collider(this.player, this.walls);

    const shrine = this.add.graphics().setDepth(3);
    shrine.fillStyle(theme.glow, 0.09).fillCircle(210, 350, 76);
    shrine.fillStyle(0x15151c, 1).fillRoundedRect(128, 280, 164, 132, 20);
    shrine.lineStyle(3, theme.glow, 0.56).strokeRoundedRect(128, 280, 164, 132, 20);
    shrine.fillStyle(0x564756, 1).fillRoundedRect(140, 292, 140, 108, 16);
    shrine.fillStyle(theme.glow, 0.92).fillTriangle(210, 306, 195, 370, 225, 370);
    shrine.fillStyle(0xffe6a1, 0.9).fillCircle(210, 340, 9);
    shrine.fillStyle(theme.glow, 0.16).fillCircle(210, 340, 32);
    this.floorVisuals.push(shrine);

    if (config.floor === 1) this.createBokuto(theme);
    else this.bokuto = null;
    this.createExitGate(theme);
  }

  clearFloorEntities() {
    this.enemies.forEach((enemy) => {
      enemy.collider?.destroy();
      enemy.bar?.destroy();
      enemy.barGraphics?.destroy();
      enemy.nameText?.destroy();
      enemy.sprite.destroy();
    });
    this.enemies = [];
    this.projectiles.forEach((projectile) => projectile.sprite.destroy());
    this.projectiles = [];
    this.chests.forEach((chest) => chest.sprite.destroy());
    this.chests = [];
    this.bossEntity = null;
  }

  addWall(x, y, width, height, theme, pillar = false) {
    const wall = this.add.rectangle(x, y, width, height, pillar ? 0x2a2338 : 0x181821, 0.01);
    this.physics.add.existing(wall, true);
    this.walls.add(wall);
    wall.body.setSize(width, height);
    return wall;
  }

  createBokuto(theme) {
    const bokuto = this.add.image(320, 365, 'hero-male').setScale(1.5).setTint(0x76d7c7).setDepth(10);
    this.floorVisuals.push(bokuto);
    const label = this.add.text(320, 330, 'BOKUTO', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#bdf7e6', stroke: '#14151d', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);
    this.floorVisuals.push(label);
    this.bokuto = { x: 320, y: 365, theme };
  }

  createExitGate(theme) {
    this.portal = this.add.container(1130, 350).setDepth(7);
    const glow = this.add.circle(0, 0, 46, theme.glow, 0.12);
    const ring = this.add.circle(0, 0, 29, theme.accent, 0.17);
    ring.setStrokeStyle(3, theme.glow, 0.76);
    const core = this.add.circle(0, 0, 17, theme.glow, 0.45);
    const center = this.add.circle(0, 0, 8, 0xf6e8be, 0.92);
    this.portal.add([glow, ring, core, center]);
    this.floorVisuals.push(this.portal);
    this.portal.setAlpha(0.25);
    this.tweens.add({ targets: this.portal, angle: 360, duration: 9000, repeat: -1 });
    this.tweens.add({ targets: [glow, core], scale: 1.18, duration: 900, yoyo: true, repeat: -1 });
    const label = this.add.text(1130, 405, 'SAÍDA', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#f7dca1', stroke: '#18131d', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);
    this.floorVisuals.push(label);
  }

  createChest(theme) {
    if (this.profile.floor % 3 !== 0 && this.profile.floor % 10 !== 0) return;
    const chest = this.add.container(1040, 560).setDepth(8);
    const shadow = this.add.ellipse(0, 14, 46, 13, 0x08070b, 0.38);
    const body = this.add.rectangle(0, 0, 34, 23, 0x704638).setStrokeStyle(2, theme.glow, 0.9);
    const lid = this.add.rectangle(0, -12, 36, 10, theme.glow).setStrokeStyle(2, 0x563443, 1);
    const latch = this.add.rectangle(0, -1, 5, 10, 0xffe7a3);
    chest.add([shadow, body, lid, latch]);
    this.chests.push({ sprite: chest, opened: false });
  }

  spawnFloorContent(config) {
    this.floorCleared = false;
    this.portal.setAlpha(0.25);
    this.createChest(config.theme);
    const count = getFloorEnemyCount(config.floor);
    if (config.bossFloor) {
      this.spawnBoss(config);
      return;
    }
    const stats = getEnemyStats(config.floor);
    const eliteStats = getEnemyStats(config.floor, true);
    const positions = [
      [500, 300], [720, 340], [890, 290], [460, 480],
      [760, 500], [970, 440], [560, 220], [900, 520]
    ];
    for (let index = 0; index < count; index += 1) {
      const [x, y] = positions[index];
      const elite = config.floor > 8 && index === count - 1 && config.floor % 4 === 0;
      const kind = elite ? 'shade' : ['slime', 'shade', 'thorn'][(config.floor + index) % 3];
      this.spawnEnemy(x, y, kind, elite ? eliteStats : stats, elite, config.theme, config.zoneIndex);
    }
  }

  spawnEnemy(x, y, kind, stats, elite, theme, zoneIndex) {
    const key = `creature-${kind}-${zoneIndex}-${elite ? 'elite' : 'regular'}`;
    makeCreatureTexture(this, key, kind, elite ? theme.glow : theme.accent);
    const sprite = this.physics.add.sprite(x, y, key).setScale(elite ? 1.85 : 1.55).setDepth(y);
    sprite.body.setSize(12, 12).setOffset(6, 8);
    sprite.body.setCollideWorldBounds(true);
    sprite.body.setMaxVelocity(120);
    const hp = stats.health + (elite ? 18 : 0);
    const enemy = {
      sprite,
      name: elite ? 'Elite corrompido' : kind === 'slime' ? 'Slime de Asterra' : kind === 'shade' ? 'Vulto' : 'Espinheiro vivo',
      kind,
      hp,
      maxHp: hp,
      speed: stats.speed,
      damage: stats.damage,
      xp: stats.xp,
      elite,
      nextAttack: this.time.now + Phaser.Math.Between(600, 1500),
      attackCooldown: elite ? 1100 : 1350,
      color: theme.accent
    };
    enemy.collider = this.physics.add.collider(sprite, this.walls);
    enemy.bar = this.add.graphics().setDepth(25);
    this.enemies.push(enemy);
    return enemy;
  }

  spawnBoss(config) {
    const stats = getBossStats(config.floor);
    const key = `boss-${config.floor}`;
    makeCreatureTexture(this, key, 'boss', config.theme.accent);
    const sprite = this.physics.add.sprite(920, 350, key).setScale(1.85).setDepth(350);
    sprite.body.setSize(30, 30).setOffset(9, 15);
    sprite.body.setCollideWorldBounds(true);
    sprite.body.setMaxVelocity(150);
    const nameText = this.add.text(sprite.x, sprite.y - 67, config.bossName, {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#ffdbba', stroke: '#160e18', strokeThickness: 5
    }).setOrigin(0.5).setDepth(30);
    const bar = this.add.graphics().setDepth(30);
    const boss = {
      sprite,
      name: config.bossName,
      hp: stats.health,
      maxHp: stats.health,
      speed: stats.speed,
      damage: stats.damage,
      xp: stats.xp,
      elite: true,
      boss: true,
      color: config.theme.accent,
      nextAttack: this.time.now + 1800,
      attackCooldown: Math.max(1000, 2350 - config.floor * 7),
      nameText,
      bar,
      phase: 1,
      telegraphing: false
    };
    boss.collider = this.physics.add.collider(sprite, this.walls);
    boss.barGraphics = this.add.graphics().setDepth(28);
    this.bossEntity = boss;
    this.enemies.push(boss);
    this.paintBossHealth(boss);
  }

  paintBossHealth(boss) {
    const width = 300;
    const ratio = clamp(boss.hp / boss.maxHp, 0, 1);
    boss.bar.clear();
    boss.bar.fillStyle(0x100d17, 0.9).fillRoundedRect(490, 194, width, 16, 7);
    boss.bar.fillStyle(ratio < 0.3 ? 0xe94e67 : 0xb64970, 1).fillRoundedRect(493, 197, (width - 6) * ratio, 10, 5);
    boss.bar.lineStyle(1, 0xf4c0a3, 0.7).strokeRoundedRect(490, 194, width, 16, 7);
    boss.nameText.setPosition(boss.sprite.x, boss.sprite.y - 67);
    boss.barGraphics.clear();
    boss.barGraphics.fillStyle(0x120e18, 0.85).fillRoundedRect(boss.sprite.x - 34, boss.sprite.y - 49, 68, 8, 3);
    boss.barGraphics.fillStyle(0xff7580, 1).fillRoundedRect(boss.sprite.x - 32, boss.sprite.y - 47, 64 * ratio, 4, 2);
  }

  flashFloorTitle(floor, config) {
    const title = this.add.text(640, 300, `ANDAR ${floor}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '54px',
      color: config.bossFloor ? '#ffb68f' : '#f3d996',
      stroke: '#100e17',
      strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setDepth(31);
    const subtitle = this.add.text(640, 355, config.bossFloor ? config.bossName : config.region, {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#e8d8c2', stroke: '#100e17', strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0).setDepth(31);
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      duration: 450,
      yoyo: true,
      hold: 650,
      onComplete: () => { title.destroy(); subtitle.destroy(); }
    });
  }

  update(time, delta) {
    if (!this.player || this.runEnded) return;

    const movement = { x: 0, y: 0 };
    if (this.keys.w.isDown || this.keys.up.isDown) movement.y -= 1;
    if (this.keys.s.isDown || this.keys.down.isDown) movement.y += 1;
    if (this.keys.a.isDown || this.keys.left.isDown) movement.x -= 1;
    if (this.keys.d.isDown || this.keys.right.isDown) movement.x += 1;

    const moving = movement.x !== 0 || movement.y !== 0;
    const running = this.keys.shift.isDown && this.profile.energy > 0;
    if (moving) {
      const length = Math.hypot(movement.x, movement.y);
      movement.x /= length;
      movement.y /= length;
      this.setFacing(movement.x, movement.y);
      const speed = running ? 210 : 150;
      this.player.body.setVelocity(movement.x * speed, movement.y * speed);
      if (running) this.profile.energy = Math.max(0, this.profile.energy - delta * 0.018);
      else this.profile.energy = Math.min(100, this.profile.energy + delta * 0.009);
    } else {
      this.player.body.setVelocity(0, 0);
      this.profile.energy = Math.min(100, this.profile.energy + delta * 0.016);
    }

    this.playerShadow.setPosition(this.player.x, this.player.y + 21).setDepth(this.player.y - 1);
    this.player.setDepth(this.player.y);
    const companionX = this.player.x - this.playerFacing.x * 36 + this.playerFacing.y * 24;
    const companionY = this.player.y - this.playerFacing.y * 36 - this.playerFacing.x * 24;
    this.companionSprite.x = Phaser.Math.Linear(this.companionSprite.x, companionX, 0.12);
    this.companionSprite.y = Phaser.Math.Linear(this.companionSprite.y, companionY, 0.12);
    this.companionSprite.setDepth(this.companionSprite.y);
    this.companionShadow.setPosition(this.companionSprite.x, this.companionSprite.y + 14).setDepth(this.companionSprite.y - 1);

    this.updateEnemies(time);
    this.updateProjectiles(delta);
    this.updateChestHint();
    this.updateExitGate();
    this.hintLabel.setText(this.getHint());

    if (time - (this.lastSaveAt || 0) > 4000) {
      this.lastSaveAt = time;
      saveGame(this.profile);
    }
    if (time - this.lastHudAt > 180) {
      this.lastHudAt = time;
      this.updateHud();
    }
  }

  setFacing(x, y) {
    const length = Math.hypot(x, y) || 1;
    this.playerFacing.x = x / length;
    this.playerFacing.y = y / length;
  }

  updateEnemies(time) {
    this.enemies = this.enemies.filter((enemy) => enemy.sprite.active);
    for (const enemy of this.enemies) {
      const dx = this.player.x - enemy.sprite.x;
      const dy = this.player.y - enemy.sprite.y;
      const distance = Math.hypot(dx, dy) || 1;
      const direction = Math.atan2(dy, dx);
      const alertRange = enemy.boss ? 520 : 330;
      if (distance < alertRange) {
        enemy.sprite.body.setVelocity(Math.cos(direction) * enemy.speed, Math.sin(direction) * enemy.speed);
      } else {
        enemy.sprite.body.setVelocity(Math.sin(time / 650) * 14, Math.cos(time / 780) * 14);
      }
      enemy.sprite.setDepth(enemy.sprite.y);

      if (enemy.boss) {
        enemy.nameText.setPosition(enemy.sprite.x, enemy.sprite.y - 67);
        this.paintBossHealth(enemy);
        const nextPhase = enemy.hp <= enemy.maxHp * 0.45 ? 2 : 1;
        if (nextPhase !== enemy.phase) {
          enemy.phase = nextPhase;
          enemy.speed *= 1.35;
          enemy.attackCooldown = Math.max(850, enemy.attackCooldown * 0.72);
          setMessage(`${enemy.name} entra em fúria! Esquive dos golpes marcados no chão.`);
          this.tweens.add({ targets: enemy.sprite, tint: 0xff526d, duration: 180, yoyo: true, repeat: 2 });
        }
      }

      if (!enemy.telegraphing && time > enemy.nextAttack && distance < (enemy.boss ? 520 : 38)) {
        if (enemy.boss) this.startBossAttack(enemy, time);
        else if (distance < 38) {
          this.damagePlayer(enemy.damage, enemy.name);
          enemy.nextAttack = time + enemy.attackCooldown;
        }
      }
      if (enemy.bar && !enemy.boss) {
        const ratio = clamp(enemy.hp / enemy.maxHp, 0, 1);
        enemy.bar.clear();
        enemy.bar.fillStyle(0x17121c, 0.85).fillRoundedRect(enemy.sprite.x - 19, enemy.sprite.y - 25, 38, 5, 2);
        enemy.bar.fillStyle(enemy.elite ? 0xe39c5e : 0xa8d68b, 0.95).fillRoundedRect(enemy.sprite.x - 18, enemy.sprite.y - 24, 36 * ratio, 3, 1);
      }
    }

    if (this.enemies.length === 0 && !this.floorCleared) {
      this.floorCleared = true;
      this.portal.setAlpha(1);
      this.portal.setScale(1.2);
      this.tweens.add({ targets: this.portal, scale: 1, duration: 350 });
      if (this.profile.floor % 10 === 0) {
        this.profile.defeatedBosses = [...new Set([...(this.profile.defeatedBosses || []), this.profile.floor])];
        this.profile.gold += 80 + this.profile.floor * 2;
        this.profile.maxHealth += 5;
        this.profile.health = this.profile.maxHealth;
        setMessage(`Chefe derrotado! Recompensa rara, +${80 + this.profile.floor * 2} moedas e vida restaurada. Pressione E no portal.`);
        if (this.profile.floor === MAX_FLOOR) {
          this.runEnded = true;
          this.profile.runEnded = true;
          this.showVictory();
        }
      } else {
        setMessage(`Andar limpo! Recolha o tesouro e pressione E junto ao portal para continuar.`);
      }
      this.profile.questText = this.profile.floor === MAX_FLOOR
        ? 'Monarca Sombrio derrotado. Asterra está livre.'
        : `Andar ${this.profile.floor} limpo; avance para o próximo.`;
      this.updateHud();
      saveGame(this.profile);
    }

    if (time - this.lastCompanionAt > 1900 && this.enemies.length) {
      this.lastCompanionAt = time;
      const target = this.enemies.reduce((nearest, enemy) => {
        const d = Phaser.Math.Distance.Between(this.companionSprite.x, this.companionSprite.y, enemy.sprite.x, enemy.sprite.y);
        return !nearest || d < nearest.distance ? { enemy, distance: d } : nearest;
      }, null);
      if (target && target.distance < 230) this.companionStrike(target.enemy);
    }
  }

  startBossAttack(boss, time) {
    boss.telegraphing = true;
    const radius = boss.phase === 2 ? 100 : 78;
    const warning = this.add.circle(this.player.x, this.player.y, radius, 0xe84d73, 0.2).setDepth(19);
    warning.setStrokeStyle(4, 0xffb0b4, 0.85);
    this.tweens.add({ targets: warning, scale: 1.18, alpha: 0.58, duration: 550, yoyo: true, repeat: 0 });
    setMessage(`${boss.name} prepara um golpe! Saia do círculo vermelho.`);
    this.time.delayedCall(720, () => {
      if (!warning.active) return;
      if (!boss.sprite.active) {
        warning.destroy();
        return;
      }
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, warning.x, warning.y);
      if (distance < radius) this.damagePlayer(boss.damage, boss.name);
      else setMessage('Esquiva perfeita! O golpe do chefe errou.');
      const impact = this.add.circle(warning.x, warning.y, radius, 0xff6d81, 0.32).setDepth(18);
      this.tweens.add({ targets: impact, alpha: 0, scale: 1.25, duration: 300, onComplete: () => impact.destroy() });
      warning.destroy();
      boss.telegraphing = false;
      boss.nextAttack = time + boss.attackCooldown;
    });
  }

  damagePlayer(amount, attacker) {
    if (this.time.now < this.lastDamageAt || this.runEnded) return;
    this.lastDamageAt = this.time.now + 500;
    const damage = Math.max(3, Math.round(amount - this.profile.defense * 0.55));
    this.profile.health = Math.max(0, this.profile.health - damage);
    this.tweens.add({ targets: this.player, alpha: 0.35, duration: 80, yoyo: true, repeat: 2 });
    setMessage(`${attacker} atingiu você por ${damage}. Use Q para esquivar.`);
    if (this.profile.health <= 0) this.endRun();
    this.updateHud();
  }

  endRun() {
    this.runEnded = true;
    this.profile.runEnded = true;
    this.profile.bestFloor = Math.max(this.profile.bestFloor, this.profile.floor);
    saveGame(this.profile);
    document.querySelector('#run-end-title').textContent = 'A jornada termina…';
    document.querySelector('#run-end-copy').textContent = `Você caiu no andar ${this.profile.floor}. Recorde desta jornada: andar ${this.profile.bestFloor}.`;
    document.querySelector('#run-end-screen').classList.remove('hidden');
  }

  showVictory() {
    document.querySelector('#run-end-title').textContent = 'Asterra está livre';
    document.querySelector('#run-end-copy').textContent = 'Você venceu o Monarca Sombrio e atravessou os 100 andares.';
    document.querySelector('#run-end-screen').classList.remove('hidden');
    setMessage('Vitória! O legado do grande herói foi restaurado.');
  }

  companionStrike(enemy) {
    enemy.hp -= this.companionDamage;
    const line = this.add.graphics().setDepth(22);
    line.lineStyle(3, this.profile.companion === 'falcon' ? 0x89d7ff : 0xd5a9ff, 0.95);
    line.lineBetween(this.companionSprite.x, this.companionSprite.y, enemy.sprite.x, enemy.sprite.y);
    this.tweens.add({ targets: line, alpha: 0, duration: 220, onComplete: () => line.destroy() });
    this.resolveEnemyDamage(enemy, this.companionDamage);
  }

  performAttack() {
    if (this.runEnded || this.time.now - this.lastAttackAt < 360) return;
    this.lastAttackAt = this.time.now;
    const weapon = WEAPON_OPTIONS.find((entry) => entry.id === this.profile.weapon) || WEAPON_OPTIONS[0];
    const damage = Math.round(weapon.damage + this.profile.level * 2.6);
    const color = this.profile.weapon === 'bow' ? 0x9de4ff : this.profile.weapon === 'spear' ? 0xd7e9bc : 0xffd18c;

    if (this.profile.weapon === 'bow') {
      this.fireArrow(damage, color);
      setMessage('Flecha disparada.');
      return;
    }

    const reach = this.profile.weapon === 'spear' ? 88 : 59;
    const endX = this.player.x + this.playerFacing.x * reach;
    const endY = this.player.y + this.playerFacing.y * reach;
    const slash = this.add.graphics().setDepth(this.player.y + 1);
    slash.lineStyle(this.profile.weapon === 'spear' ? 6 : 8, color, 0.92);
    slash.lineBetween(this.player.x, this.player.y, endX, endY);
    slash.lineStyle(2, 0xffffff, 0.75);
    slash.strokeCircle(endX, endY, this.profile.weapon === 'spear' ? 8 : 16);
    this.tweens.add({ targets: slash, alpha: 0, duration: 150, onComplete: () => slash.destroy() });

    let hit = false;
    [...this.enemies].forEach((enemy) => {
      const dx = enemy.sprite.x - this.player.x;
      const dy = enemy.sprite.y - this.player.y;
      const distance = Math.hypot(dx, dy) || 1;
      const dot = (dx * this.playerFacing.x + dy * this.playerFacing.y) / distance;
      if (distance <= reach + (enemy.boss ? 30 : 18) && dot > (this.profile.weapon === 'spear' ? 0.12 : 0.28)) {
        hit = true;
        this.resolveEnemyDamage(enemy, damage);
      }
    });
    setMessage(hit ? `${weapon.name}: golpe certeiro!` : `${weapon.name}: o golpe não alcançou o inimigo.`);
  }

  fireArrow(damage, color) {
    const sprite = this.add.rectangle(this.player.x, this.player.y, 18, 4, color).setDepth(20);
    sprite.rotation = Math.atan2(this.playerFacing.y, this.playerFacing.x);
    this.projectiles.push({ sprite, x: sprite.x, y: sprite.y, vx: this.playerFacing.x * 500, vy: this.playerFacing.y * 500, damage, life: 0.8 });
  }

  updateProjectiles(delta) {
    const seconds = delta / 1000;
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.x += projectile.vx * seconds;
      projectile.y += projectile.vy * seconds;
      projectile.life -= seconds;
      projectile.sprite.setPosition(projectile.x, projectile.y);
      const target = this.enemies.find((enemy) =>
        Phaser.Math.Distance.Between(projectile.x, projectile.y, enemy.sprite.x, enemy.sprite.y) < (enemy.boss ? 42 : 22)
      );
      if (target) {
        this.resolveEnemyDamage(target, projectile.damage);
        projectile.sprite.destroy();
        return false;
      }
      if (projectile.life <= 0 || projectile.x < 70 || projectile.x > 1210 || projectile.y < 70 || projectile.y > 650) {
        projectile.sprite.destroy();
        return false;
      }
      return true;
    });
  }

  resolveEnemyDamage(enemy, damage) {
    if (!enemy.sprite.active) return;
    enemy.hp -= damage;
    enemy.sprite.setTintFill(0xffffff);
    this.time.delayedCall(90, () => {
      if (enemy.sprite.active) enemy.sprite.clearTint();
    });
    if (enemy.boss) {
      this.paintBossHealth(enemy);
      if (enemy.hp <= 0) {
        enemy.sprite.destroy();
        enemy.nameText.destroy();
        enemy.bar.destroy();
        enemy.barGraphics.destroy();
        this.bossEntity = null;
        this.profile.xp += enemy.xp;
        this.levelUpIfNeeded();
        setMessage(`${enemy.name} caiu. O selo do próximo trecho se abriu.`);
      }
      return;
    }
    if (enemy.hp <= 0) {
      enemy.sprite.destroy();
      enemy.bar.destroy();
      this.profile.slimeKills += 1;
      this.profile.gold += enemy.elite ? 18 : 7;
      this.profile.xp += enemy.xp;
      this.levelUpIfNeeded();
      if (Math.random() < 0.14) this.addPotion();
      setMessage(`${enemy.name} derrotado • +${enemy.xp} XP`);
    }
  }

  levelUpIfNeeded() {
    while (this.profile.xp >= this.profile.nextLevel && this.profile.level < 100) {
      this.profile.xp -= this.profile.nextLevel;
      this.profile.level += 1;
      this.profile.nextLevel = Math.round(this.profile.nextLevel * 1.28);
      this.profile.maxHealth += 9;
      this.profile.health = this.profile.maxHealth;
      this.profile.defense += 0.7;
      setMessage(`Nível ${this.profile.level}! Vida restaurada e defesa aumentada.`);
    }
    this.updateHud();
  }

  addPotion() {
    this.profile.inventory = this.profile.inventory.map((item) =>
      item.id === 'potion' ? { ...item, amount: item.amount + 1 } : item
    );
    setMessage('Poção de cura encontrada. Pressione 1 para usar.');
  }

  usePotion() {
    const potion = this.profile.inventory.find((item) => item.id === 'potion');
    if (!potion || potion.amount <= 0) {
      setMessage('Você não tem poções de cura.');
      return;
    }
    if (this.profile.health >= this.profile.maxHealth) {
      setMessage('Sua vida já está cheia.');
      return;
    }
    this.profile.health = Math.min(this.profile.maxHealth, this.profile.health + 45);
    this.profile.inventory = this.profile.inventory.map((item) =>
      item.id === 'potion' ? { ...item, amount: item.amount - 1 } : item
    );
    setMessage('Poção usada. +45 de vida.');
    this.updateHud();
  }

  dash() {
    if (this.profile.energy < 25 || this.runEnded) {
      setMessage('Energia insuficiente para esquivar.');
      return;
    }
    this.profile.energy -= 25;
    this.dashUntil = this.time.now + 340;
    this.player.body.setVelocity(this.playerFacing.x * 430, this.playerFacing.y * 430);
    const echo = this.add.image(this.player.x, this.player.y, this.player.texture.key).setScale(1.65).setAlpha(0.4).setDepth(this.player.y - 1);
    this.tweens.add({ targets: echo, alpha: 0, duration: 260, onComplete: () => echo.destroy() });
  }

  damagePlayer(amount, attacker) {
    if (this.time.now < this.lastDamageAt || this.time.now < this.dashUntil || this.runEnded) return;
    this.lastDamageAt = this.time.now + 500;
    const damage = Math.max(3, Math.round(amount - this.profile.defense * 0.55));
    this.profile.health = Math.max(0, this.profile.health - damage);
    this.tweens.add({ targets: this.player, alpha: 0.35, duration: 80, yoyo: true, repeat: 2 });
    setMessage(`${attacker} atingiu você por ${damage}. Use Q para esquivar.`);
    if (this.profile.health <= 0) this.endRun();
    this.updateHud();
  }

  updateChestHint() {
    for (const chest of this.chests) {
      if (!chest.opened && Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.sprite.x, chest.sprite.y) < 70) return;
    }
  }

  getHint() {
    if (this.runEnded) return '';
    const chest = this.chests.find((entry) => !entry.opened &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y) < 70);
    if (chest) return 'E  •  Abrir baú';
    if (this.bokuto && this.profile.floor === 1 &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bokuto.x, this.bokuto.y) < 82) return 'E  •  Falar com Bokuto';
    if (this.floorCleared && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y) < 86) {
      return this.profile.floor === MAX_FLOOR ? 'A jornada terminou' : 'E  •  Descer para o próximo andar';
    }
    return this.enemies.length ? 'Derrote todos para abrir a saída' : 'Explore a sala e siga o brilho do portal';
  }

  updateExitGate() {
    if (this.floorCleared && this.portal) this.portal.setAlpha(0.82 + Math.sin(this.time.now / 220) * 0.15);
  }

  interact() {
    if (this.runEnded) return;
    const chest = this.chests.find((entry) => !entry.opened &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y) < 76);
    if (chest) {
      chest.opened = true;
      chest.sprite.setScale(1.08, 0.75);
      this.profile.gold += this.profile.floor % 10 === 0 ? 90 : 25 + this.profile.floor;
      this.profile.inventory = this.profile.inventory.map((item) =>
        item.id === 'potion' ? { ...item, amount: item.amount + 1 } : item
      );
      setMessage('Baú aberto: moedas e uma poção de cura.');
      this.updateHud();
      return;
    }

    if (this.bokuto && this.profile.floor === 1 &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bokuto.x, this.bokuto.y) < 82) {
      setMessage('Bokuto: “Cada dez andares, um guardião. Sobreviva, aprenda e mantenha viva a chama.”');
      return;
    }

    const nearPortal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y) < 86;
    if (!this.floorCleared) {
      if (nearPortal) setMessage('O selo ainda está fechado. Derrote todos os inimigos primeiro.');
      return;
    }
    if (!nearPortal) return;
    if (this.profile.floor >= MAX_FLOOR) {
      this.showVictory();
      return;
    }
    this.enterFloor(this.profile.floor + 1);
  }

  endRun() {
    this.runEnded = true;
    this.profile.runEnded = true;
    this.profile.bestFloor = Math.max(this.profile.bestFloor, this.profile.floor);
    saveGame(this.profile);
    document.querySelector('#run-end-title').textContent = 'A jornada termina…';
    document.querySelector('#run-end-copy').textContent = `Você caiu no andar ${this.profile.floor}. Recorde desta jornada: andar ${this.profile.bestFloor}.`;
    document.querySelector('#run-end-screen').classList.remove('hidden');
  }

  showVictory() {
    this.runEnded = true;
    this.profile.runEnded = true;
    document.querySelector('#run-end-title').textContent = 'Asterra está livre';
    document.querySelector('#run-end-copy').textContent = 'Você venceu o Monarca Sombrio e atravessou os 100 andares.';
    document.querySelector('#run-end-screen').classList.remove('hidden');
    setMessage('Vitória! O legado do grande herói foi restaurado.');
    saveGame(this.profile);
  }

  updateHud() {
    const weapon = WEAPON_OPTIONS.find((entry) => entry.id === this.profile.weapon) || WEAPON_OPTIONS[0];
    const companion = COMPANION_OPTIONS.find((entry) => entry.id === this.profile.companion) || COMPANION_OPTIONS[0];
    ui.health.textContent = `${Math.ceil(this.profile.health)}/${this.profile.maxHealth}`;
    ui.energy.textContent = `${Math.ceil(this.profile.energy)}`;
    ui.level.textContent = `${this.profile.level}`;
    ui.xp.textContent = `${this.profile.xp}/${this.profile.nextLevel}`;
    ui.weapon.textContent = weapon.name;
    ui.companionship.textContent = `Companheiro: ${companion.name}`;
    ui.questStatus.textContent = `Andar ${this.profile.floor}/${MAX_FLOOR} • ${this.profile.region}`;
    ui.journalGoal.textContent = `Objetivo: ${this.profile.questText}`;
    ui.inventoryList.innerHTML = this.profile.inventory
      .map((item) => `<li><span>${item.name}</span><strong>x${item.amount}</strong></li>`)
      .join('');
    ui.runBest.textContent = `Recorde: andar ${this.profile.bestFloor}`;
    ui.floorProgress.style.width = `${this.profile.floor}%`;
  }
}
