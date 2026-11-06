/* ==========================================================================
   CHROMA CRITTERS - PHYSICS ENGINE & INTERACTIVE STAGE ELEMENTS
   Slingshot trajectory, xylophone chimes, color mixers, bouncy jelly mushrooms
   ========================================================================== */

// Polyfill for CanvasRenderingContext2D.roundRect for maximum compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    let r = typeof radii === 'number' ? radii : 8;
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

class Snack {
  constructor(x, y, vx, vy, colorKey = 'red') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 20;
    this.colorKey = colorKey;
    this.rotation = 0;
    this.rotSpeed = (Math.random() - 0.5) * 0.15;
    this.gravity = 0.38;
    this.restitution = 0.72; // Bounciness
    this.friction = 0.992;
    this.isDead = false;
    this.trailTimer = 0;
    this.bounces = 0;
    this.maxBounces = 12;
    this.chimesHit = 0;
  }

  update(dt = 1, bounds) {
    this.vx *= this.friction;
    this.vy += this.gravity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotSpeed * dt;

    // Trail particle effect
    this.trailTimer += dt;
    if (this.trailTimer >= 2) {
      this.trailTimer = 0;
      const col = FOOD_DATA[this.colorKey]?.color || '#ffffff';
      window.particles.spawnTrail(this.x, this.y, col);
    }

    // Boundary bounce
    if (this.x - this.radius < bounds.left) {
      this.x = bounds.left + this.radius;
      this.vx = -this.vx * this.restitution;
      this.bounces++;
    } else if (this.x + this.radius > bounds.right) {
      this.x = bounds.right - this.radius;
      this.vx = -this.vx * this.restitution;
      this.bounces++;
    }

    // Top ceiling bounce
    if (this.y - this.radius < bounds.top) {
      this.y = bounds.top + this.radius;
      this.vy = -this.vy * this.restitution;
      this.bounces++;
    }

    // Bottom pit fall
    if (this.y - this.radius > bounds.bottom + 80 || this.bounces > this.maxBounces) {
      this.isDead = true;
    }
  }

  render(ctx) {
    const food = FOOD_DATA[this.colorKey] || FOOD_DATA.red;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Glow aura
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 14;

    // Outer berry/treat circle
    const grad = ctx.createRadialGradient(-5, -5, 3, 0, 0, this.radius);
    grad.addColorStop(0, food.lightColor);
    grad.addColorStop(0.7, food.color);
    grad.addColorStop(1, '#1a0826');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0; // reset shadow

    // Cute emoji icon inside treat
    ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.emoji, 0, 1);

    ctx.restore();
  }
}

// ==========================================
// STAGE ELEMENTS (OBSTACLES & GIZMOS)
// ==========================================

// 1. Musical Xylophone Crystal Peg
class XylophoneChime {
  constructor(x, y, radius = 24, noteIndex = 0, noteLabel = 'C') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.noteIndex = noteIndex;
    this.noteLabel = noteLabel;
    this.hitScale = 1.0;
    this.colors = ['#ff007f', '#ff70a6', '#ffbe0b', '#06d6a0', '#118ab2', '#7209b7'];
    this.color = this.colors[noteIndex % this.colors.length];
  }

  update(dt = 1) {
    this.hitScale += (1.0 - this.hitScale) * 0.15 * dt;
  }

  checkCollision(snack) {
    const dx = snack.x - this.x;
    const dy = snack.y - this.y;
    const dist = Math.hypot(dx, dy);
    const minDist = snack.radius + this.radius;

    if (dist < minDist) {
      // Normal vector
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);

      // Separate
      snack.x = this.x + nx * minDist;
      snack.y = this.y + ny * minDist;

      // Reflect velocity
      const dot = snack.vx * nx + snack.vy * ny;
      snack.vx = (snack.vx - 2 * dot * nx) * 0.95;
      snack.vy = (snack.vy - 2 * dot * ny) * 0.95;

      // Trigger Chime
      this.hitScale = 1.45;
      snack.chimesHit++;
      window.sound.playChime(this.noteIndex);
      window.particles.spawnSparkles(this.x, this.y, this.color, 14);
      window.particles.popupText(`♪ ${this.noteLabel}`, this.x, this.y - 25, this.color, 0.9);

      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.hitScale, this.hitScale);

    // Glowing aura
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 18;

    // Crystal base
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner glossy highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Note label
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 15px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.noteLabel, 0, 1);

    ctx.restore();
  }
}

// 2. Chroma Gate / Color Mixing Portal
class ChromaRing {
  constructor(x, y, radius = 38, filterColor = 'yellow') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.filterColor = filterColor;
    this.rotation = 0;
    this.pulse = 0;
  }

  update(dt = 1) {
    this.rotation += 0.03 * dt;
    this.pulse = Math.sin(Date.now() * 0.005) * 4;
  }

  checkCollision(snack) {
    const dx = snack.x - this.x;
    const dy = snack.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.radius && !snack.justMixed) {
      // Color mixing logic!
      const current = snack.colorKey;
      const filter = this.filterColor;
      let newColor = null;

      // Primary color blending rules
      if ((current === 'red' && filter === 'yellow') || (current === 'yellow' && filter === 'red')) {
        newColor = 'orange';
      } else if ((current === 'yellow' && filter === 'blue') || (current === 'blue' && filter === 'yellow')) {
        newColor = 'green';
      } else if ((current === 'red' && filter === 'blue') || (current === 'blue' && filter === 'red')) {
        newColor = 'purple';
      } else if (filter === 'rainbow' || current === 'rainbow') {
        newColor = 'rainbow';
      } else {
        // If same color or already mixed, turn into filter color
        newColor = filter;
      }

      if (newColor && newColor !== current) {
        snack.colorKey = newColor;
        snack.justMixed = true; // prevent instant re-triggering in same frame

        window.sound.playColorMix();
        const col = FOOD_DATA[newColor]?.color || '#ffffff';
        window.particles.spawnSparkles(this.x, this.y, col, 20);
        window.particles.popupText(`✨ MIXED: ${newColor.toUpperCase()}! ✨`, this.x, this.y - 35, col, 1.2);
        return true;
      }
    } else if (dist > this.radius * 1.5) {
      snack.justMixed = false;
    }
    return false;
  }

  render(ctx) {
    const food = FOOD_DATA[this.filterColor] || FOOD_DATA.yellow;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Glowing energy ring
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 24;

    ctx.strokeStyle = food.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + this.pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating dashed inner ring
    ctx.save();
    ctx.rotate(this.rotation);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.setLineDash([8, 10]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.shadowBlur = 0;

    // Center Color Label/Icon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.label, 0, 0);

    ctx.restore();
  }
}

// 3. Squishy Bouncy Jelly Mushroom
class JellyBouncer {
  constructor(x, y, width = 64, height = 30) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.squishY = 1.0;
  }

  update(dt = 1) {
    this.squishY += (1.0 - this.squishY) * 0.18 * dt;
  }

  checkCollision(snack) {
    // Top surface collision
    if (
      snack.x > this.x - this.width / 2 &&
      snack.x < this.x + this.width / 2 &&
      snack.y + snack.radius > this.y - this.height / 2 &&
      snack.y - snack.radius < this.y + this.height / 2 &&
      snack.vy > 0
    ) {
      snack.y = this.y - this.height / 2 - snack.radius;
      snack.vy = -Math.abs(snack.vy) * 1.35 - 3; // Super high trampoline bounce!
      this.squishY = 0.45;

      window.sound.playJellyBoing();
      window.particles.spawnJuiceSplash(snack.x, this.y - this.height / 2, '#ff007f', 12);
      window.particles.popupText('BOING!', this.x, this.y - 30, '#ff70a6', 1.0);
      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(1.0, this.squishY);

    // Stem
    ctx.fillStyle = '#e2dbf0';
    ctx.fillRect(-8, 0, 16, this.height);

    // Jelly Cap
    const grad = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
    grad.addColorStop(0, '#ff477e');
    grad.addColorStop(1, '#ff0a54');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // White polka dots
    ctx.fillStyle = '#ffffff';
    [-14, 0, 14].forEach((dx, i) => {
      ctx.beginPath();
      ctx.arc(dx, -8 + (i === 1 ? -6 : 0), 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }
}

// 4. Low-Gravity Dream Bubble
class GravityBubble {
  constructor(x, y, radius = 60) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.wobble = Math.random() * Math.PI;
  }

  update(dt = 1) {
    this.wobble += 0.04 * dt;
  }

  checkCollision(snack) {
    const dx = snack.x - this.x;
    const dy = snack.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.radius) {
      // Counteract gravity and give gentle floaty upward drift
      snack.vy -= 0.65;
      snack.vx *= 0.97;
      snack.vy *= 0.94;
      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const r = this.radius + Math.sin(this.wobble) * 3;

    // Soap bubble shimmer gradient
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 5, 0, 0, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.6, 'rgba(112, 214, 255, 0.2)');
    grad.addColorStop(0.9, 'rgba(255, 112, 166, 0.3)');
    grad.addColorStop(1, 'rgba(112, 214, 255, 0.5)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crescent shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.4, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ==========================================
// SLINGSHOT CANNON CONTROLLER
// ==========================================
class Slingshot {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.dragX = x;
    this.dragY = y;
    this.isDragging = false;
    this.maxPull = 110;
    this.power = 0.21;
    this.activeSnackType = 'red';
  }

  setAnchor(x, y) {
    this.baseX = x;
    this.baseY = y;
    if (!this.isDragging) {
      this.dragX = x;
      this.dragY = y;
    }
  }

  startDrag(mx, my) {
    const dist = Math.hypot(mx - this.baseX, my - this.baseY);
    if (dist < 100) {
      this.isDragging = true;
      this.updateDrag(mx, my);
      return true;
    }
    return false;
  }

  updateDrag(mx, my) {
    if (!this.isDragging) return;

    let dx = mx - this.baseX;
    let dy = my - this.baseY;
    const dist = Math.hypot(dx, dy);

    // Limit maximum pull distance
    if (dist > this.maxPull) {
      dx = (dx / dist) * this.maxPull;
      dy = (dy / dist) * this.maxPull;
    }

    // Pull down only (or limited upwards)
    if (dy < -10) dy = -10;

    this.dragX = this.baseX + dx;
    this.dragY = this.baseY + dy;

    // Sound stretch tension feedback
    window.sound.playStretch(dist / this.maxPull);
  }

  release() {
    if (!this.isDragging) return null;

    const dx = this.baseX - this.dragX;
    const dy = this.baseY - this.dragY;
    const dist = Math.hypot(dx, dy);

    this.isDragging = false;
    this.dragX = this.baseX;
    this.dragY = this.baseY;

    if (dist < 20) return null; // Minimum drag to fire

    // Launch velocity
    const vx = dx * this.power;
    const vy = dy * this.power;

    window.sound.playLaunch();

    return new Snack(this.baseX, this.baseY, vx, vy, this.activeSnackType);
  }

  // Draw predictive trajectory dots
  drawTrajectory(ctx, bounds, stageObjects = []) {
    if (!this.isDragging) return;

    const dx = this.baseX - this.dragX;
    const dy = this.baseY - this.dragY;
    const dist = Math.hypot(dx, dy);
    if (dist < 18) return;

    let simX = this.baseX;
    let simY = this.baseY;
    let simVx = dx * this.power;
    let simVy = dy * this.power;
    const gravity = 0.38;

    const steps = 38;
    ctx.save();

    for (let i = 0; i < steps; i++) {
      simVx *= 0.992;
      simVy += gravity;
      simX += simVx;
      simY += simVy;

      // Bounce prediction off side walls
      if (simX < bounds.left + 20) {
        simX = bounds.left + 20;
        simVx = -simVx * 0.72;
      } else if (simX > bounds.right - 20) {
        simX = bounds.right - 20;
        simVx = -simVx * 0.72;
      }

      // Draw trajectory dot
      const alpha = 1.0 - (i / steps);
      const dotSize = Math.max(3, 7 * (1 - (i / steps) * 0.5));

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(simX, simY, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  render(ctx) {
    const forkLeftX = this.baseX - 35;
    const forkRightX = this.baseX + 35;
    const forkY = this.baseY - 15;

    // 1. Back Rubber Band (drawn behind pouch)
    if (this.isDragging) {
      ctx.strokeStyle = '#d90429';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(forkLeftX, forkY);
      ctx.lineTo(this.dragX, this.dragY);
      ctx.stroke();
    }

    // 2. Wooden / Golden Slingshot Fork
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;

    // Handle
    const gradHandle = ctx.createLinearGradient(this.baseX - 10, this.baseY, this.baseX + 10, this.baseY + 45);
    gradHandle.addColorStop(0, '#ffbe0b');
    gradHandle.addColorStop(1, '#fb5607');

    ctx.fillStyle = gradHandle;
    ctx.beginPath();
    ctx.roundRect(this.baseX - 12, this.baseY, 24, 48, 10);
    ctx.fill();

    // Forks
    ctx.strokeStyle = gradHandle;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.baseX, this.baseY + 5);
    ctx.lineTo(forkLeftX, forkY);
    ctx.moveTo(this.baseX, this.baseY + 5);
    ctx.lineTo(forkRightX, forkY);
    ctx.stroke();

    ctx.restore();

    // 3. Front Rubber Band
    if (this.isDragging) {
      ctx.strokeStyle = '#ef233c';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(forkRightX, forkY);
      ctx.lineTo(this.dragX, this.dragY);
      ctx.stroke();

      // Slingshot Pouch with Loaded Food Treat
      const food = FOOD_DATA[this.activeSnackType] || FOOD_DATA.red;
      ctx.save();
      ctx.translate(this.dragX, this.dragY);

      // Pouch leather
      ctx.fillStyle = '#4a1525';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Food in pouch
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '14px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.emoji, 0, 1);

      ctx.restore();
    } else {
      // Idle band resting
      ctx.strokeStyle = '#ef233c';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(forkLeftX, forkY);
      ctx.quadraticCurveTo(this.baseX, this.baseY - 5, forkRightX, forkY);
      ctx.stroke();

      // Idle snack resting in sling
      const food = FOOD_DATA[this.activeSnackType] || FOOD_DATA.red;
      ctx.save();
      ctx.translate(this.baseX, this.baseY - 14);
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '14px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.emoji, 0, 1);
      ctx.restore();
    }
  }
}

window.Snack = Snack;
window.XylophoneChime = XylophoneChime;
window.ChromaRing = ChromaRing;
window.JellyBouncer = JellyBouncer;
window.GravityBubble = GravityBubble;
window.Slingshot = Slingshot;
