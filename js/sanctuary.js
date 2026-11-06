/* ==========================================================================
   CHROMA CRITTERS - PET SANCTUARY & DRESS-UP DAYCARE
   Petting, feeding, toy physics, dress-up wardrobe & polaroid photo booth
   ========================================================================== */

class SanctuaryMode {
  constructor(canvas, ctx, width = 1200, height = 800) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    this.activeCritterKey = 'bloop';
    this.critters = {};
    this.toys = [];
    this.isPetting = false;
    this.petCount = 0;

    this.initCritters();
  }

  initCritters() {
    const keys = ['bloop', 'puff', 'zippy', 'gromp', 'cosmo'];
    keys.forEach((key, index) => {
      // Position nicely spaced across nursery floor
      const spacing = this.width / (keys.length + 1);
      const x = spacing * (index + 1);
      const y = this.height * 0.52;
      const critter = new Critter(key, x, y, 62);
      critter.desiredFood = null; // No hungry timers in sanctuary
      this.critters[key] = critter;
    });
  }

  // Set currently selected critter for wardrobe dressing
  selectCritter(key) {
    if (this.critters[key]) {
      this.activeCritterKey = key;
      this.critters[key].squish(1.2, 0.8);
      window.sound.playGiggle();

      // Update UI tabs
      document.querySelectorAll('.critter-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(key));
      });
    }
  }

  // Equip hat to selected critter
  equipHatToActive(hatKey) {
    const critter = this.critters[this.activeCritterKey];
    if (critter) {
      critter.equipHat(hatKey);
      critter.squish(1.25, 0.75);
      window.sound.playClick();
      window.particles.spawnSparkles(critter.x, critter.y - 50, '#ffbe0b', 16);
      window.particles.popupText(`✨ DRESSED! ✨`, critter.x, critter.y - 70, '#ff007f', 1.1);

      // Check achievement
      window.game?.checkAchievement('fashionista');
    }
  }

  // Feed selected or clicked critter
  feedCritter(critterKey, foodKey) {
    const critter = this.critters[critterKey];
    if (critter) {
      critter.feedSuccess();
      window.sound.playMunch();
      const col = FOOD_DATA[foodKey]?.color || '#ff477e';
      window.particles.spawnHearts(critter.x, critter.y - 30, 8);
      window.particles.spawnSparkles(critter.x, critter.y, col, 14);
      window.particles.popupText(`YUMMY! ❤️`, critter.x, critter.y - 60, col, 1.2);

      window.game?.checkAchievement('first_munch');
    }
  }

  // Spawn bouncy toy into pen
  spawnToy(toyType) {
    const x = this.width / 2 + (Math.random() - 0.5) * 300;
    const y = 180;

    this.toys.push({
      type: toyType,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -3,
      radius: toyType === 'duck' ? 24 : 30,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      bounciness: 0.75
    });

    window.sound.playJellyBoing();
    window.particles.spawnSparkles(x, y, '#ffd166', 10);
  }

  // Handle pointer down / petting
  handlePointerDown(x, y) {
    // Check if clicked toy
    for (let i = this.toys.length - 1; i >= 0; i--) {
      const t = this.toys[i];
      if (Math.hypot(x - t.x, y - t.y) < t.radius) {
        t.vy = -9;
        t.vx = (x < t.x ? 5 : -5);
        window.sound.playJellyBoing();
        window.particles.spawnSparkles(t.x, t.y, '#ffd166', 8);
        return;
      }
    }

    // Check if clicked critter
    for (const key in this.critters) {
      const c = this.critters[key];
      if (Math.hypot(x - c.x, y - c.y) < c.radius) {
        this.selectCritter(key);
        this.isPetting = true;
        this.petCritter(c);
        return;
      }
    }
  }

  handlePointerMove(x, y) {
    if (this.isPetting) {
      const c = this.critters[this.activeCritterKey];
      if (c && Math.hypot(x - c.x, y - c.y) < c.radius * 1.5) {
        this.petCritter(c);
      }
    }
  }

  handlePointerUp() {
    this.isPetting = false;
  }

  petCritter(critter) {
    this.petCount++;
    critter.squish(1.15, 0.88);
    critter.chewingTimer = 15;

    if (this.petCount % 6 === 0) {
      window.sound.playGiggle();
      window.particles.spawnHearts(critter.x, critter.y - 20, 3);
    }

    if (this.petCount >= 25) {
      window.game?.checkAchievement('cuddle_bug');
    }
  }

  update(dt = 1) {
    // Update critters
    const width = this.width;
    const height = this.height;

    const keys = Object.keys(this.critters);
    const spacing = width / (keys.length + 1);

    keys.forEach((key, idx) => {
      const c = this.critters[key];
      c.x = spacing * (idx + 1);
      c.y = height * 0.52;
      c.update(dt, null);
    });

    // Update toys physics
    for (let i = this.toys.length - 1; i >= 0; i--) {
      const t = this.toys[i];
      t.vy += 0.35 * dt; // gravity
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.rotation += t.rotSpeed * dt;
      t.vx *= 0.99;

      // Floor bounce
      const floorY = height * 0.76;
      if (t.y + t.radius > floorY) {
        t.y = floorY - t.radius;
        t.vy = -t.vy * t.bounciness;
        t.vx *= 0.85;
      }

      // Walls
      if (t.x - t.radius < 50) {
        t.x = 50 + t.radius;
        t.vx = -t.vx * t.bounciness;
      } else if (t.x + t.radius > width - 50) {
        t.x = width - 50 - t.radius;
        t.vx = -t.vx * t.bounciness;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    // Cozy Daycare Room Background
    // Ceiling / Wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    wallGrad.addColorStop(0, '#38185c');
    wallGrad.addColorStop(1, '#65319e');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, width, height * 0.65);

    // Warm Wooden Floor
    const floorGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
    floorGrad.addColorStop(0, '#f9c74f');
    floorGrad.addColorStop(1, '#f3722c');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // Cute floor rug
    ctx.fillStyle = '#ffb4d6';
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.72, width * 0.42, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Pastel Fairy Bunting Garland
    this.drawGarland(ctx, width);

    // Critter Selection Ring Highlight
    const activeC = this.critters[this.activeCritterKey];
    if (activeC) {
      ctx.save();
      ctx.strokeStyle = '#00f5d4';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.ellipse(activeC.x, activeC.y + activeC.radius + 12, activeC.radius * 1.1, 14, 0, 0, Math.PI * 2);
      ctx.stroke();

      // "Pet Me!" badge
      ctx.fillStyle = '#00f5d4';
      ctx.font = '800 16px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`♥ ${activeC.name} ♥`, activeC.x, activeC.y - activeC.radius - 24);
      ctx.restore();
    }

    // Render Critters
    for (const key in this.critters) {
      this.critters[key].render(ctx);
    }

    // Render Toys
    this.toys.forEach(t => this.drawToy(ctx, t));
  }

  drawGarland(ctx, width) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.quadraticCurveTo(width / 2, 90, width, 50);
    ctx.stroke();

    // Pennants
    const count = 14;
    const colors = ['#ff477e', '#ffbe0b', '#06d6a0', '#118ab2', '#7209b7', '#ff70a6'];
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const x = t * width;
      const y = 50 + Math.sin(t * Math.PI) * 40;

      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x + 14, y);
      ctx.lineTo(x, y + 26);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawToy(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rotation);

    if (t.type === 'ball') {
      // Beach ball segments
      const r = t.radius;
      const colors = ['#ff0054', '#ffbe0b', '#00b4d8', '#ffffff'];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (t.type === 'duck') {
      // Rubber Ducky emoji
      ctx.font = '36px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦆', 0, 0);
    } else if (t.type === 'bubble') {
      ctx.font = '36px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🫧', 0, 0);
    }

    ctx.restore();
  }

  // Take Snapshot Photo and Download
  snapPolaroid() {
    const activeC = this.critters[this.activeCritterKey];
    if (!activeC) return;

    // Create offscreen canvas for crisp Polaroid sticker
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = 440;
    photoCanvas.height = 540;
    const pCtx = photoCanvas.getContext('2d');

    // Safe roundRect helper
    const drawRoundRect = (c, x, y, w, h, r) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    // 1. White Polaroid Card Frame
    pCtx.fillStyle = '#ffffff';
    pCtx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    pCtx.shadowBlur = 15;
    drawRoundRect(pCtx, 15, 15, 410, 510, 16);
    pCtx.fill();
    pCtx.shadowBlur = 0;

    // 2. Picture Background
    const bgGrad = pCtx.createLinearGradient(35, 35, 35, 410);
    bgGrad.addColorStop(0, '#8ecae6');
    bgGrad.addColorStop(0.6, '#ffb4a2');
    bgGrad.addColorStop(1, '#ffcdb2');
    pCtx.fillStyle = bgGrad;
    drawRoundRect(pCtx, 35, 35, 370, 380, 10);
    pCtx.fill();

    // 3. Render Critter in center
    const tempCritter = new Critter(activeC.type, 220, 245, 80);
    tempCritter.equippedHat = activeC.equippedHat;
    tempCritter.render(pCtx);

    // 4. Cute Handwritten Caption
    pCtx.fillStyle = '#2d1844';
    pCtx.font = '800 28px "Fredoka", sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText(`My Best Buddy: ${activeC.name}!`, 220, 465);

    pCtx.font = '600 16px "Fredoka", sans-serif';
    pCtx.fillStyle = '#7928ca';
    pCtx.fillText('Chroma Critters Daycare Photo Album ✨', 220, 495);

    // Download photo
    const link = document.createElement('a');
    link.download = `chroma-critter-${activeC.name.toLowerCase()}.png`;
    link.href = photoCanvas.toDataURL('image/png');
    link.click();

    window.sound.playStarFanfare(2);
    window.particles.burstConfetti(this.width / 2, this.height / 2, 40);
    window.particles.popupText('📸 PHOTO SAVED!', this.width / 2, this.height / 2, '#ffbe0b', 1.4);

    window.game?.checkAchievement('photographer');
  }
}

window.SanctuaryMode = SanctuaryMode;

