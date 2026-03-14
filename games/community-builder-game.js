/* ═══════════════════════════════════════════════════════════
   Community Builder – Phaser 3 Game
   Crabcake Kids · crabcake.kids
   ═══════════════════════════════════════════════════════════ */

// ── CONSTANTS ──────────────────────────────────────────────
const GW = 1200, GH = 700;
const ROAD_Y = 560;          // top of road
const SIDEWALK_Y = ROAD_Y - 16;
const WALK_Y = SIDEWALK_Y - 30; // character feet

const CHARACTERS = [
  'firefighter','doctor','police','chef','farmer',
  'teacher','librarian','construction','mailcarrier','busdriver'
];

const CHAR_DISPLAY = {
  firefighter:   { name: 'Firefighter Frankie',  emoji: '🚒' },
  doctor:        { name: 'Doctor Dana',           emoji: '🏥' },
  police:        { name: 'Officer Oakley',        emoji: '🚔' },
  chef:          { name: 'Chef Charlie',          emoji: '🍕' },
  farmer:        { name: 'Farmer Fern',           emoji: '🌽' },
  teacher:       { name: 'Teacher Tayo',          emoji: '📚' },
  librarian:     { name: 'Librarian Lily',        emoji: '📖' },
  construction:  { name: 'Builder Blake',         emoji: '🏗️' },
  mailcarrier:   { name: 'Mail Carrier Mo',       emoji: '📬' },
  busdriver:     { name: 'Bus Driver Bella',      emoji: '🚌' },
};

// Building slot positions (x, groundY for bottom of building)
const BUILDING_SLOTS = {
  busdriver:    { x: 70,   buildKey: 'gas_station',          scale: .38 },
  firefighter:  { x: 210,  buildKey: 'fire_station',         scale: .42 },
  police:       { x: 370,  buildKey: 'building_medium_gray',  scale: .38 },
  doctor:       { x: 530,  buildKey: 'hospital',             scale: .35 },
  mailcarrier:  { x: 680,  buildKey: 'building_medium_orange',scale: .38 },
  librarian:    { x: 830,  buildKey: 'building_large_teal',  scale: .30 },
  farmer:       { x: 960,  buildKey: 'mini_mart',            scale: .38 },
  chef:         { x: 1080, buildKey: 'pizzeria',             scale: .42 },
  teacher:      { x: 1170, buildKey: 'coffee_shop',          scale: .42 },
};

// Vehicles parked near their building
const VEHICLE_MAP = {
  doctor:      'ambulance',
  police:      'police_car',
  busdriver:   'taxi',
  mailcarrier: 'van_white',
  chef:        'van_black',
  firefighter: 'car_red',
  teacher:     'car_blue',
};

// Construction props with placement positions
const CONSTRUCTION_PROPS = [
  { key: 'sign_stop',           x: 150,  scale: .5  },
  { key: 'sign_warning',        x: 310,  scale: .45 },
  { key: 'sign_construction_1', x: 460,  scale: .45 },
  { key: 'light_pole_1',        x: 600,  scale: .35 },
  { key: 'fence_wood',          x: 740,  scale: .5  },
  { key: 'water_hydrant',       x: 880,  scale: .5  },
  { key: 'sign_st_name',        x: 1020, scale: .45 },
  { key: 'light_pole_2',        x: 1130, scale: .35 },
];

// ── GAME STATE ────────────────────────────────────────────
let gameState = {
  band: null,        // 'band_1', 'band_2', 'band_3'
  bandNum: 1,
  questions: [],     // loaded from JSON
  questionQueue: [], // shuffled queue for current session
  currentQ: null,
  currentCharacter: null,
  score: 0,
  totalAnswered: 0,
  correctCount: 0,
  charProgress: {},  // { firefighter: { correct: 0, unlocked: false }, ... }
  constructionIndex: 0, // which prop to place next
  unlockedCount: 0,
  phaserGame: null,
  townScene: null,
  dragMode: false,   // true for bands 2-3
};

// ── DOM HELPERS ────────────────────────────────────────────
const $ = id => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  if (id) $(id).classList.remove('hidden');
}

function selectAge(age) {
  document.querySelectorAll('.age-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.age-btn[data-age="${age}"]`).classList.add('selected');

  const bandMap = { 5: ['band_1', 1], 7: ['band_2', 2], 9: ['band_3', 3] };
  const [bandId, bandNum] = bandMap[age];
  gameState.band = bandId;
  gameState.bandNum = bandNum;
  gameState.dragMode = bandNum >= 2;

  const labels = {
    band_1: ['band1', '🧒 Kindergarten', 'Ontario Kindergarten Program'],
    band_2: ['band2', '📗 Grades 1–2', 'Ontario Social Studies'],
    band_3: ['band3', '📘 Grades 3–4', 'Ontario Social Studies'],
  };
  const [cls, label, src] = labels[bandId];
  $('bandDisplay').innerHTML =
    `<div class="band-pill ${cls}">${label}</div>
     <div class="band-source-note">${src}</div>`;

  const btn = $('startBtn');
  btn.disabled = false;
  btn.classList.add('active');
}

// ── START GAME ────────────────────────────────────────────
async function startGame() {
  showScreen(null);
  $('loadingScreen').classList.remove('hidden');

  // Load question data
  try {
    const resp = await fetch('/data/community-builder-questions.json?v=1');
    const data = await resp.json();
    gameState.questions = data.question_sets;
  } catch (e) {
    console.error('Failed to load questions:', e);
    $('loadText').textContent = 'Error loading questions. Please refresh.';
    return;
  }

  // Filter questions for selected band
  const bandQuestions = gameState.questions.filter(s => s.band_id === gameState.band);
  // Build queue: shuffle questions within each set, then interleave characters
  const byChar = {};
  bandQuestions.forEach(set => {
    if (!byChar[set.character]) byChar[set.character] = [];
    const qs = [...set.questions];
    shuffleArray(qs);
    byChar[set.character].push(...qs.map(q => ({ ...q, character: set.character })));
  });

  // Init character progress
  CHARACTERS.forEach(c => {
    gameState.charProgress[c] = { correct: 0, unlocked: false, total: (byChar[c]||[]).length };
  });

  // Round-robin interleave so characters take turns
  const queue = [];
  let remaining = true;
  let idx = 0;
  while (remaining) {
    remaining = false;
    for (const c of CHARACTERS) {
      if (byChar[c] && byChar[c][idx]) {
        queue.push(byChar[c][idx]);
        remaining = true;
      }
    }
    idx++;
  }
  gameState.questionQueue = queue;

  // Boot Phaser
  initPhaser();
}

// ── PHASER INIT ───────────────────────────────────────────
function initPhaser() {
  const config = {
    type: Phaser.AUTO,
    width: GW,
    height: GH,
    parent: 'gameContainer',
    backgroundColor: '#87CEEB',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, TownScene],
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    input: { activePointers: 2 },
    render: { pixelArt: false, antialias: true },
  };
  gameState.phaserGame = new Phaser.Game(config);
}

// ── BOOT SCENE ────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // Nothing to preload in boot — we use DOM loading bar
  }
  create() { this.scene.start('Preload'); }
}

// ── PRELOAD SCENE ─────────────────────────────────────────
class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload() {
    const base = '/assets/community-builder';

    // Progress via DOM
    this.load.on('progress', v => {
      const pct = Math.round(v * 100);
      $('loadBar').style.width = pct + '%';
      $('loadText').textContent = `Loading assets… ${pct}%`;
    });

    // ── Character sprites ──
    CHARACTERS.forEach(c => {
      this.load.spritesheet(`${c}-idle`, `${base}/sprites/idle/${c}-idle.png`,
        { frameWidth: 128, frameHeight: 128 });
      this.load.spritesheet(`${c}-walk`, `${base}/sprites/walk/${c}-walk.png`,
        { frameWidth: 128, frameHeight: 128 });
      this.load.image(`${c}-static`, `${base}/sprites/static/${c}.png`);
    });

    // ── Buildings ──
    const buildings = [
      'hospital','fire_station','building_medium_gray','building_medium_orange',
      'building_large_teal','mini_mart','pizzeria','coffee_shop','gas_station',
      'bank','house_small_red','house_medium_blue','house_small_yellow',
    ];
    buildings.forEach(b => {
      this.load.image(`bld-${b}`, `${base}/town/Buildings/${b}.png`);
    });

    // ── Vehicles ──
    const vehicles = ['ambulance','police_car','taxi','van_white','van_black','car_red','car_blue'];
    vehicles.forEach(v => {
      this.load.image(`veh-${v}`, `${base}/town/Vehicles/${v}.png`);
    });

    // ── Props ──
    const props = [
      'sign_stop','sign_warning','sign_construction_1','sign_st_name',
      'light_pole_1','light_pole_2','fence_wood','water_hydrant',
      'sidewalk','ground_street_01','road_brick_green',
    ];
    props.forEach(p => {
      this.load.image(`prop-${p}`, `${base}/town/Props/${p}.png`);
    });

    // ── Vegetation ──
    const veg = ['tree_01','tree_02','tree_03','bush_01','bush_02'];
    veg.forEach(v => {
      this.load.image(`veg-${v}`, `${base}/town/Vegetation/${v}.png`);
    });

    // ── Clouds ──
    for (let i = 1; i <= 6; i++) {
      this.load.image(`cloud-${i}`, `${base}/town/Props/cloud_0${i}.png`);
    }

    // ── Background ──
    this.load.image('bg-green', `${base}/town/Background Shades/green.png`);
  }

  create() {
    // Create all character animations
    CHARACTERS.forEach(c => {
      this.anims.create({
        key: `${c}-idle-anim`,
        frames: this.anims.generateFrameNumbers(`${c}-idle`, { start: 0, end: 8 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: `${c}-walk-anim`,
        frames: this.anims.generateFrameNumbers(`${c}-walk`, { start: 0, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });
    });

    // Hide loading, show game
    $('loadingScreen').classList.add('hidden');
    $('gameContainer').classList.add('active');
    $('hud').classList.add('active');

    this.scene.start('Town');
  }
}

// ── TOWN SCENE ────────────────────────────────────────────
class TownScene extends Phaser.Scene {
  constructor() { super('Town'); }

  create() {
    gameState.townScene = this;
    this.buildingSprites = {};
    this.vehicleSprites = {};
    this.characterSprites = {};
    this.propSprites = {};
    this.walkers = [];

    this.drawTown();
    this.cameras.main.setBounds(0, 0, GW, GH);

    // Start first question after a brief delay
    this.time.delayedCall(800, () => nextQuestion());
  }

  drawTown() {
    // ── Sky gradient (drawn via graphics) ──
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xd4f0ff, 0xd4f0ff, 1);
    sky.fillRect(0, 0, GW, GH);

    // ── Clouds ──
    this.clouds = [];
    const cloudYs = [40, 80, 30, 100, 60, 50];
    for (let i = 1; i <= 6; i++) {
      const cl = this.add.image(Math.random() * GW, cloudYs[i-1], `cloud-${i}`)
        .setScale(0.35 + Math.random() * 0.2)
        .setAlpha(0.5 + Math.random() * 0.3);
      cl._speed = 8 + Math.random() * 15;
      this.clouds.push(cl);
    }

    // ── Background buildings (decorative) ──
    const bgBuildings = ['house_small_red','house_medium_blue','house_small_yellow'];
    const bgX = [130, 500, 900];
    bgBuildings.forEach((b, i) => {
      if (this.textures.exists(`bld-${b}`)) {
        this.add.image(bgX[i], ROAD_Y - 100, `bld-${b}`)
          .setScale(0.22).setAlpha(0.3).setTint(0xccccdd);
      }
    });

    // ── Ground / Road ──
    const groundGfx = this.add.graphics();
    // Grass
    groundGfx.fillStyle(0x7ec850, 1);
    groundGfx.fillRect(0, ROAD_Y - 20, GW, GH - ROAD_Y + 20);
    // Road
    groundGfx.fillStyle(0x555555, 1);
    groundGfx.fillRect(0, ROAD_Y, GW, 60);
    // Road lines
    groundGfx.fillStyle(0xffdd44, 1);
    for (let x = 0; x < GW; x += 60) {
      groundGfx.fillRect(x, ROAD_Y + 28, 30, 4);
    }
    // Sidewalk
    groundGfx.fillStyle(0xccbbaa, 1);
    groundGfx.fillRect(0, ROAD_Y - 20, GW, 20);

    // ── Vegetation along road ──
    const treePositions = [30, 275, 430, 620, 780, 1000, 1150];
    treePositions.forEach((tx, i) => {
      const tKey = i % 2 === 0 ? 'veg-tree_01' : 'veg-tree_02';
      if (this.textures.exists(tKey)) {
        this.add.image(tx, ROAD_Y - 80, tKey).setScale(0.3).setOrigin(0.5, 1);
      }
    });
    const bushPositions = [100, 350, 560, 850, 1060];
    bushPositions.forEach(bx => {
      if (this.textures.exists('veg-bush_01')) {
        this.add.image(bx, ROAD_Y - 20, 'veg-bush_01').setScale(0.35).setOrigin(0.5, 1);
      }
    });

    // ── Building placeholder ghosts ──
    Object.entries(BUILDING_SLOTS).forEach(([charKey, slot]) => {
      const ghostGfx = this.add.graphics();
      ghostGfx.lineStyle(2, 0xffffff, 0.15);
      ghostGfx.strokeRoundedRect(slot.x - 50, ROAD_Y - 180, 100, 140, 8);
      ghostGfx.fillStyle(0xffffff, 0.04);
      ghostGfx.fillRoundedRect(slot.x - 50, ROAD_Y - 180, 100, 140, 8);
      this.buildingSprites[charKey] = { ghost: ghostGfx, sprite: null };
    });

    // Construction prop placeholders
    CONSTRUCTION_PROPS.forEach((p, i) => {
      const g = this.add.graphics();
      g.lineStyle(1, 0xffffff, 0.1);
      g.strokeCircle(p.x, ROAD_Y - 30, 12);
      this.propSprites[i] = { ghost: g, sprite: null };
    });
  }

  update(time, delta) {
    // Animate clouds
    if (this.clouds) {
      this.clouds.forEach(cl => {
        cl.x += cl._speed * (delta / 1000);
        if (cl.x > GW + 120) cl.x = -120;
      });
    }

    // Move walkers
    this.walkers.forEach(w => {
      w.sprite.x += w.dir * w.speed * (delta / 1000);
      // Flip based on direction
      w.sprite.setFlipX(w.dir < 0);
      // Bounce at boundaries
      if (w.sprite.x > w.maxX) { w.dir = -1; }
      if (w.sprite.x < w.minX) { w.dir = 1; }
    });
  }

  // ── Place a building with animation ──
  placeBuilding(charKey, animated = true) {
    const slot = BUILDING_SLOTS[charKey];
    if (!slot || !this.textures.exists(`bld-${slot.buildKey}`)) return;

    // Remove ghost
    if (this.buildingSprites[charKey]?.ghost) {
      this.buildingSprites[charKey].ghost.destroy();
    }

    const bld = this.add.image(slot.x, ROAD_Y - 20, `bld-${slot.buildKey}`)
      .setScale(slot.scale)
      .setOrigin(0.5, 1);

    if (animated) {
      bld.y = -200;
      bld.setAlpha(0.8);
      this.tweens.add({
        targets: bld,
        y: ROAD_Y - 20,
        alpha: 1,
        duration: 600,
        ease: 'Bounce.easeOut',
        onComplete: () => {
          // Small squash & stretch
          this.tweens.add({ targets: bld, scaleX: slot.scale * 1.05, scaleY: slot.scale * 0.95, yoyo: true, duration: 150 });
        }
      });
    }

    this.buildingSprites[charKey].sprite = bld;

    // Place associated vehicle
    if (VEHICLE_MAP[charKey]) {
      this.time.delayedCall(animated ? 800 : 0, () => this.placeVehicle(charKey));
    }
  }

  placeVehicle(charKey) {
    const vKey = VEHICLE_MAP[charKey];
    if (!vKey || !this.textures.exists(`veh-${vKey}`)) return;

    const slot = BUILDING_SLOTS[charKey];
    if (!slot) return;

    const veh = this.add.image(slot.x + 30, ROAD_Y + 30, `veh-${vKey}`)
      .setScale(0.28)
      .setAlpha(0);

    this.tweens.add({
      targets: veh,
      alpha: 1,
      x: slot.x + 10,
      duration: 400,
      ease: 'Power2',
    });

    this.vehicleSprites[charKey] = veh;
  }

  // ── Place construction prop ──
  placeProp(index, animated = true) {
    if (index >= CONSTRUCTION_PROPS.length) return;
    const p = CONSTRUCTION_PROPS[index];
    const propKey = `prop-${p.key}`;
    if (!this.textures.exists(propKey)) return;

    // Remove ghost
    if (this.propSprites[index]?.ghost) {
      this.propSprites[index].ghost.destroy();
    }

    const spr = this.add.image(p.x, ROAD_Y - 20, propKey)
      .setScale(p.scale)
      .setOrigin(0.5, 1);

    if (animated) {
      spr.setAlpha(0).setScale(0);
      this.tweens.add({
        targets: spr,
        alpha: 1,
        scaleX: p.scale,
        scaleY: p.scale,
        duration: 400,
        ease: 'Back.easeOut',
      });
    }

    this.propSprites[index].sprite = spr;
  }

  // ── Spawn walking character ──
  spawnWalker(charKey) {
    const slot = BUILDING_SLOTS[charKey] || { x: GW / 2 };
    const startX = slot.x;
    const spr = this.add.sprite(startX, WALK_Y, `${charKey}-walk`)
      .setScale(0.55)
      .setOrigin(0.5, 1);
    spr.play(`${charKey}-walk-anim`);

    const walker = {
      sprite: spr,
      speed: 30 + Math.random() * 25,
      dir: Math.random() > 0.5 ? 1 : -1,
      minX: Math.max(40, startX - 150),
      maxX: Math.min(GW - 40, startX + 150),
    };
    this.walkers.push(walker);
    this.characterSprites[charKey] = spr;
  }

  // ── Show character intro (idle animation in front) ──
  showCharacterIntro(charKey, callback) {
    const cx = GW / 2;
    const cy = ROAD_Y - 80;
    const spr = this.add.sprite(-80, cy, `${charKey}-idle`)
      .setScale(0.9)
      .setOrigin(0.5, 1)
      .setDepth(50);
    spr.play(`${charKey}-idle-anim`);

    // Slide in
    this.tweens.add({
      targets: spr,
      x: cx,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(300, () => {
          // Slide out
          this.tweens.add({
            targets: spr,
            x: GW + 80,
            duration: 400,
            ease: 'Power2',
            onComplete: () => { spr.destroy(); if (callback) callback(); }
          });
        });
      }
    });
  }

  // ── Drag-and-drop building (bands 2-3) ──
  initDragBuilding(charKey) {
    const slot = BUILDING_SLOTS[charKey];
    if (!slot) return;

    // Show drop zone
    const dropZone = this.add.graphics().setDepth(45);
    dropZone.lineStyle(3, 0xFFD93D, 0.6);
    dropZone.strokeRoundedRect(slot.x - 55, ROAD_Y - 185, 110, 150, 10);
    this.tweens.add({
      targets: dropZone,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 600,
    });

    // Create draggable building at top of screen
    const bldKey = `bld-${slot.buildKey}`;
    if (!this.textures.exists(bldKey)) {
      this.placeBuilding(charKey, true);
      dropZone.destroy();
      return;
    }

    const dragBld = this.add.image(GW / 2, 80, bldKey)
      .setScale(slot.scale * 0.8)
      .setInteractive({ draggable: true })
      .setDepth(60);

    // Glow effect
    this.tweens.add({
      targets: dragBld,
      scaleX: slot.scale * 0.85,
      scaleY: slot.scale * 0.85,
      yoyo: true,
      repeat: -1,
      duration: 500,
    });

    // Drag label
    const label = this.add.text(GW / 2, 30, '👆 Drag to the glowing spot!', {
      fontFamily: 'Nunito', fontSize: '16px', fontStyle: 'bold',
      color: '#FFD93D', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(61);

    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      obj.x = dragX;
      obj.y = dragY;
    });

    this.input.on('dragend', (pointer, obj) => {
      const dist = Phaser.Math.Distance.Between(obj.x, obj.y, slot.x, ROAD_Y - 110);
      if (dist < 80) {
        // Snap into place!
        obj.disableInteractive();
        obj.destroy();
        label.destroy();
        dropZone.destroy();
        this.placeBuilding(charKey, true);
      } else {
        // Bounce back
        this.tweens.add({
          targets: obj,
          x: GW / 2, y: 80,
          duration: 300,
          ease: 'Power2',
        });
      }
    });
  }
}

// ── QUESTION SYSTEM (DOM) ─────────────────────────────────
function nextQuestion() {
  if (gameState.questionQueue.length === 0) {
    finishGame();
    return;
  }

  // Check if all characters unlocked
  const allUnlocked = Object.values(gameState.charProgress).every(p => p.unlocked);
  if (allUnlocked) {
    finishGame();
    return;
  }

  // Skip questions for already-unlocked characters (unless queue is small)
  let q = null;
  while (gameState.questionQueue.length > 0) {
    const candidate = gameState.questionQueue.shift();
    const prog = gameState.charProgress[candidate.character];
    if (!prog.unlocked) {
      q = candidate;
      break;
    }
  }
  if (!q) { finishGame(); return; }

  gameState.currentQ = q;
  gameState.currentCharacter = q.character;

  // Show character intro in Phaser
  const scene = gameState.townScene;
  if (scene) {
    scene.showCharacterIntro(q.character, () => showQuestion(q));
  } else {
    showQuestion(q);
  }
}

function showQuestion(q) {
  const charInfo = CHAR_DISPLAY[q.character] || { name: q.character, emoji: '❓' };

  // Set character portrait
  const img = $('qCharImg');
  img.src = `/assets/community-builder/sprites/static/${q.character}.png`;
  img.alt = charInfo.name;

  $('qCharName').textContent = `${charInfo.emoji} ${charInfo.name}`;
  $('qText').textContent = q.question;
  $('hintText').classList.remove('visible');
  $('hintText').textContent = q.hint || '';

  const grid = $('optionsGrid');
  grid.innerHTML = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(i, q, btn);
    grid.appendChild(btn);
  });

  $('questionOverlay').classList.add('active');
}

function handleAnswer(chosen, q, btn) {
  // Disable all buttons
  const buttons = $('optionsGrid').querySelectorAll('.option-btn');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  gameState.totalAnswered++;
  const isCorrect = chosen === q.correct;

  if (isCorrect) {
    btn.classList.add('correct');
    gameState.correctCount++;
    gameState.score += 10;

    // Update character progress
    const prog = gameState.charProgress[q.character];
    prog.correct++;

    updateHUD();

    // Check if character unlocked
    const threshold = 3; // need 3 correct to unlock
    if (prog.correct >= threshold && !prog.unlocked) {
      prog.unlocked = true;
      gameState.unlockedCount++;

      setTimeout(() => {
        $('questionOverlay').classList.remove('active');
        unlockCharacter(q.character);
      }, 600);
    } else {
      setTimeout(() => {
        $('questionOverlay').classList.remove('active');
        setTimeout(() => nextQuestion(), 400);
      }, 800);
    }
  } else {
    btn.classList.add('wrong');
    // Show hint
    $('hintText').classList.add('visible');
    // Highlight correct answer
    setTimeout(() => {
      buttons[q.correct].classList.add('correct');
    }, 400);
    // Move on after delay
    setTimeout(() => {
      $('questionOverlay').classList.remove('active');
      setTimeout(() => nextQuestion(), 400);
    }, 2000);
  }
}

function unlockCharacter(charKey) {
  const scene = gameState.townScene;
  const charInfo = CHAR_DISPLAY[charKey] || { name: charKey, emoji: '🎉' };

  if (charKey === 'construction') {
    // Place the next construction prop
    const idx = gameState.constructionIndex;
    if (scene && idx < CONSTRUCTION_PROPS.length) {
      scene.placeProp(idx, true);
      gameState.constructionIndex++;
      // Place a couple extra props for visual impact
      setTimeout(() => {
        if (gameState.constructionIndex < CONSTRUCTION_PROPS.length) {
          scene.placeProp(gameState.constructionIndex, true);
          gameState.constructionIndex++;
        }
      }, 300);
    }

    showCelebration(
      '🏗️',
      'New Infrastructure!',
      `${charInfo.name} added signs and lights to the town!`
    );
  } else {
    // Place building (auto or drag)
    if (gameState.dragMode && scene) {
      // Show celebration first, then drag
      showCelebration(
        charInfo.emoji,
        `${charInfo.name}`,
        `Drag the building to its spot in town!`,
        () => {
          scene.initDragBuilding(charKey);
          // Spawn walker after a delay
          setTimeout(() => scene.spawnWalker(charKey), 2000);
        }
      );
    } else {
      // Auto-place for band 1
      if (scene) {
        scene.placeBuilding(charKey, true);
        setTimeout(() => scene.spawnWalker(charKey), 1000);
      }
      showCelebration(
        charInfo.emoji,
        'New Building!',
        `${charInfo.name} has joined the town!`
      );
    }
  }

  // Milestone check
  if (gameState.unlockedCount === 5) {
    // Bonus: place the bank at midpoint
    setTimeout(() => {
      if (scene && scene.textures.exists('bld-bank')) {
        const bankImg = scene.add.image(GW / 2, ROAD_Y - 20, 'bld-bank')
          .setScale(0.3).setOrigin(0.5, 1);
        bankImg.y = -200;
        scene.tweens.add({ targets: bankImg, y: ROAD_Y - 20, duration: 800, ease: 'Bounce.easeOut' });
      }
    }, 1500);
  }

  updateHUD();
}

// ── CELEBRATION ───────────────────────────────────────────
let celebCallback = null;
function showCelebration(emoji, title, text, callback) {
  celebCallback = callback || null;
  $('celebEmoji').textContent = emoji;
  $('celebTitle').textContent = title;
  $('celebText').textContent = text;
  $('celebration').classList.add('active');

  // Confetti-like particle burst (DOM-based for simplicity)
  spawnConfetti();
}

function closeCelebration() {
  $('celebration').classList.remove('active');
  if (celebCallback) {
    celebCallback();
    celebCallback = null;
    // For drag mode, don't auto-advance — wait for drop
    return;
  }
  setTimeout(() => nextQuestion(), 500);
}

function spawnConfetti() {
  const colors = ['#FFD93D','#FF5C5C','#4ECB71','#A66CFF','#4A90D9','#FF9040'];
  const container = $('celebration');
  for (let i = 0; i < 30; i++) {
    const div = document.createElement('div');
    div.style.cssText = `
      position:absolute;width:10px;height:10px;border-radius:${Math.random()>.5?'50%':'2px'};
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${Math.random()*100}%;top:-10px;opacity:1;pointer-events:none;z-index:41;
    `;
    const dur = 1 + Math.random() * 1.5;
    div.style.animation = `confettiFall ${dur}s ease-out forwards`;
    div.style.animationDelay = `${Math.random()*.5}s`;
    container.appendChild(div);
    setTimeout(() => div.remove(), (dur + 0.5) * 1000);
  }
}

// Add confetti keyframes
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
  @keyframes confettiFall {
    0% { transform: translateY(0) rotate(0deg); opacity:1; }
    100% { transform: translateY(70vh) rotate(${360 + Math.random()*360}deg); opacity:0; }
  }
`;
document.head.appendChild(confettiStyle);

// ── HUD ───────────────────────────────────────────────────
function updateHUD() {
  $('scoreDisplay').textContent = gameState.score;
  $('progressDisplay').textContent = `${gameState.unlockedCount}/10`;
}

function goHome() {
  if (confirm('Leave the game? Your progress will be lost.')) {
    window.location.href = '/';
  }
}

// ── FINISH ────────────────────────────────────────────────
function finishGame() {
  $('questionOverlay').classList.remove('active');
  $('hud').classList.remove('active');

  const acc = gameState.totalAnswered > 0
    ? Math.round((gameState.correctCount / gameState.totalAnswered) * 100)
    : 0;

  $('finishScore').textContent = `⭐ Score: ${gameState.score}`;
  $('finishAccuracy').textContent = `🎯 Accuracy: ${acc}% (${gameState.correctCount}/${gameState.totalAnswered})`;

  // Fun town name
  const adjectives = ['Amazing','Wonderful','Friendly','Happy','Sunny','Cozy','Busy','Peaceful'];
  const nouns = ['Town','Village','Neighbourhood','Community','Haven','Place'];
  const adj = adjectives[Math.floor(Math.random()*adjectives.length)];
  const noun = nouns[Math.floor(Math.random()*nouns.length)];
  $('finishTownName').textContent = `${adj} ${noun}`;

  setTimeout(() => showScreen('finishScreen'), 1000);
}

// ── UTILITY ───────────────────────────────────────────────
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── INIT DOM ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showScreen('startScreen');
});
