/* ==========================================================================
   CHROMA CRITTERS - JUICY PARTICLE & FLOATING TEXT ENGINE
   Sparkles, confetti bursts, hearts, ripples, and combo numbers
   ========================================================================== */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.textPopups = [];
    this.ambientStars = [];
    this.initAmbientStars(45);
  }

  // Pre-seed ambient twinkling background stars
  initAmbientStars(count) {
    this.ambientStars = [];
    for (let i = 0; i < count; i++) {
      this.ambientStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.5 + 1,
        color: ['#ffffff', '#ffeedd', '#d0e1fd', '#ffd166', '#ffb4d6'][Math.floor(Math.random() * 5)],
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinkleDir: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  // 1. Rainbow Confetti Burst (Celebrations & Level Clears)
  burstConfetti(x, y, count = 40) {
    const colors = ['#ff477e', '#ff70a6', '#ff9770', '#ffd670', '#e9ff70', '#70d6ff', '#00f5d4', '#9b5de5'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 4;
      this.particles.push({
        type: 'confetti',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        sizeW: Math.random() * 8 + 6,
        sizeH: Math.random() * 14 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 18,
        gravity: 0.22,
        life: 1.0,
        decay: Math.random() * 0.012 + 0.008
      });
    }
  }

  // 2. Sparkles (Chimes, Color Mixes, Star unlocks)
  spawnSparkles(x, y, color = '#ffd166', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push({
        type: 'sparkle',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 4,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  // 3. Heart Bubbles (Critter feeding and petting)
  spawnHearts(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'heart',
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2.2 - 1.2,
        size: Math.random() * 12 + 14,
        color: '#ff4d6d',
        life: 1.0,
        decay: Math.random() * 0.018 + 0.012,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.08
      });
    }
  }

  // 4. Stardust Trail behind flying snacks
  spawnTrail(x, y, color = '#ffffff') {
    this.particles.push({
      type: 'trail',
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 6 + 3,
      color: color,
      life: 1.0,
      decay: 0.06
    });
  }

  // 5. Juice / Impact Splash Drops
  spawnJuiceSplash(x, y, color = '#ffbe0b', count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        type: 'splash',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: color,
        gravity: 0.2,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.02
      });
    }
  }

  // 6. Floating Score / Combo Text Popups
  popupText(text, x, y, color = '#ffffff', scale = 1.0) {
    this.textPopups.push({
      text: text,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -2.8,
      scale: scale,
      baseScale: scale,
      color: color,
      life: 1.0,
      decay: 0.022
    });
  }

  // Update all particles & text
  update(dt = 1) {
    // Ambient stars twinkling
    for (const star of this.ambientStars) {
      star.alpha += star.twinkleSpeed * star.twinkleDir * dt;
      if (star.alpha >= 0.95) {
        star.alpha = 0.95;
        star.twinkleDir = -1;
      } else if (star.alpha <= 0.15) {
        star.alpha = 0.15;
        star.twinkleDir = 1;
      }
    }

    // Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.rotation !== undefined && p.rotSpeed) p.rotation += p.rotSpeed * dt;
      if (p.wobble !== undefined) {
        p.wobble += p.wobbleSpeed * dt;
        p.x += Math.sin(p.wobble) * 0.8;
      }

      p.life -= p.decay * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.textPopups.length - 1; i >= 0; i--) {
      const t = this.textPopups[i];
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vy *= 0.95; // gently decelerate
      t.life -= t.decay * dt;

      // Springy bounce scale at start
      if (t.life > 0.8) {
        t.scale = t.baseScale * (1 + (1 - t.life) * 1.5);
      } else {
        t.scale = t.baseScale;
      }

      if (t.life <= 0) {
        this.textPopups.splice(i, 1);
      }
    }
  }

  // Render all particles & texts onto the canvas
  render(ctx, width, height) {
    // 1. Draw Ambient Twinkling Stars
    for (const star of this.ambientStars) {
      ctx.save();
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw Active Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.sizeW / 2, -p.sizeH / 2, p.sizeW, p.sizeH);
      } else if (p.type === 'sparkle') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // Draw 4-point star
        ctx.beginPath();
        const r = p.size;
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();
      } else if (p.type === 'heart') {
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        const s = p.size / 16;
        ctx.beginPath();
        ctx.moveTo(0, -5 * s);
        ctx.bezierCurveTo(-7 * s, -12 * s, -14 * s, -3 * s, 0, 8 * s);
        ctx.bezierCurveTo(14 * s, -3 * s, 7 * s, -12 * s, 0, -5 * s);
        ctx.fill();
      } else if (p.type === 'trail' || p.type === 'splash') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. Draw Floating Text Popups with outline
    for (const t of this.textPopups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      ctx.font = '800 24px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Thick cartoon outline
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1b0933';
      ctx.strokeText(t.text, 0, 0);

      // Bright fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.textPopups = [];
  }
}

window.particles = new ParticleSystem();

