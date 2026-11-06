/* ==========================================================================
   CHROMA CRITTERS - MAIN GAME CONTROLLER
   State machine, game loops, level management, Endless Rush, Achievements & HUD
   ========================================================================== */

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Logical dimensions
    this.width = 1200;
    this.height = 800;

    // Game States: 'MENU', 'LEVEL_SELECT', 'ADVENTURE', 'ENDLESS', 'SANCTUARY'
    this.state = 'MENU';

    // Game progress & data
    this.currentLevelIndex = 0;
    this.score = 0;
    this.combo = 1;
    this.chimesHitThisShot = 0;
    this.shotsFired = 0;
    this.activeSnack = null;
    this.availableAmmo = ['red'];
    this.selectedAmmoIndex = 0;

    // Adventure stage objects
    this.critters = [];
    this.chimes = [];
    this.chromaRings = [];
    this.bouncers = [];
    this.gravityBubbles = [];
    this.levelQuota = {};
    this.levelFedProgress = {};

    // Endless Mode state
    this.endlessCritters = [];
    this.endlessSpawnTimer = 0;
    this.endlessHighScore = parseInt(localStorage.getItem('chroma_endless_high') || '0', 10);
    this.frenzyMeter = 0;
    this.isFrenzyActive = false;
    this.frenzyTimer = 0;

    // Sanctuary instance
    this.sanctuary = new SanctuaryMode(this.canvas, this.ctx);

    // Slingshot instance
    this.slingshot = new Slingshot(this.width / 2, this.height - 90);

    // Achievements state
    this.achievements = this.loadAchievements();

    // High Scores & Unlocked Levels
    this.unlockedLevels = parseInt(localStorage.getItem('chroma_unlocked_level') || '1', 10);
    this.levelStars = JSON.parse(localStorage.getItem('chroma_level_stars') || '{}');

    // Setup Canvas, Listeners, and UI
    this.setupCanvas();
    this.setupEventListeners();
    this.renderLevelSelectGrid();
    this.renderAchievementsGrid();
    this.updateHUD();

    // Start main game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // Responsive canvas sizing
  setupCanvas() {
    const resize = () => {
      const container = document.getElementById('canvas-container');
      const rect = container.getBoundingClientRect();

      // High DPI display support
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);

      this.scaleX = (rect.width * dpr) / this.width;
      this.scaleY = (rect.height * dpr) / this.height;

      this.slingshot.setAnchor(this.width / 2, this.height - 85);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    resize();
  }

  // Pointer & Input Event Listeners
  setupEventListeners() {
    const getPointerPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    // Pointer Down
    const onPointerDown = (e) => {
      window.sound.init(); // Auto-start audio context on first click
      const pos = getPointerPos(e);

      if (this.state === 'SANCTUARY') {
        this.sanctuary.handlePointerDown(pos.x, pos.y);
      } else if (this.state === 'ADVENTURE' || this.state === 'ENDLESS') {
        if (!this.activeSnack) {
          this.slingshot.startDrag(pos.x, pos.y);
        }
      }
    };

    // Pointer Move
    const onPointerMove = (e) => {
      const pos = getPointerPos(e);

      if (this.state === 'SANCTUARY') {
        this.sanctuary.handlePointerMove(pos.x, pos.y);
      } else if (this.state === 'ADVENTURE' || this.state === 'ENDLESS') {
        if (this.slingshot.isDragging) {
          this.slingshot.updateDrag(pos.x, pos.y);
        }
      }
    };

    // Pointer Up
    const onPointerUp = () => {
      if (this.state === 'SANCTUARY') {
        this.sanctuary.handlePointerUp();
      } else if (this.state === 'ADVENTURE' || this.state === 'ENDLESS') {
        if (this.slingshot.isDragging && !this.activeSnack) {
          const firedSnack = this.slingshot.release();
          if (firedSnack) {
            this.activeSnack = firedSnack;
            this.shotsFired++;
            this.chimesHitThisShot = 0;
          }
        }
      }
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointerDown(e); }, { passive: false });
    window.addEventListener('touchmove', (e) => { onPointerMove(e); }, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggleMute();
      } else if (e.key === 'Escape') {
        this.showScreen('MENU');
      } else if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < this.availableAmmo.length) {
          this.selectAmmo(idx);
        }
      }
    });
  }

  // ==========================================
  // STATE & SCREEN TRANSITIONS
  // ==========================================
  showScreen(targetState) {
    this.state = targetState;
    window.sound.playClick();

    // Close all modals
    document.querySelectorAll('.screen-modal').forEach(m => m.classList.remove('active'));

    const menuHud = document.getElementById('in-game-hud');

    if (targetState === 'MENU') {
      document.getElementById('modal-main-menu').classList.add('active');
      menuHud.style.display = 'none';
      window.sound.stopBGM();
    } else if (targetState === 'LEVEL_SELECT') {
      this.renderLevelSelectGrid();
      document.getElementById('modal-level-select').classList.add('active');
      menuHud.style.display = 'none';
    } else if (targetState === 'SANCTUARY') {
      document.getElementById('modal-sanctuary').classList.add('active');
      menuHud.style.display = 'none';
      window.sound.startBGM();
    } else if (targetState === 'ACHIEVEMENTS') {
      this.renderAchievementsGrid();
      document.getElementById('modal-achievements').classList.add('active');
      menuHud.style.display = 'none';
    } else if (targetState === 'HOW_TO_PLAY') {
      document.getElementById('modal-how-to-play').classList.add('active');
      menuHud.style.display = 'none';
    } else if (targetState === 'SETTINGS') {
      document.getElementById('modal-settings').classList.add('active');
      menuHud.style.display = 'none';
    } else if (targetState === 'ADVENTURE' || targetState === 'ENDLESS') {
      menuHud.style.display = 'flex';
      window.sound.startBGM();
    }
  }

  // ==========================================
  // ADVENTURE MODE INITIALIZATION
  // ==========================================
  startAdventureLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    const level = GAME_LEVELS[levelIndex];
    if (!level) return;

    this.score = 0;
    this.combo = 1;
    this.shotsFired = 0;
    this.activeSnack = null;
    this.levelQuota = { ...level.quota };
    this.levelFedProgress = {};

    // Available Ammo
    this.availableAmmo = [...level.availableAmmo];
    this.selectAmmo(0);
    this.renderAmmoTray();

    // Build Critters
    this.critters = level.critters.map(c => {
      const crit = new Critter(c.type, c.x * this.width, c.y * this.height, c.radius);
      crit.setDesiredFood(c.desire);
      return crit;
    });

    // Build Stage Elements
    this.chimes = (level.chimes || []).map(ch =>
      new XylophoneChime(ch.x * this.width, ch.y * this.height, 26, ch.note, ch.label)
    );

    this.chromaRings = (level.chromaRings || []).map(cr =>
      new ChromaRing(cr.x * this.width, cr.y * this.height, cr.radius, cr.filterColor)
    );

    this.bouncers = (level.bouncers || []).map(b =>
      new JellyBouncer(b.x * this.width, b.y * this.height, b.width, b.height)
    );

    this.gravityBubbles = (level.gravityBubbles || []).map(gb =>
      new GravityBubble(gb.x * this.width, gb.y * this.height, gb.radius)
    );

    this.showScreen('ADVENTURE');
    this.updateHUD();

    // Show level banner hint
    window.particles.popupText(`LEVEL ${level.id}: ${level.title}!`, this.width / 2, this.height * 0.42, '#ffd166', 1.3);
  }

  // ==========================================
  // ENDLESS SNACK RUSH MODE
  // ==========================================
  startEndlessRush() {
    this.score = 0;
    this.combo = 1;
    this.activeSnack = null;
    this.shotsFired = 0;
    this.availableAmmo = ['red', 'yellow', 'blue'];
    this.selectAmmo(0);
    this.renderAmmoTray();

    this.chimes = [
      new XylophoneChime(this.width * 0.35, this.height * 0.45, 26, 0, 'C'),
      new XylophoneChime(this.width * 0.65, this.height * 0.45, 26, 3, 'G')
    ];

    this.chromaRings = [
      new ChromaRing(this.width * 0.5, this.height * 0.48, 45, 'yellow')
    ];

    this.bouncers = [
      new JellyBouncer(this.width * 0.5, this.height * 0.68, 90, 32)
    ];

    this.gravityBubbles = [];

    // Spawn initial 3 critters
    this.endlessCritters = [];
    this.spawnEndlessCritter(0.25, 0.25);
    this.spawnEndlessCritter(0.5, 0.2);
    this.spawnEndlessCritter(0.75, 0.25);

    this.showScreen('ENDLESS');
    this.updateHUD();
    window.particles.popupText('🔥 ENDLESS SNACK RUSH! GO! 🔥', this.width / 2, this.height * 0.42, '#ff007f', 1.4);
  }

  spawnEndlessCritter(normX, normY) {
    const keys = ['bloop', 'puff', 'zippy', 'gromp'];
    const foods = ['red', 'yellow', 'blue', 'orange', 'green'];
    const chosenKey = keys[Math.floor(Math.random() * keys.length)];
    const chosenFood = foods[Math.floor(Math.random() * foods.length)];

    const critter = new Critter(chosenKey, normX * this.width, normY * this.height, 50);
    critter.setDesiredFood(chosenFood);
    critter.hungerSpeed = 0.045; // Timed hunger meter

    this.endlessCritters.push(critter);
  }

  // Select ammo slot
  selectAmmo(index) {
    if (index >= 0 && index < this.availableAmmo.length) {
      this.selectedAmmoIndex = index;
      const chosenColor = this.availableAmmo[index];
      this.slingshot.activeSnackType = chosenColor;
      this.updateAmmoUI();
      window.sound.playClick();
    }
  }

  renderAmmoTray() {
    const tray = document.getElementById('ammo-slots-container');
    tray.innerHTML = '';
    this.availableAmmo.forEach((colorKey, idx) => {
      const food = FOOD_DATA[colorKey] || FOOD_DATA.red;
      const slot = document.createElement('div');
      slot.className = `ammo-slot ${idx === this.selectedAmmoIndex ? 'active' : ''}`;
      slot.innerHTML = food.emoji;
      slot.title = `${food.name} (${food.label})`;
      slot.onclick = () => this.selectAmmo(idx);
      tray.appendChild(slot);
    });
  }

  updateAmmoUI() {
    const slots = document.querySelectorAll('.ammo-slot');
    slots.forEach((s, i) => {
      s.classList.toggle('active', i === this.selectedAmmoIndex);
    });
  }

  // ==========================================
  // MAIN UPDATE LOOP
  // ==========================================
  update(dt) {
    window.particles.update(dt);

    if (this.state === 'SANCTUARY') {
      this.sanctuary.update(dt);
      return;
    }

    if (this.state !== 'ADVENTURE' && this.state !== 'ENDLESS') return;

    // Active critter list
    const activeCritters = this.state === 'ADVENTURE' ? this.critters : this.endlessCritters;

    // Update Stage Elements
    this.chimes.forEach(c => c.update(dt));
    this.chromaRings.forEach(cr => cr.update(dt));
    this.bouncers.forEach(b => b.update(dt));
    this.gravityBubbles.forEach(gb => gb.update(dt));

    // Update Critters
    activeCritters.forEach(c => c.update(dt, this.activeSnack));

    // Update Active Snack Projectile
    if (this.activeSnack) {
      const bounds = { left: 20, right: this.width - 20, top: 20, bottom: this.height };
      this.activeSnack.update(dt, bounds);

      // 1. Collide with Gravity Bubbles
      this.gravityBubbles.forEach(gb => gb.checkCollision(this.activeSnack));

      // 2. Collide with Color Mixing Rings
      this.chromaRings.forEach(cr => {
        if (cr.checkCollision(this.activeSnack)) {
          this.checkAchievement('color_alchemist');
        }
      });

      // 3. Collide with Xylophone Chimes
      this.chimes.forEach(ch => {
        if (ch.checkCollision(this.activeSnack)) {
          this.score += 50 * this.combo;
          this.chimesHitThisShot++;
          this.updateHUD();

          if (this.chimesHitThisShot >= 5) {
            this.checkAchievement('melody_maker');
          }
        }
      });

      // 4. Collide with Jelly Bouncers
      this.bouncers.forEach(b => b.checkCollision(this.activeSnack));

      // 5. Check if snack hits Critter mouth
      for (const critter of activeCritters) {
        const dx = this.activeSnack.x - critter.x;
        const dy = this.activeSnack.y - critter.y;
        const dist = Math.hypot(dx, dy);

        if (dist < critter.radius + this.activeSnack.radius) {
          // Food arrived!
          const isCorrect = (critter.desiredFood === this.activeSnack.colorKey || this.activeSnack.colorKey === 'rainbow');

          if (isCorrect) {
            // Correct feeding!
            critter.feedSuccess();
            window.sound.playMunch();

            const pts = 300 * this.combo;
            this.score += pts;
            this.combo++;

            window.particles.spawnHearts(critter.x, critter.y - 20, 7);
            window.particles.popupText(`+${pts} YUM!`, critter.x, critter.y - 45, '#ffd166', 1.25);

            if (this.combo >= 4) {
              this.checkAchievement('super_combo');
              window.particles.popupText(`🔥 COMBO x${this.combo}! 🔥`, this.width / 2, this.height * 0.35, '#ff007f', 1.3);
            }

            // Track quota in Adventure
            if (this.state === 'ADVENTURE') {
              const type = critter.type;
              this.levelFedProgress[type] = (this.levelFedProgress[type] || 0) + 1;
              this.checkAdventureLevelProgress();
            } else if (this.state === 'ENDLESS') {
              // Reset hunger in Endless
              const foods = ['red', 'yellow', 'blue', 'orange', 'green'];
              critter.setDesiredFood(foods[Math.floor(Math.random() * foods.length)]);
              critter.hungerSpeed = Math.min(0.08, critter.hungerSpeed + 0.003); // slowly speed up
            }

            this.checkAchievement('first_munch');
          } else {
            // Wrong snack!
            critter.feedWrong();
            window.sound.playWrong();
            this.combo = 1; // reset combo
            window.particles.popupText(`OOPS! 😝`, critter.x, critter.y - 35, '#ff477e', 1.0);
          }

          this.activeSnack = null;
          this.updateHUD();
          break;
        }
      }

      // Check if snack died / fell off screen
      if (this.activeSnack && this.activeSnack.isDead) {
        this.activeSnack = null;
        this.combo = 1;
        this.updateHUD();
      }
    }

    // Endless mode hunger check
    if (this.state === 'ENDLESS') {
      for (const critter of this.endlessCritters) {
        if (critter.hungerCurrent <= 0) {
          // Critter fell asleep from hunger -> game over!
          this.endlessGameOver();
          return;
        }
      }

      if (this.score >= 5000) {
        this.checkAchievement('endless_pro');
      }
    }
  }

  // Check Adventure Level Clear
  checkAdventureLevelProgress() {
    const level = GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;

    let allCompleted = true;
    for (const type in this.levelQuota) {
      const needed = this.levelQuota[type];
      const done = this.levelFedProgress[type] || 0;
      if (done < needed) {
        allCompleted = false;
        break;
      }
    }

    if (allCompleted) {
      setTimeout(() => this.completeAdventureLevel(), 500);
    }
  }

  completeAdventureLevel() {
    const level = GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;

    window.sound.playStarFanfare(3);
    window.particles.burstConfetti(this.width / 2, this.height * 0.4, 60);

    // Calculate Earned Stars
    let starsEarned = 1;
    if (this.score >= level.starThresholds[2]) starsEarned = 3;
    else if (this.score >= level.starThresholds[1]) starsEarned = 2;

    // Save stars
    this.levelStars[level.id] = Math.max(this.levelStars[level.id] || 0, starsEarned);
    localStorage.setItem('chroma_level_stars', JSON.stringify(this.levelStars));

    // Unlock next level
    if (level.id >= this.unlockedLevels) {
      this.unlockedLevels = Math.min(GAME_LEVELS.length, level.id + 1);
      localStorage.setItem('chroma_unlocked_level', this.unlockedLevels);
    }

    // Achievements
    if (level.id >= 5) this.checkAchievement('level_5_clear');
    if (level.id >= 12) this.checkAchievement('all_levels_clear');

    // Show Victory Screen
    this.showVictoryModal(level, starsEarned);
  }

  showVictoryModal(level, starsEarned) {
    document.getElementById('victory-level-title').innerText = `Level ${level.id}: ${level.title}`;
    document.getElementById('victory-score').innerText = this.score.toLocaleString();

    // Render 3 stars
    const starsContainer = document.getElementById('victory-stars-box');
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const star = document.createElement('span');
      star.className = `victory-star ${i <= starsEarned ? 'earned' : ''}`;
      star.innerHTML = '★';
      starsContainer.appendChild(star);
    }

    document.getElementById('modal-victory').classList.add('active');
  }

  endlessGameOver() {
    window.sound.playWrong();
    if (this.score > this.endlessHighScore) {
      this.endlessHighScore = this.score;
      localStorage.setItem('chroma_endless_high', this.endlessHighScore);
    }

    document.getElementById('gameover-score').innerText = this.score.toLocaleString();
    document.getElementById('gameover-highscore').innerText = this.endlessHighScore.toLocaleString();
    document.getElementById('modal-gameover').classList.add('active');
  }

  // ==========================================
  // RENDER LOOP
  // ==========================================
  render() {
    const ctx = this.ctx;

    ctx.save();
    if (ctx.resetTransform) {
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(this.scaleX || 1, this.scaleY || 1);

    // Clear Canvas
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === 'SANCTUARY') {
      this.sanctuary.render();
      window.particles.render(ctx, this.width, this.height);
      ctx.restore();
      return;
    }

    // Cosmic Island Stage Background
    this.drawStageBackground(ctx);

    // Active stage objects
    this.gravityBubbles.forEach(gb => gb.render(ctx));
    this.chromaRings.forEach(cr => cr.render(ctx));
    this.bouncers.forEach(b => b.render(ctx));
    this.chimes.forEach(ch => ch.render(ctx));

    // Active Critters
    const activeCritters = this.state === 'ADVENTURE' ? this.critters : this.endlessCritters;
    activeCritters.forEach(c => c.render(ctx));

    // Slingshot Trajectory Preview & Slingshot Cannon
    const bounds = { left: 20, right: this.width - 20, top: 20, bottom: this.height };
    this.slingshot.drawTrajectory(ctx, bounds);
    this.slingshot.render(ctx);

    // Active Flying Snack
    if (this.activeSnack) {
      this.activeSnack.render(ctx);
    }

    // Particles & Floating Combo Numbers on Top
    window.particles.render(ctx, this.width, this.height);

    ctx.restore();
  }

  drawStageBackground(ctx) {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#2b0938');
    skyGrad.addColorStop(0.5, '#4a154b');
    skyGrad.addColorStop(1, '#1b0933');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant floating candy clouds
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.ellipse(220, 180, 140, 45, 0, 0, Math.PI * 2);
    ctx.ellipse(this.width - 240, 240, 180, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ==========================================
  // MAIN GAME LOOP (requestAnimationFrame)
  // ==========================================
  gameLoop(now) {
    const dt = Math.min(2.5, (now - this.lastTime) / 16.666);
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // ==========================================
  // HUD & UI HELPERS
  // ==========================================
  updateHUD() {
    document.getElementById('hud-score-val').innerText = this.score.toLocaleString();
    document.getElementById('hud-combo-val').innerText = `x${this.combo}`;
  }

  toggleMute() {
    const isMuted = !window.sound.muted;
    window.sound.setMuted(isMuted);
    const icon = document.getElementById('sound-toggle-icon');
    if (icon) {
      icon.innerHTML = isMuted ? '🔇' : '🔊';
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  renderLevelSelectGrid() {
    const grid = document.getElementById('level-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    GAME_LEVELS.forEach((level) => {
      const isLocked = level.id > this.unlockedLevels;
      const starsEarned = this.levelStars[level.id] || 0;

      const card = document.createElement('div');
      card.className = `level-card ${isLocked ? 'locked' : ''}`;

      let starHtml = '';
      for (let s = 1; s <= 3; s++) {
        starHtml += `<span class="star ${s <= starsEarned ? '' : 'empty'}">★</span>`;
      }

      card.innerHTML = `
        <div class="level-number">${isLocked ? '🔒' : level.id}</div>
        <div class="level-name">${level.title}</div>
        <div class="level-stars">${starHtml}</div>
      `;

      if (!isLocked) {
        card.onclick = () => this.startAdventureLevel(level.id - 1);
      }

      grid.appendChild(card);
    });
  }

  // ==========================================
  // ACHIEVEMENTS SYSTEM
  // ==========================================
  loadAchievements() {
    const defaultData = {
      first_munch: { title: "First Bite!", desc: "Feed your very first hungry critter.", icon: "🍓", unlocked: false },
      color_alchemist: { title: "Color Wizard", desc: "Pass a snack through a magic color portal.", icon: "✨", unlocked: false },
      melody_maker: { title: "Music Maestro", desc: "Bounce a snack off 5 musical crystal bells.", icon: "🎵", unlocked: false },
      fashionista: { title: "Fashion Star", desc: "Dress up a critter with a hat in the Sanctuary.", icon: "🎩", unlocked: false },
      cuddle_bug: { title: "Cuddle Bug", desc: "Pet a critter 25 times in the Sanctuary.", icon: "💖", unlocked: false },
      super_combo: { title: "Combo Champion", desc: "Reach a 4x combo multiplier.", icon: "⚡", unlocked: false },
      photographer: { title: "Say Cheese!", desc: "Take a Polaroid photo in the Sanctuary.", icon: "📸", unlocked: false },
      level_5_clear: { title: "Snack Adventurer", desc: "Complete Level 5 of Adventure Island.", icon: "🏝️", unlocked: false },
      all_levels_clear: { title: "Grand Master Chef", desc: "Complete all 12 Adventure levels!", icon: "👑", unlocked: false },
      endless_pro: { title: "Rush Hero", desc: "Score 5,000+ points in Endless Snack Rush.", icon: "🏆", unlocked: false }
    };

    const saved = localStorage.getItem('chroma_achievements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        for (const k in parsed) {
          if (defaultData[k]) defaultData[k].unlocked = parsed[k].unlocked;
        }
      } catch (e) {}
    }
    return defaultData;
  }

  checkAchievement(key) {
    if (this.achievements[key] && !this.achievements[key].unlocked) {
      this.achievements[key].unlocked = true;
      localStorage.setItem('chroma_achievements', JSON.stringify(this.achievements));

      // Show in-game toast
      this.showAchievementToast(this.achievements[key]);
    }
  }

  showAchievementToast(ach) {
    window.sound.playStarFanfare(1);
    const toast = document.getElementById('achievement-toast');
    if (!toast) return;

    document.getElementById('toast-icon').innerText = ach.icon;
    document.getElementById('toast-name').innerText = ach.title;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  renderAchievementsGrid() {
    const grid = document.getElementById('badges-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    for (const key in this.achievements) {
      const ach = this.achievements[key];
      const card = document.createElement('div');
      card.className = `badge-card ${ach.unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="badge-icon">${ach.unlocked ? ach.icon : '🔒'}</div>
        <div class="badge-title">${ach.title}</div>
        <div class="badge-desc">${ach.desc}</div>
      `;
      grid.appendChild(card);
    }
  }
}

// Instantiate game on window load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
