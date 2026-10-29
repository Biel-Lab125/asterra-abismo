import Phaser from 'phaser';
import { WEAPON_OPTIONS, createInitialState } from './gameData.js';
import { getBossStats, getEnemyStats, getFloorConfig, getFloorEnemyCount, MAX_FLOOR } from './roguelike.js';
import { saveGame } from './saveSystem.js';

const WORLD = { width: 1900, height: 720, groundY: 620 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ui = new Proxy({}, { get: (_target, key) => window.asterraUI[key] });

function message(text) {
  ui.message.textContent = text;
}

function rounded(context, x, y, width, height, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function createHeroTexture(scene, key, female = false) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, 96, 108);
  const c = texture.context;
  c.imageSmoothingEnabled = false;
  const skin = female ? '#e5aa80' : '#c98762';
  const hair = female ? '#32243c' : '#38252b';
  const robe = female ? '#493448' : '#3a2932';
  const robeShade = female ? '#261e2d' : '#211b26';

  c.fillStyle = '#17131d';
  c.beginPath();
  c.moveTo(32, 73); c.lineTo(20, 99); c.lineTo(76, 99); c.lineTo(64, 73);
  c.closePath();
  c.fill();

  const cloak = c.createLinearGradient(22, 38, 76, 98);
  cloak.addColorStop(0, female ? '#74516a' : '#68444a');
  cloak.addColorStop(0.52, robe);
  cloak.addColorStop(1, robeShade);
  rounded(c, 21, 39, 54, 53, 19, cloak);
  rounded(c, 29, 48, 38, 42, 13, robe);
  c.fillStyle = '#ad815e';
  c.beginPath();
  c.moveTo(28, 57); c.lineTo(17, 81); c.lineTo(30, 75); c.fill();
  c.beginPath();
  c.moveTo(68, 57); c.lineTo(79, 81); c.lineTo(66, 75); c.fill();

  c.fillStyle = '#d5a45e';
  c.beginPath(); c.moveTo(27, 91); c.lineTo(69, 91); c.lineTo(76, 101); c.lineTo(20, 101); c.closePath(); c.fill();
  rounded(c, 23, 96, 20, 9, 3, '#4b3440');
  rounded(c, 54, 96, 20, 9, 3, '#4b3440');
  c.fillStyle = '#271f2b';
  c.beginPath(); c.arc(34, 100, 2, 0, Math.PI * 2); c.arc(66, 100, 2, 0, Math.PI * 2); c.fill();

  rounded(c, 38, 42, 20, 15, 6, skin);
  const face = c.createLinearGradient(31, 16, 68, 51);
  face.addColorStop(0, female ? '#f0c39b' : '#d99b72');
  face.addColorStop(0.58, skin);
  face.addColorStop(1, female ? '#bd795f' : '#995b4c');
  c.fillStyle = face;
  c.beginPath();
  c.moveTo(32, 18);
  c.quadraticCurveTo(48, 8, 64, 18);
  c.lineTo(66, 34);
  c.quadraticCurveTo(65, 47, 48, 53);
  c.quadraticCurveTo(31, 47, 30, 34);
  c.closePath();
  c.fill();
  c.fillStyle = female ? '#f0bd91' : '#d79a6f';
  c.beginPath();
  c.ellipse(30, 33, 4, 6, 0, 0, Math.PI * 2);
  c.ellipse(66, 33, 4, 6, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = female ? '#d38c7e' : '#ad6d62';
  c.beginPath();
  c.ellipse(31, 37, 3, 2, 0, 0, Math.PI * 2);
  c.ellipse(65, 37, 3, 2, 0, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = hair;
  c.beginPath();
  if (female) {
    c.moveTo(28, 20); c.quadraticCurveTo(27, 3, 47, 7); c.quadraticCurveTo(68, 4, 69, 24);
    c.lineTo(65, 53); c.lineTo(57, 48); c.lineTo(58, 24); c.lineTo(49, 18);
    c.lineTo(39, 25); c.lineTo(35, 48); c.lineTo(28, 53); c.closePath();
  } else {
    c.moveTo(28, 25); c.quadraticCurveTo(25, 6, 48, 7); c.quadraticCurveTo(68, 8, 68, 25);
    c.lineTo(58, 21); c.lineTo(51, 26); c.lineTo(44, 20); c.lineTo(36, 28); c.closePath();
  }
  c.fill();
  c.strokeStyle = female ? '#6d4240' : '#503235';
  c.lineWidth = female ? 2 : 3;
  c.beginPath();
  c.moveTo(35, 26); c.quadraticCurveTo(40, 23, 44, 26);
  c.moveTo(52, 26); c.quadraticCurveTo(57, 23, 61, 26);
  c.stroke();
  c.fillStyle = '#f3e7d0';
  c.beginPath();
  c.ellipse(40, 30, 2.1, 2.4, 0, 0, Math.PI * 2);
  c.ellipse(56, 30, 2.1, 2.4, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#34202a';
  c.beginPath();
  c.ellipse(40, 30, 1, 1.8, 0, 0, Math.PI * 2);
  c.ellipse(56, 30, 1, 1.8, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = female ? '#b9795e' : '#8b5546';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(48, 30); c.lineTo(45, 37); c.quadraticCurveTo(48, 39, 51, 37);
  c.stroke();
  c.strokeStyle = '#70403d';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(44, 44); c.quadraticCurveTo(48, 46, 52, 44);
  c.stroke();
  if (!female) {
    c.fillStyle = 'rgba(77, 43, 43, 0.34)';
    c.beginPath();
    c.moveTo(34, 39); c.quadraticCurveTo(36, 48, 48, 51);
    c.quadraticCurveTo(60, 48, 62, 39); c.lineTo(58, 45);
    c.lineTo(53, 47); c.lineTo(48, 45); c.lineTo(43, 47);
    c.lineTo(38, 45); c.closePath();
    c.fill();
    c.fillStyle = '#70433e';
    c.beginPath();
    c.moveTo(43, 43); c.quadraticCurveTo(48, 41, 53, 43);
    c.lineTo(51, 46); c.lineTo(45, 46); c.closePath();
    c.fill();
  }

  c.fillStyle = '#211b28';
  c.beginPath();
  c.moveTo(16, 27); c.quadraticCurveTo(18, 0, 48, 1); c.quadraticCurveTo(78, 0, 80, 27);
  c.lineTo(69, 21); c.lineTo(63, 26); c.lineTo(56, 19); c.lineTo(48, 25);
  c.lineTo(40, 19); c.lineTo(33, 26); c.lineTo(25, 21); c.closePath();
  c.fill();
  c.strokeStyle = female ? '#be8396' : '#bc7860';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(21, 21); c.quadraticCurveTo(47, -3, 75, 21);
  c.stroke();

  const mantle = c.createLinearGradient(31, 49, 65, 89);
  mantle.addColorStop(0, female ? '#806078' : '#79505a');
  mantle.addColorStop(1, robeShade);
  c.fillStyle = mantle;
  c.beginPath();
  c.moveTo(29, 48); c.lineTo(47, 57); c.lineTo(65, 48); c.lineTo(72, 87);
  c.lineTo(62, 94); c.lineTo(48, 85); c.lineTo(34, 94); c.lineTo(24, 87); c.closePath();
  c.fill();
  c.strokeStyle = '#d7a866';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(48, 59); c.lineTo(48, 87);
  c.moveTo(33, 82); c.lineTo(41, 86); c.moveTo(55, 86); c.lineTo(63, 82);
  c.stroke();
  c.fillStyle = '#f2cb79';
  c.beginPath();
  c.arc(48, 58, 5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#764956';
  c.beginPath();
  c.arc(48, 58, 2, 0, Math.PI * 2);
  c.fill();
  rounded(c, 24, 69, 14, 17, 4, '#71503f');
  rounded(c, 26, 71, 10, 12, 3, '#ad815e');
  c.strokeStyle = '#d7a866';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(30, 71); c.lineTo(30, 82);
  c.stroke();

  c.fillStyle = '#cfb18a';
  c.beginPath();
  c.moveTo(29, 47); c.lineTo(36, 52); c.lineTo(29, 59); c.lineTo(24, 54); c.closePath();
  c.moveTo(67, 47); c.lineTo(60, 52); c.lineTo(67, 59); c.lineTo(72, 54); c.closePath();
  c.fill();
  if (female) {
    c.fillStyle = '#f2cb79';
    c.beginPath(); c.arc(66, 33, 2, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#d6959d';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(64, 40); c.quadraticCurveTo(70, 47, 64, 54); c.stroke();
  } else {
    c.strokeStyle = '#7b3b39';
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(59, 36); c.lineTo(62, 39); c.stroke();
  }
  texture.refresh();
}

function drawRoomBackdrop(scene, theme, bossFloor) {
  const key = 'asterra-room-backdrop';
  const texture = scene.textures.exists(key)
    ? scene.textures.get(key)
    : scene.textures.createCanvas(key, WORLD.width, WORLD.height);
  const c = texture.context;
  const accent = Phaser.Display.Color.IntegerToColor(theme.accent).rgba;
  const glow = Phaser.Display.Color.IntegerToColor(theme.glow).rgba;
  const shift = scene.profile.floor % 7;

  c.clearRect(0, 0, WORLD.width, WORLD.height);
  const sky = c.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, '#090d19');
  sky.addColorStop(0.46, '#17182a');
  sky.addColorStop(0.76, '#241a29');
  sky.addColorStop(1, '#17131d');
  c.fillStyle = sky;
  c.fillRect(0, 0, WORLD.width, WORLD.height);

  const aura = c.createRadialGradient(1120, 170, 10, 1120, 170, 460);
  aura.addColorStop(0, bossFloor ? `${glow.slice(0, -2)}0.19)` : `${accent.slice(0, -2)}0.11)`);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = aura;
  c.fillRect(620, 0, 1000, 590);

  for (let i = 0; i < 145; i += 1) {
    const x = (i * 193 + shift * 71) % WORLD.width;
    const y = 28 + ((i * 83 + shift * 37) % 375);
    c.globalAlpha = i % 6 === 0 ? 0.82 : 0.36;
    c.fillStyle = i % 6 === 0 ? glow : '#c6c8d6';
    c.fillRect(x, y, i % 6 === 0 ? 3 : 2, i % 6 === 0 ? 3 : 2);
  }
  c.globalAlpha = 1;

  const moonGlow = c.createRadialGradient(1120, 170, 5, 1120, 170, bossFloor ? 180 : 130);
  moonGlow.addColorStop(0, bossFloor ? `${glow.slice(0, -2)}0.32)` : 'rgba(173,190,224,0.2)');
  moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = moonGlow;
  c.fillRect(900, 0, 440, 390);
  c.fillStyle = bossFloor ? glow : 'rgba(204,214,231,0.48)';
  c.beginPath();
  c.arc(1120, 170, bossFloor ? 54 : 38, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = bossFloor ? accent : 'rgba(229,219,199,0.38)';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(1120, 170, bossFloor ? 74 : 52, 0, Math.PI * 2);
  c.stroke();

  c.fillStyle = '#111321';
  c.beginPath();
  c.moveTo(0, WORLD.groundY);
  for (let x = 0; x <= WORLD.width; x += 95) {
    const y = 365 + Math.sin((x + shift * 80) / 210) * 55 + Math.cos(x / 83) * 20;
    c.lineTo(x, y);
  }
  c.lineTo(WORLD.width, WORLD.groundY);
  c.closePath();
  c.fill();

  for (let i = 0; i < 17; i += 1) {
    const x = i * 122 - 34;
    const width = 60 + (i % 3) * 16;
    const height = 118 + ((i * 47 + shift * 19) % 168);
    const top = WORLD.groundY - height;
    c.fillStyle = i % 2 === 0 ? '#171727' : '#1c1a2a';
    c.fillRect(x, top + 18, width, height - 18);
    c.beginPath();
    c.moveTo(x - 5, top + 22);
    c.lineTo(x + width / 2, top - 28);
    c.lineTo(x + width + 5, top + 22);
    c.closePath();
    c.fill();
    c.fillStyle = '#282337';
    c.fillRect(x - 7, top + 20, width + 14, 7);
    c.fillRect(x + 7, top + 52, 4, height - 58);
    c.fillRect(x + width - 11, top + 52, 4, height - 58);
    c.fillStyle = bossFloor ? `${glow.slice(0, -2)}0.62)` : `${accent.slice(0, -2)}0.45)`;
    c.beginPath();
    c.moveTo(x + width / 2, top + 48);
    c.quadraticCurveTo(x + width / 2 + 11, top + 61, x + width / 2, top + 76);
    c.quadraticCurveTo(x + width / 2 - 11, top + 61, x + width / 2, top + 48);
    c.fill();
  }

  for (let i = 0; i < 4; i += 1) {
    const mist = c.createLinearGradient(0, 440 + i * 32, WORLD.width, 440 + i * 32);
    mist.addColorStop(0, 'rgba(0,0,0,0)');
    mist.addColorStop(0.5, i % 2 === 0 ? `${accent.slice(0, -2)}0.08)` : `${glow.slice(0, -2)}0.06)`);
    mist.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = mist;
    c.fillRect(0, 440 + i * 32, WORLD.width, 20);
  }

  texture.refresh();
  return scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(0.38).setDepth(-20);
}

function createMonsterTexture(scene, key, kind, color, boss = false) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, boss ? 112 : 56, boss ? 112 : 56);
  const c = texture.context;
  c.imageSmoothingEnabled = false;
  const accent = Phaser.Display.Color.IntegerToColor(color).rgba;

  if (boss) {
    c.shadowColor = accent; c.shadowBlur = 24;
    c.fillStyle = '#17131d';
    c.beginPath();
    c.moveTo(28, 36); c.lineTo(17, 7); c.lineTo(43, 28); c.lineTo(56, 20);
    c.lineTo(69, 28); c.lineTo(95, 7); c.lineTo(84, 37);
    c.quadraticCurveTo(101, 57, 89, 84); c.lineTo(74, 94); c.lineTo(68, 109);
    c.lineTo(57, 99); c.lineTo(45, 109); c.lineTo(39, 94); c.lineTo(24, 84);
    c.quadraticCurveTo(12, 56, 28, 36); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = accent;
    c.beginPath();
    c.ellipse(56, 57, 30, 29, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#211722';
    c.beginPath();
    c.ellipse(56, 59, 25, 23, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffe4aa';
    c.beginPath();
    c.ellipse(44, 54, 4, 7, -0.3, 0, Math.PI * 2);
    c.ellipse(68, 54, 4, 7, 0.3, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#c76b78'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(45, 72); c.quadraticCurveTo(56, 78, 68, 71); c.stroke();
    c.fillStyle = '#5b3e5a';
    c.beginPath(); c.moveTo(18, 77); c.lineTo(2, 108); c.lineTo(39, 99); c.fill();
    c.beginPath(); c.moveTo(91, 77); c.lineTo(110, 108); c.lineTo(74, 99); c.fill();
  } else if (kind === 'shade') {
    c.shadowColor = accent; c.shadowBlur = 14;
    c.fillStyle = '#201a2a';
    c.beginPath();
    c.moveTo(28, 5); c.lineTo(13, 22); c.lineTo(10, 44); c.lineTo(22, 52);
    c.lineTo(28, 41); c.lineTo(34, 52); c.lineTo(48, 43); c.lineTo(42, 21); c.closePath(); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = accent;
    c.beginPath(); c.ellipse(28, 27, 11, 14, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff0bd';
    c.beginPath(); c.ellipse(23, 25, 2, 4, 0, 0, Math.PI * 2); c.ellipse(33, 25, 2, 4, 0, 0, Math.PI * 2); c.fill();
  } else if (kind === 'thorn') {
    c.fillStyle = '#39513e';
    c.beginPath(); c.moveTo(12, 51); c.lineTo(16, 26); c.lineTo(7, 13); c.lineTo(22, 19);
    c.lineTo(29, 3); c.lineTo(34, 20); c.lineTo(48, 10); c.lineTo(41, 28); c.lineTo(48, 51); c.closePath(); c.fill();
    c.fillStyle = accent;
    c.beginPath(); c.ellipse(29, 32, 14, 16, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff0c5';
    c.beginPath(); c.arc(24, 30, 2, 0, Math.PI * 2); c.arc(34, 30, 2, 0, Math.PI * 2); c.fill();
  } else {
    c.shadowColor = accent; c.shadowBlur = 12;
    rounded(c, 6, 15, 44, 31, 17, accent);
    c.shadowBlur = 0;
    rounded(c, 13, 7, 30, 13, 7, '#c9e8ca');
    c.fillStyle = '#f7f1cf';
    c.beginPath(); c.arc(21, 23, 4, 0, Math.PI * 2); c.arc(39, 23, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#172027';
    c.beginPath(); c.arc(21, 23, 1.8, 0, Math.PI * 2); c.arc(39, 23, 1.8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#527e78'; c.fillRect(10, 40, 7, 8); c.fillRect(39, 40, 7, 8);
  }
  texture.refresh();
}

export class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('AsterraScene');
  }

  init(data) {
    this.profile = { ...createInitialState(), ...data };
    this.profile.floor = clamp(Math.floor(this.profile.floor || 1), 1, MAX_FLOOR);
    this.profile.bestFloor = Math.max(this.profile.bestFloor || 1, this.profile.floor);
    this.playerFacing = 1;
    this.enemies = [];
    this.projectiles = [];
    this.floorVisuals = [];
    this.platforms = [];
    this.platformColliders = [];
    this.chests = [];
    this.floorCleared = false;
    this.runEnded = false;
    this.dashUntil = 0;
    this.lastAttackAt = 0;
    this.lastDamageAt = 0;
    this.lastHudAt = 0;
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.createTextures();
    this.createActors();
    this.createControls();
    this.createHud();
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09, -210, 0);
    this.enterFloor(this.profile.floor);
  }

  createTextures() {
    createHeroTexture(this, 'wanderer-male');
    createHeroTexture(this, 'wanderer-female', true);
  }

  createActors() {
    const texture = this.profile.character === 'female' ? 'wanderer-female' : 'wanderer-male';
    this.playerShadow = this.add.ellipse(150, WORLD.groundY - 5, 48, 15, 0x07070b, 0.48).setDepth(2);
    this.player = this.physics.add.sprite(150, WORLD.groundY - 58, texture).setScale(0.95).setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(27, 40).setOffset(34, 47);
    this.player.body.setMaxVelocity(500);
    this.player.body.setDragX(1300);
    this.player.body.setGravityY(1200);
  }

  createControls() {
    this.touchInput = { left: false, right: false };
    this.touchControlCleanups = [];
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      attack: Phaser.Input.Keyboard.KeyCodes.J,
      dash: Phaser.Input.Keyboard.KeyCodes.K,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      potion: Phaser.Input.Keyboard.KeyCodes.ONE,
      inventory: Phaser.Input.Keyboard.KeyCodes.I,
      journal: Phaser.Input.Keyboard.KeyCodes.TAB,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });
    document.querySelectorAll('[data-touch-control]').forEach((button) => {
      const control = button.dataset.touchControl;
      const press = (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        if (control === 'left' || control === 'right') {
          this.touchInput[control] = true;
          button.classList.add('pressed');
          return;
        }
        if (control === 'jump') this.jump();
        else if (control === 'attack') this.performAttack();
        else if (control === 'dash') this.dash();
        else if (control === 'interact') this.interact();
        button.classList.add('pressed');
      };
      const release = (event) => {
        event.preventDefault();
        if (control === 'left' || control === 'right') this.touchInput[control] = false;
        button.classList.remove('pressed');
      };
      button.addEventListener('pointerdown', press);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      button.addEventListener('pointerleave', release);
      this.touchControlCleanups.push(() => {
        button.removeEventListener('pointerdown', press);
        button.removeEventListener('pointerup', release);
        button.removeEventListener('pointercancel', release);
        button.removeEventListener('lostpointercapture', release);
        button.removeEventListener('pointerleave', release);
      });
    });
    this.input.keyboard.on('keydown-E', () => this.interact());
    this.input.keyboard.on('keydown-SPACE', () => this.jump());
    this.input.keyboard.on('keydown-J', () => this.performAttack());
    this.input.keyboard.on('keydown-K', () => this.dash());
    this.input.keyboard.on('keydown-ONE', () => this.usePotion());
    this.input.keyboard.on('keydown-I', () => this.togglePanel(ui.inventory));
    this.input.keyboard.on('keydown-TAB', (event) => {
      event.preventDefault();
      this.togglePanel(ui.journal);
    });
    this.input.keyboard.on('keydown-ESC', () => {
      ui.inventory.classList.add('hidden');
      ui.journal.classList.add('hidden');
    });
    this.input.mouse.disableContextMenu();
    this.input.on('pointerdown', (pointer) => {
      const screen = this.cameras.main.getScreenPoint(this.player.x, this.player.y);
      this.playerFacing = pointer.x < screen.x ? -1 : 1;
      if (pointer.leftButtonDown()) this.performAttack();
      else if (pointer.rightButtonDown()) this.dash();
    });
    this.handleDescend = () => this.descend();
    ui.descendButton.addEventListener('click', this.handleDescend);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      ui.descendButton.removeEventListener('click', this.handleDescend);
      this.touchControlCleanups.forEach((cleanup) => cleanup());
    });
  }

  togglePanel(panel) {
    panel.classList.toggle('hidden');
  }

  createHud() {
    this.floorLabel = this.add.text(1225, 88, '', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f5d894',
      stroke: '#17121d', strokeThickness: 5, align: 'right'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);
    this.bossLabel = this.add.text(640, 144, '', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#ffd0bb',
      stroke: '#17121d', strokeThickness: 5
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);
    this.bossHealth = this.add.graphics().setScrollFactor(0).setDepth(30);
    this.hintLabel = this.add.text(640, 685, '', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '15px',
      color: '#eadfc7', stroke: '#101015', strokeThickness: 4
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(30);
  }

  enterFloor(floor, announce = true) {
    this.clearFloor();
    this.floor = getFloorConfig(floor);
    this.profile.floor = floor;
    this.profile.bestFloor = Math.max(this.profile.bestFloor, floor);
    this.profile.region = this.floor.region;
    this.profile.questText = this.floor.bossFloor
      ? `Derrote ${this.floor.bossName} no andar ${floor}.`
      : `Limpe o andar ${floor} e alcance a saída.`;
    this.floorCleared = false;
    this.exitActive = false;
    this.drawRoom();
    this.spawnFloorEnemies();
    this.player.setPosition(150, WORLD.groundY - 58);
    this.player.body.setVelocity(0, 0);
    this.player.setFlipX(false);
    this.playerFacing = 1;
    this.floorLabel.setText(`ANDAR ${floor} / ${MAX_FLOOR}   •   ${this.floor.region.toUpperCase()}`);
    this.bossLabel.setText(this.floor.bossFloor ? `GUARDIÃO • ${this.floor.bossName}` : '');
    ui.descendButton.classList.add('hidden');
    ui.descendButton.disabled = true;
    if (announce) {
      message(this.floor.bossFloor
        ? `O portão se abre: ${this.floor.bossName} protege o andar ${floor}.`
        : `Andar ${floor}: derrote as criaturas para liberar a passagem.`);
      this.showFloorTitle();
    } else {
      message(`Andar ${floor}: ${this.floor.region}.`);
    }
    this.updateHud();
    saveGame(this.profile);
  }

  clearFloor() {
    this.floorVisuals.forEach((object) => object.destroy());
    this.floorVisuals = [];
    this.enemies.forEach((enemy) => {
      if (Array.isArray(enemy.collider)) enemy.collider.forEach((collider) => collider.destroy());
      else enemy.collider?.destroy();
      enemy.bar?.destroy();
      enemy.nameText?.destroy();
      enemy.sprite.destroy();
    });
    this.enemies = [];
    this.platformColliders.forEach((collider) => collider.destroy());
    this.platformColliders = [];
    this.platforms.forEach((platform) => platform.destroy());
    this.platforms = [];
    this.projectiles.forEach((projectile) => projectile.sprite.destroy());
    this.projectiles = [];
    this.chests.forEach((chest) => chest.sprite.destroy());
    this.chests = [];
    this.bossEntity = null;
    if (this.portal) this.portal.destroy();
  }

  drawRoom() {
    const { theme, bossFloor } = this.floor;
    this.floorVisuals.push(drawRoomBackdrop(this, theme, bossFloor));

    if (bossFloor) {
      const arena = this.add.graphics().setDepth(-10);
      arena.fillStyle(theme.glow, 0.05).fillEllipse(1120, WORLD.groundY - 18, 760, 420);
      arena.lineStyle(3, theme.accent, 0.27).strokeEllipse(1120, WORLD.groundY - 5, 610, 190);
      arena.lineStyle(1, theme.glow, 0.28).strokeEllipse(1120, WORLD.groundY - 5, 470, 140);
      this.floorVisuals.push(arena);
    }

    const ground = this.makePlatform(0, WORLD.groundY, WORLD.width, 100, theme, true);
    this.platforms.push(ground);
    const ledges = [
      [300, 480, 260], [685, 415, 245], [1050, 490, 265], [1435, 425, 270]
    ];
    ledges.forEach(([x, y, width], index) => {
      if (bossFloor && index === 1) return;
      this.platforms.push(this.makePlatform(x, y, width, 30, theme, false));
    });

    this.createExit(theme);
    if (floorNumber(this.profile.floor) === 1) this.createBokuto(theme);
    else this.bokuto = null;
    if (this.profile.floor % 3 === 0 || bossFloor) this.createChest(theme);

    const foreground = this.add.graphics().setDepth(10000);
    foreground.fillStyle(0x080910, 0.82).fillRect(0, WORLD.groundY + 2, WORLD.width, 98);
    foreground.fillStyle(theme.glow, 0.55).fillRect(0, WORLD.groundY + 2, WORLD.width, 2);
    this.floorVisuals.push(foreground);
  }

  makePlatform(x, y, width, height, theme, ground) {
    const platform = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x16151d, 0.98).setDepth(4);
    this.physics.add.existing(platform, true);
    platform.body.setSize(width, height);
    const ledge = this.add.graphics().setDepth(5);
    ledge.fillStyle(ground ? theme.tile : 0x403548, 1).fillRoundedRect(x, y, width, height, ground ? 1 : 7);
    ledge.fillStyle(theme.accent, 0.85).fillRoundedRect(x, y, width, 5, 2);
    ledge.fillStyle(theme.glow, 0.34).fillRect(x + 8, y + 7, Math.max(10, width - 16), 1);
    for (let i = 0; i < Math.floor(width / 52); i += 1) {
      ledge.fillStyle(theme.accent, 0.16).fillRect(x + i * 52 + 6, y + 12, 26, 2);
    }
    this.floorVisuals.push(ledge);
    this.platformColliders.push(this.physics.add.collider(this.player, platform));
    return platform;
  }

  createExit(theme) {
    this.portal = this.add.container(WORLD.width - 115, WORLD.groundY - 57).setDepth(7);
    const outer = this.add.ellipse(0, 0, 88, 124, theme.glow, 0.08);
    outer.setStrokeStyle(3, theme.accent, 0.6);
    const inner = this.add.ellipse(0, 0, 54, 88, theme.glow, 0.26);
    inner.setStrokeStyle(2, theme.glow, 0.85);
    const core = this.add.ellipse(0, 0, 28, 62, 0xf6e6c6, 0.4);
    this.portal.add([outer, inner, core]);
    this.tweens.add({ targets: [outer, inner], scaleY: 1.13, duration: 950, yoyo: true, repeat: -1 });
    this.portal.setAlpha(0.35);
    const label = this.add.text(WORLD.width - 115, WORLD.groundY - 128, 'DESCIDA', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#f5d994', stroke: '#15121b', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);
    this.floorVisuals.push(this.portal, label);
  }

  createBokuto(theme) {
    const npc = this.add.image(270, WORLD.groundY - 46, 'wanderer-male').setScale(0.75).setTint(0x8ce1d2).setDepth(WORLD.groundY);
    const label = this.add.text(270, WORLD.groundY - 95, 'BOKUTO  •  E', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#c4f7e8', stroke: '#11131a', strokeThickness: 4
    }).setOrigin(0.5).setDepth(30);
    this.floorVisuals.push(npc, label);
    this.bokuto = { x: 270, y: WORLD.groundY - 46, theme };
  }

  createChest(theme) {
    const chest = this.add.container(1270, WORLD.groundY - 24).setDepth(WORLD.groundY - 20);
    const shadow = this.add.ellipse(0, 16, 58, 16, 0x06060a, 0.44);
    const box = this.add.rectangle(0, 0, 44, 30, 0x744638).setStrokeStyle(3, theme.glow, 0.9);
    const top = this.add.rectangle(0, -17, 48, 13, theme.glow).setStrokeStyle(2, 0x483443, 1);
    const latch = this.add.rectangle(0, -1, 7, 14, 0xffe6a1);
    chest.add([shadow, box, top, latch]);
    const label = this.add.text(0, -47, 'BAÚ', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#f1d89c' }).setOrigin(0.5);
    chest.add(label);
    this.chests.push({ sprite: chest, opened: false });
  }

  spawnFloorEnemies() {
    const count = getFloorEnemyCount(this.profile.floor);
    if (this.floor.bossFloor) {
      this.spawnBoss();
      return;
    }
    const stats = getEnemyStats(this.profile.floor);
    const eliteStats = getEnemyStats(this.profile.floor, true);
    const spots = [
      [510, WORLD.groundY - 38], [775, 390], [980, WORLD.groundY - 38],
      [1160, WORLD.groundY - 38], [1510, 400], [1640, WORLD.groundY - 38],
      [410, 455], [1360, WORLD.groundY - 38]
    ];
    for (let i = 0; i < count; i += 1) {
      const [x, y] = spots[i];
      const elite = this.profile.floor > 8 && i === count - 1 && this.profile.floor % 4 === 0;
      const kind = elite ? 'shade' : ['slime', 'shade', 'thorn'][(this.profile.floor + i) % 3];
      this.spawnEnemy(x, y, kind, elite ? eliteStats : stats, elite);
    }
  }

  spawnEnemy(x, y, kind, stats, elite) {
    const key = `platform-${kind}-${this.floor.zoneIndex}-${elite ? 'elite' : 'regular'}`;
    createMonsterTexture(this, key, kind, elite ? this.floor.theme.glow : this.floor.theme.accent);
    const sprite = this.physics.add.sprite(x, y, key).setScale(elite ? 1.18 : 1.02).setDepth(y);
    sprite.body.setSize(30, 33).setOffset(13, 20);
    sprite.body.setGravityY(1200);
    sprite.body.setMaxVelocity(250);
    sprite.setCollideWorldBounds(true);
    const enemy = {
      sprite,
      kind,
      name: elite ? 'Elite corrompido' : kind === 'slime' ? 'Slime de Asterra' : kind === 'shade' ? 'Vulto' : 'Espinheiro vivo',
      hp: stats.health + (elite ? 18 : 0),
      maxHp: stats.health + (elite ? 18 : 0),
      damage: stats.damage,
      speed: stats.speed,
      xp: stats.xp,
      elite,
      direction: -1,
      nextAttack: this.time.now + 800,
      attackCooldown: 1350,
      bar: this.add.graphics().setDepth(30)
    };
    enemy.collider = this.platforms.map((platform) => this.physics.add.collider(sprite, platform));
    this.enemies.push(enemy);
  }

  spawnBoss() {
    const stats = getBossStats(this.profile.floor);
    const key = `platform-boss-${this.profile.floor}`;
    createMonsterTexture(this, key, 'boss', this.floor.theme.accent, true);
    const sprite = this.physics.add.sprite(1450, WORLD.groundY - 85, key).setScale(1.12).setDepth(WORLD.groundY);
    sprite.body.setSize(65, 75).setOffset(24, 31);
    sprite.body.setGravityY(1200);
    sprite.body.setMaxVelocity(260);
    sprite.setCollideWorldBounds(true);
    const boss = {
      sprite, name: this.floor.bossName, hp: stats.health, maxHp: stats.health,
      damage: stats.damage, speed: stats.speed, xp: stats.xp, boss: true,
      phase: 1, nextAttack: this.time.now + 1800, attackCooldown: 2100,
      telegraphing: false, direction: -1
    };
    boss.collider = this.platforms.map((platform) => this.physics.add.collider(sprite, platform));
    boss.nameText = this.add.text(sprite.x, sprite.y - 100, boss.name, {
      fontFamily: 'Georgia, serif', fontSize: '17px', color: '#ffddc3', stroke: '#17111a', strokeThickness: 5
    }).setOrigin(0.5).setDepth(1000);
    boss.bar = this.add.graphics().setScrollFactor(0).setDepth(30);
    this.bossEntity = boss;
    this.enemies.push(boss);
    this.paintBossHealth(boss);
  }

  paintBossHealth(boss) {
    const ratio = clamp(boss.hp / boss.maxHp, 0, 1);
    boss.bar.clear();
    boss.bar.fillStyle(0x100d17, 0.9).fillRoundedRect(470, 168, 340, 16, 7);
    boss.bar.fillStyle(ratio < 0.3 ? 0xe94e67 : 0xb64970, 1).fillRoundedRect(473, 171, 334 * ratio, 10, 5);
    boss.bar.lineStyle(1, 0xf4c0a3, 0.7).strokeRoundedRect(470, 168, 340, 16, 7);
    boss.nameText.setPosition(boss.sprite.x, boss.sprite.y - 100);
  }

  showFloorTitle() {
    const camera = this.cameras.main;
    const title = this.add.text(camera.width / 2, camera.height * 0.42, `ANDAR ${this.profile.floor}`, {
      fontFamily: 'Georgia, serif', fontSize: '48px', color: this.floor.bossFloor ? '#ffb68f' : '#f3d996',
      stroke: '#100e17', strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setScrollFactor(0).setDepth(40);
    const subtitle = this.add.text(camera.width / 2, camera.height * 0.42 + 48,
      this.floor.bossFloor ? this.floor.bossName : this.floor.region, {
        fontFamily: 'Georgia, serif', fontSize: '18px', color: '#e8d8c2', stroke: '#100e17', strokeThickness: 5
      }).setOrigin(0.5).setAlpha(0).setScrollFactor(0).setDepth(40);
    this.tweens.add({
      targets: [title, subtitle], alpha: 1, duration: 400, yoyo: true, hold: 650,
      onComplete: () => { title.destroy(); subtitle.destroy(); }
    });
  }

  update(time, delta) {
    if (!this.player || this.runEnded) return;
    const goLeft = this.keys.left.isDown || this.keys.leftArrow.isDown || this.touchInput.left;
    const goRight = this.keys.right.isDown || this.keys.rightArrow.isDown || this.touchInput.right;
    const running = this.keys.shift?.isDown && this.profile.energy > 0;
    if (time < this.dashUntil) {
      this.profile.energy = Math.max(0, this.profile.energy - delta * 0.015);
    } else if (goLeft !== goRight) {
      const direction = goLeft ? -1 : 1;
      this.playerFacing = direction;
      this.player.setFlipX(direction < 0);
      this.player.body.setVelocityX(direction * (running ? 255 : 205));
      if (running) this.profile.energy = Math.max(0, this.profile.energy - delta * 0.012);
    } else {
      this.player.body.setVelocityX(0);
      this.profile.energy = Math.min(100, this.profile.energy + delta * 0.014);
    }
    this.playerShadow.setPosition(this.player.x, WORLD.groundY - 5).setDepth(2);
    this.updateEnemies(time);
    this.updateProjectiles(delta);
    this.updateHints();
    if (time - this.lastHudAt > 200) {
      this.lastHudAt = time;
      this.updateHud();
    }
    if (time - (this.lastSaveAt || 0) > 4000) {
      this.lastSaveAt = time;
      saveGame(this.profile);
    }
  }

  jump() {
    if (!this.player.body.blocked.down && !this.player.body.touching.down) return;
    this.player.body.setVelocityY(-760);
    this.player.setScale(0.96, 1.08);
    this.tweens.add({ targets: this.player, scaleX: 1.02, scaleY: 1.02, duration: 180 });
  }

  dash() {
    if (this.profile.energy < 25 || this.runEnded) {
      message('Energia insuficiente para esquivar.');
      return;
    }
    this.profile.energy -= 25;
    this.dashUntil = this.time.now + 280;
    this.player.body.setVelocity(this.playerFacing * 470, 0);
    this.player.body.setVelocityY(Math.min(this.player.body.velocity.y, 30));
    this.player.setAlpha(0.65);
    this.time.delayedCall(280, () => { if (this.player.active) this.player.setAlpha(1); });
  }

  updateEnemies(time) {
    this.enemies = this.enemies.filter((enemy) => enemy.sprite.active);
    for (const enemy of this.enemies) {
      const dx = this.player.x - enemy.sprite.x;
      const distance = Math.abs(dx);
      if (distance < (enemy.boss ? 680 : 350)) {
        enemy.direction = dx < 0 ? -1 : 1;
        if (enemy.sprite.body.blocked.down || enemy.sprite.body.touching.down) {
          enemy.sprite.body.setVelocityX(enemy.direction * enemy.speed);
        }
      } else {
        enemy.sprite.body.setVelocityX(Math.sin(time / 650) * 10);
      }
      enemy.sprite.setFlipX(enemy.direction < 0);
      if (enemy.boss) {
        enemy.nameText.setPosition(enemy.sprite.x, enemy.sprite.y - 100);
        this.paintBossHealth(enemy);
        if (enemy.hp <= enemy.maxHp * 0.45 && enemy.phase === 1) {
          enemy.phase = 2;
          enemy.speed *= 1.35;
          enemy.attackCooldown = 1250;
          message(`${enemy.name} entra em fúria! Salte sobre a onda de energia.`);
          this.tweens.add({ targets: enemy.sprite, tint: 0xff526d, duration: 170, yoyo: true, repeat: 2 });
        }
        if (!enemy.telegraphing && time > enemy.nextAttack && distance < 620) this.bossAttack(enemy);
      } else if (distance < 45 && time > enemy.nextAttack) {
        this.damagePlayer(enemy.damage, enemy.name);
        enemy.nextAttack = time + enemy.attackCooldown;
      }

      const ratio = clamp(enemy.hp / enemy.maxHp, 0, 1);
      if (!enemy.boss) {
        enemy.bar.clear();
        enemy.bar.fillStyle(0x17121c, 0.85).fillRoundedRect(enemy.sprite.x - 19, enemy.sprite.y - 41, 38, 5, 2);
        enemy.bar.fillStyle(enemy.elite ? 0xe39c5e : 0xa8d68b, 0.95).fillRoundedRect(enemy.sprite.x - 18, enemy.sprite.y - 40, 36 * ratio, 3, 1);
      }
    }

    if (!this.enemies.length && !this.floorCleared) this.clearEnemies();
  }

  bossAttack(boss) {
    boss.telegraphing = true;
    const span = boss.phase === 2 ? 310 : 230;
    const marker = this.add.rectangle(this.player.x, WORLD.groundY - 25, span, 52, 0xf05a78, 0.25).setDepth(8);
    marker.setStrokeStyle(3, 0xffb7c1, 0.88);
    this.tweens.add({ targets: marker, alpha: 0.6, duration: 180, yoyo: true, repeat: 2 });
    message(`${boss.name} prepara uma onda! Salte ou use K para esquivar.`);
    this.time.delayedCall(720, () => {
      if (!marker.active || !boss.sprite.active) {
        marker.destroy();
        return;
      }
      const wasAirborne = !this.player.body.blocked.down && !this.player.body.touching.down;
      const distance = Math.abs(this.player.x - marker.x);
      if (distance < span / 2 && !wasAirborne && this.time.now > this.dashUntil) {
        this.damagePlayer(boss.damage, boss.name);
      } else {
        message('Esquiva perfeita! A onda passou por baixo.');
      }
      const wave = this.add.ellipse(marker.x, WORLD.groundY - 17, span, 34, 0xff8595, 0.4).setDepth(9);
      this.tweens.add({ targets: wave, alpha: 0, scaleX: 1.4, duration: 300, onComplete: () => wave.destroy() });
      marker.destroy();
      boss.telegraphing = false;
      boss.nextAttack = this.time.now + boss.attackCooldown;
    });
  }

  damagePlayer(amount, attacker) {
    if (this.time.now < this.lastDamageAt || this.time.now < this.dashUntil || this.runEnded) return;
    this.lastDamageAt = this.time.now + 520;
    const damage = Math.max(3, Math.round(amount - this.profile.defense * 0.55));
    this.profile.health = Math.max(0, this.profile.health - damage);
    this.tweens.add({ targets: this.player, alpha: 0.32, duration: 75, yoyo: true, repeat: 3 });
    message(`${attacker} atingiu você por ${damage}. Salte ou esquive com K.`);
    if (this.profile.health <= 0) this.endRun();
    this.updateHud();
  }

  performAttack() {
    if (this.runEnded || this.time.now - this.lastAttackAt < 360) return;
    this.lastAttackAt = this.time.now;
    const weapon = WEAPON_OPTIONS.find((entry) => entry.id === this.profile.weapon) || WEAPON_OPTIONS[0];
    const damage = Math.round(weapon.damage + this.profile.level * 2.6);
    if (this.profile.weapon === 'bow') {
      const arrow = this.add.rectangle(this.player.x + this.playerFacing * 28, this.player.y + 3, 20, 4, 0xa9e6ff)
        .setDepth(this.player.y + 2);
      arrow.rotation = this.playerFacing < 0 ? Math.PI : 0;
      this.projectiles.push({ sprite: arrow, x: arrow.x, y: arrow.y, vx: this.playerFacing * 620, vy: 0, damage, life: 1.2 });
      message('Flecha disparada.');
      return;
    }
    const reach = this.profile.weapon === 'spear' ? 100 : 67;
    const endX = this.player.x + this.playerFacing * reach;
    const endY = this.player.y + 2;
    const slash = this.add.graphics().setDepth(this.player.y + 3);
    slash.lineStyle(this.profile.weapon === 'spear' ? 8 : 11, this.profile.weapon === 'spear' ? 0xd7e9bc : 0xffd18c, 0.95);
    slash.lineBetween(this.player.x + this.playerFacing * 15, this.player.y, endX, endY);
    slash.lineStyle(3, 0xffffff, 0.8).strokeCircle(endX, endY, 12);
    this.tweens.add({ targets: slash, alpha: 0, duration: 150, onComplete: () => slash.destroy() });
    let hit = false;
    [...this.enemies].forEach((enemy) => {
      const dx = enemy.sprite.x - this.player.x;
      const dy = Math.abs(enemy.sprite.y - this.player.y);
      if (dx * this.playerFacing > 0 && Math.abs(dx) < reach + (enemy.boss ? 45 : 25) && dy < (enemy.boss ? 115 : 60)) {
        hit = true;
        this.damageEnemy(enemy, damage);
      }
    });
    message(hit ? `${weapon.name}: golpe certeiro!` : `${weapon.name}: golpe no vazio.`);
  }

  updateProjectiles(delta) {
    const seconds = delta / 1000;
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.x += projectile.vx * seconds;
      projectile.life -= seconds;
      projectile.sprite.setPosition(projectile.x, projectile.y);
      const target = this.enemies.find((enemy) => enemy.sprite.active &&
        Math.abs(projectile.x - enemy.sprite.x) < (enemy.boss ? 62 : 34) &&
        Math.abs(projectile.y - enemy.sprite.y) < (enemy.boss ? 105 : 60));
      if (target) {
        this.damageEnemy(target, projectile.damage);
        projectile.sprite.destroy();
        return false;
      }
      if (projectile.life <= 0 || projectile.x < 0 || projectile.x > WORLD.width) {
        projectile.sprite.destroy();
        return false;
      }
      return true;
    });
  }

  damageEnemy(enemy, damage) {
    if (!enemy.sprite.active) return;
    enemy.hp -= damage;
    enemy.sprite.setTintFill(0xffffff);
    this.time.delayedCall(90, () => { if (enemy.sprite.active) enemy.sprite.clearTint(); });
    if (enemy.boss) this.paintBossHealth(enemy);
    if (enemy.hp > 0) return;

    if (Array.isArray(enemy.collider)) enemy.collider.forEach((collider) => collider.destroy());
    else enemy.collider?.destroy();
    enemy.sprite.destroy();
    enemy.bar?.destroy();
    enemy.nameText?.destroy();
    if (enemy.boss) {
      enemy.bar.destroy();
      this.bossEntity = null;
      this.profile.xp += enemy.xp;
      this.profile.gold += 80 + this.profile.floor * 2;
      this.profile.defeatedBosses = [...new Set([...(this.profile.defeatedBosses || []), this.profile.floor])];
      this.profile.maxHealth += 5;
      this.profile.health = this.profile.maxHealth;
      message(`${enemy.name} derrotado! Recompensa rara. Desça pelo portal brilhante.`);
    } else {
      this.profile.slimeKills += 1;
      this.profile.gold += enemy.elite ? 18 : 7;
      this.profile.xp += enemy.xp;
      if (Math.random() < 0.14) this.addPotion();
      message(`${enemy.name} derrotado • +${enemy.xp} XP`);
    }
    this.levelUpIfNeeded();
  }

  levelUpIfNeeded() {
    while (this.profile.xp >= this.profile.nextLevel && this.profile.level < 100) {
      this.profile.xp -= this.profile.nextLevel;
      this.profile.level += 1;
      this.profile.nextLevel = Math.round(this.profile.nextLevel * 1.28);
      this.profile.maxHealth += 9;
      this.profile.health = this.profile.maxHealth;
      this.profile.defense += 0.7;
      message(`Nível ${this.profile.level}! Vida restaurada e defesa aumentada.`);
    }
    this.updateHud();
  }

  usePotion() {
    const potion = this.profile.inventory.find((item) => item.id === 'potion');
    if (!potion || potion.amount <= 0) return message('Você não tem poções.');
    if (this.profile.health >= this.profile.maxHealth) return message('Sua vida já está cheia.');
    this.profile.health = Math.min(this.profile.maxHealth, this.profile.health + 45);
    this.profile.inventory = this.profile.inventory.map((item) =>
      item.id === 'potion' ? { ...item, amount: item.amount - 1 } : item
    );
    message('Poção usada • +45 de vida.');
    this.updateHud();
  }

  updateHints() {
    const nearChest = this.chests.find((chest) => !chest.opened &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.sprite.x, chest.sprite.y) < 90);
    const nearBokuto = this.bokuto && this.profile.floor === 1 &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bokuto.x, this.bokuto.y) < 100;
    const nearPortal = this.floorCleared && Math.abs(this.player.x - (WORLD.width - 115)) < 110;
    if (nearChest) this.hintLabel.setText('E  •  Abrir baú');
    else if (nearBokuto) this.hintLabel.setText('E  •  Falar com Bokuto');
    else if (nearPortal) this.hintLabel.setText('E  •  Descer para o próximo andar');
    else if (this.floorCleared) this.hintLabel.setText('Andar limpo — use o botão DEScer para avançar');
    else this.hintLabel.setText('A/D ou ←/→ mover   •   Espaço saltar   •   J/clique atacar');
    if (this.portal && this.floorCleared) this.portal.setAlpha(0.82 + Math.sin(this.time.now / 220) * 0.15);
  }

  interact() {
    if (this.runEnded) return;
    const chest = this.chests.find((entry) => !entry.opened &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y) < 90);
    if (chest) {
      chest.opened = true;
      this.profile.gold += this.profile.floor % 10 === 0 ? 90 : 25 + this.profile.floor;
      this.profile.inventory = this.profile.inventory.map((item) =>
        item.id === 'potion' ? { ...item, amount: item.amount + 1 } : item
      );
      chest.sprite.setAlpha(0.35);
      message('Baú aberto • moedas e uma poção de cura.');
      this.updateHud();
      return;
    }
    if (this.bokuto && this.profile.floor === 1 &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bokuto.x, this.bokuto.y) < 100) {
      message('Bokuto: “Cada dez andares, um guardião. Salte, golpeie e mantenha viva a chama.”');
      return;
    }
    if (this.floorCleared && Math.abs(this.player.x - (WORLD.width - 115)) < 110) this.descend();
    else if (!this.floorCleared) message('Derrote todos os inimigos para liberar a saída.');
  }

  clearEnemies() {
    this.floorCleared = true;
    this.profile.questText = `Andar ${this.profile.floor} limpo; desça para continuar.`;
    this.portal.setAlpha(1);
    this.portal.setScale(1.15);
    this.tweens.add({ targets: this.portal, scale: 1, duration: 350 });
    if (this.profile.floor % 10 === 0) {
      this.profile.health = this.profile.maxHealth;
      if (this.profile.floor === MAX_FLOOR) this.showVictory();
    } else {
      message('Andar limpo! O portal abriu — aperte E perto dele ou clique em DESCER.');
    }
    ui.descendButton.disabled = this.profile.floor >= MAX_FLOOR;
    ui.descendButton.classList.toggle('hidden', this.profile.floor >= MAX_FLOOR);
    ui.descendButton.classList.toggle('ready', this.profile.floor < MAX_FLOOR);
    this.updateHud();
    saveGame(this.profile);
  }

  descend() {
    if (this.runEnded || !this.floorCleared || this.profile.floor >= MAX_FLOOR) return;
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
    message('Vitória! O legado do grande herói foi restaurado.');
    saveGame(this.profile);
  }

  updateHud() {
    const weapon = WEAPON_OPTIONS.find((entry) => entry.id === this.profile.weapon) || WEAPON_OPTIONS[0];
    ui.health.textContent = `${Math.ceil(this.profile.health)}/${this.profile.maxHealth}`;
    ui.energy.textContent = `${Math.ceil(this.profile.energy)}`;
    ui.level.textContent = `${this.profile.level}`;
    ui.xp.textContent = `${this.profile.xp}/${this.profile.nextLevel}`;
    ui.weapon.textContent = weapon.name;
    ui.questStatus.textContent = `Andar ${this.profile.floor}/${MAX_FLOOR} • ${this.profile.region}`;
    ui.journalGoal.textContent = `Objetivo: ${this.profile.questText}`;
    ui.inventoryList.innerHTML = this.profile.inventory
      .map((item) => `<li><span>${item.name}</span><strong>x${item.amount}</strong></li>`)
      .join('');
    ui.runBest.textContent = `Recorde: andar ${this.profile.bestFloor}`;
    ui.floor.textContent = `${this.profile.floor} / ${MAX_FLOOR}`;
    ui.floorProgress.style.width = `${this.profile.floor}%`;
    ui.descendButton.disabled = !this.floorCleared;
    ui.descendButton.classList.toggle('hidden', !this.floorCleared);
  }
}

function floorNumber(value) {
  return Number(value) || 1;
}
