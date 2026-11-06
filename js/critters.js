/* ==========================================================================
   CHROMA CRITTERS - ADORABLE PROCEDURAL CRITTER ENGINE
   Dynamic eye tracking, squash & stretch, silly hats & facial expressions
   ========================================================================== */

const CRITTER_TYPES = {
  bloop: {
    name: 'Bloop',
    title: 'The Sleepy Slime',
    bodyColor: '#38bdf8',
    bellyColor: '#bae6fd',
    accentColor: '#0284c7',
    cheekColor: '#7dd3fc',
    defaultDesire: 'blue',
    description: 'A cheerful water-blob who loves cold blueberries!'
  },
  puff: {
    name: 'Puff',
    title: 'The Cotton Bunny',
    bodyColor: '#ff70a6',
    bellyColor: '#ffd6e0',
    accentColor: '#ff477e',
    cheekColor: '#ff99c8',
    defaultDesire: 'red',
    description: 'A fluffy pink bunny who adores sweet strawberries!'
  },
  zippy: {
    name: 'Zippy',
    title: 'The Spark Sprite',
    bodyColor: '#ffd166',
    bellyColor: '#fff3b0',
    accentColor: '#e09f3e',
    cheekColor: '#ffe699',
    defaultDesire: 'yellow',
    description: 'Super speedy star sprite who craves lemon zappers!'
  },
  gromp: {
    name: 'Gromp',
    title: 'The Gentle Giant',
    bodyColor: '#06d6a0',
    bellyColor: '#b7efc5',
    accentColor: '#049669',
    cheekColor: '#a7f3d0',
    defaultDesire: 'green',
    description: 'A big, cuddly moss critter who loves juicy melons!'
  },
  cosmo: {
    name: 'Cosmo',
    title: 'The Rainbow Dragonling',
    bodyColor: '#9b5de5',
    bellyColor: '#e0aaff',
    accentColor: '#7b2cbf',
    cheekColor: '#c77dff',
    defaultDesire: 'rainbow',
    description: 'A magical cosmic creature who eats rainbow treats!'
  }
};

const FOOD_DATA = {
  red: { name: 'Strawberry Gem', color: '#ff3366', lightColor: '#ff758f', emoji: '🍓', label: 'RED' },
  yellow: { name: 'Lemon Star', color: '#ffbe0b', lightColor: '#ffea00', emoji: '⭐', label: 'YELLOW' },
  blue: { name: 'Ice Berry', color: '#00b4d8', lightColor: '#90e0ef', emoji: '🫐', label: 'BLUE' },
  green: { name: 'Melon Crunch', color: '#10b981', lightColor: '#6ee7b7', emoji: '🍈', label: 'GREEN' },
  orange: { name: 'Tangerine Pop', color: '#fb8500', lightColor: '#ffb703', emoji: '🍊', label: 'ORANGE' },
  purple: { name: 'Plum Drop', color: '#8338ec', lightColor: '#c77dff', emoji: '🍇', label: 'PURPLE' },
  rainbow: { name: 'Cosmic Cupcake', color: '#ff007f', lightColor: '#00f5d4', emoji: '🧁', label: 'RAINBOW' }
};

class Critter {
  constructor(type, x, y, radius = 55) {
    this.type = type;
    this.config = CRITTER_TYPES[type] || CRITTER_TYPES.bloop;
    this.name = this.config.name;
    this.x = x;
    this.y = y;
    this.baseRadius = radius;
    this.radius = radius;

    // Desired snack
    this.desiredFood = this.config.defaultDesire;
    this.hungerMax = 100;
    this.hungerCurrent = 100;
    this.hungerSpeed = 0; // 0 for calm adventure, positive for endless rush

    // Procedural animation states
    this.squashX = 1.0;
    this.squashY = 1.0;
    this.mouthOpen = 0.0; // 0 (closed) to 1 (wide open)
    this.targetMouthOpen = 0.0;
    this.blinkTimer = Math.random() * 120 + 80;
    this.isBlinking = false;
    this.chewingTimer = 0;
    this.happyTimer = 0;
    this.sadTimer = 0;

    // Eye look target
    this.lookX = x;
    this.lookY = y + 100;

    // Petting state
    this.isBeingPet = false;
    this.petProgress = 0;

    // Equipped customization hat
    const savedHat = localStorage.getItem(`chroma_hat_${this.type}`);
    this.equippedHat = savedHat || 'none';

    // Idle breathing / hover motion
    this.idleOffset = Math.random() * Math.PI * 2;
  }

  setDesiredFood(foodKey) {
    this.desiredFood = foodKey;
    this.hungerCurrent = this.hungerMax;
  }

  equipHat(hatKey) {
    this.equippedHat = hatKey;
    localStorage.setItem(`chroma_hat_${this.type}`, hatKey);
  }

  // Squish when tapped or hit with snack
  squish(factorX = 1.25, factorY = 0.75) {
    this.squashX = factorX;
    this.squashY = factorY;
  }

  // Called when fed correct food
  feedSuccess() {
    this.squish(1.3, 0.7);
    this.chewingTimer = 45;
    this.happyTimer = 60;
    this.mouthOpen = 0;
    this.targetMouthOpen = 0;
  }

  // Called when fed wrong food
  feedWrong() {
    this.squish(0.85, 1.15);
    this.sadTimer = 45;
  }

  update(dt = 1, currentFood = null) {
    // Spring physics back to normal scale
    this.squashX += (1.0 - this.squashX) * 0.12 * dt;
    this.squashY += (1.0 - this.squashY) * 0.12 * dt;

    // Blinking
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer <= -8) {
        this.isBlinking = false;
        this.blinkTimer = Math.random() * 180 + 100;
      }
    }

    // Timers
    if (this.chewingTimer > 0) this.chewingTimer -= dt;
    if (this.happyTimer > 0) this.happyTimer -= dt;
    if (this.sadTimer > 0) this.sadTimer -= dt;

    // Eye tracking: look towards active flying/dragged food or player's cursor
    if (currentFood) {
      this.lookX = currentFood.x;
      this.lookY = currentFood.y;

      // Distance to food
      const dx = currentFood.x - this.x;
      const dy = currentFood.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Open mouth wide in anticipation if food is flying towards critter
      if (dist < 220 && currentFood.vy < 0 || dist < 120) {
        this.targetMouthOpen = Math.min(1.0, (220 - dist) / 100);
      } else {
        this.targetMouthOpen = 0.0;
      }
    } else {
      this.targetMouthOpen = 0.0;
    }

    // Smooth mouth transition
    this.mouthOpen += (this.targetMouthOpen - this.mouthOpen) * 0.2 * dt;

    // Hunger reduction for timed modes
    if (this.hungerSpeed > 0) {
      this.hungerCurrent -= this.hungerSpeed * dt;
      if (this.hungerCurrent <= 0) {
        this.hungerCurrent = 0;
      }
    }
  }

  // Render critter
  render(ctx) {
    ctx.save();

    // Idle gentle hover float
    const hoverY = Math.sin(Date.now() * 0.003 + this.idleOffset) * 4;
    ctx.translate(this.x, this.y + hoverY);
    ctx.scale(this.squashX, this.squashY);

    // 1. Shadow underneath
    ctx.save();
    ctx.scale(1 / this.squashX, 1 / this.squashY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, this.radius + 14 - hoverY, this.radius * 0.85, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Body Drawing based on type
    this.drawBody(ctx);

    // 3. Cheeks / Blush
    this.drawCheeks(ctx);

    // 4. Eyes (Track lookX, lookY)
    this.drawEyes(ctx);

    // 5. Mouth (Chewing, Open, Happy, or Sad)
    this.drawMouth(ctx);

    // 6. Equipped Hat / Costume
    if (this.equippedHat && this.equippedHat !== 'none') {
      this.drawHat(ctx, this.equippedHat);
    }

    ctx.restore();

    // 7. Thought Bubble (Snack craving) - rendered unscaled above critter
    if (this.desiredFood && FOOD_DATA[this.desiredFood]) {
      this.drawThoughtBubble(ctx, this.x, this.y + hoverY - this.radius - 28);
    }

    // 8. Hunger Bar (if active hunger mode)
    if (this.hungerSpeed > 0) {
      this.drawHungerBar(ctx, this.x, this.y + hoverY - this.radius - 8);
    }
  }

  drawBody(ctx) {
    const r = this.radius;
    const cfg = this.config;

    // Gradient 3D sphere look
    const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.35, r * 0.15, 0, 0, r * 1.1);
    grad.addColorStop(0, cfg.bellyColor);
    grad.addColorStop(0.4, cfg.bodyColor);
    grad.addColorStop(1, cfg.accentColor);

    ctx.fillStyle = grad;

    if (this.type === 'bloop') {
      // Squishy raindrop/blob shape with cute antenna
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25);
      ctx.bezierCurveTo(r * 0.85, -r * 0.9, r * 1.1, r * 0.4, 0, r * 1.05);
      ctx.bezierCurveTo(-r * 1.1, r * 0.4, -r * 0.85, -r * 0.9, 0, -r * 1.25);
      ctx.fill();

      // Antenna drop tip
      ctx.fillStyle = cfg.accentColor;
      ctx.beginPath();
      ctx.arc(0, -r * 1.25, 8, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'puff') {
      // Bunny ears first
      ctx.fillStyle = cfg.bodyColor;
      // Left ear
      ctx.beginPath();
      ctx.ellipse(-r * 0.45, -r * 0.9, 12, 28, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Right ear
      ctx.beginPath();
      ctx.ellipse(r * 0.45, -r * 0.9, 12, 28, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Inner ears
      ctx.fillStyle = '#ffccd5';
      ctx.beginPath();
      ctx.ellipse(-r * 0.45, -r * 0.9, 6, 18, -0.2, 0, Math.PI * 2);
      ctx.ellipse(r * 0.45, -r * 0.9, 6, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy round head
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'zippy') {
      // Star Sprite points
      ctx.beginPath();
      const points = 5;
      const outerR = r * 1.08;
      const innerR = r * 0.72;
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'gromp') {
      // Mossy big chonker with little head sprout
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.1, r * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();

      // Leaf sprout on head
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(-8, -r * 0.95, 12, 6, -0.5, 0, Math.PI * 2);
      ctx.ellipse(8, -r * 0.95, 12, 6, 0.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'cosmo') {
      // Dragon baby with tiny wings and golden horn
      // Wings
      ctx.fillStyle = '#f72585';
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -10);
      ctx.quadraticCurveTo(-r * 1.4, -30, -r * 0.9, 15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.7, -10);
      ctx.quadraticCurveTo(r * 1.4, -30, r * 0.9, 15);
      ctx.fill();

      // Body
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Golden unicorn/dragon horn
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(-6, -r * 0.85);
      ctx.lineTo(0, -r * 1.35);
      ctx.lineTo(6, -r * 0.85);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawCheeks(ctx) {
    const r = this.radius;
    ctx.fillStyle = this.config.cheekColor;
    ctx.globalAlpha = 0.55;

    // Soft blushing cheeks
    ctx.beginPath();
    ctx.ellipse(-r * 0.5, r * 0.12, 10, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.5, r * 0.12, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }

  drawEyes(ctx) {
    const r = this.radius;
    const eyeOffsetX = r * 0.35;
    const eyeOffsetY = -r * 0.12;
    const eyeRadius = r * 0.22;

    // Eye blinking
    if (this.isBlinking) {
      ctx.strokeStyle = '#2d1844';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius * 0.7, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius * 0.7, 0.2, Math.PI - 0.2);
      ctx.stroke();
      return;
    }

    // Direction vector towards look target
    const dx = this.lookX - (this.x);
    const dy = this.lookY - (this.y);
    const angle = Math.atan2(dy, dx);
    const lookDist = Math.min(6, Math.hypot(dx, dy) * 0.02);
    const pupilX = Math.cos(angle) * lookDist;
    const pupilY = Math.sin(angle) * lookDist;

    // Both eyes (white sclera)
    [-eyeOffsetX, eyeOffsetX].forEach((ex) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pupil (dark sparkly)
      ctx.fillStyle = '#1c0a38';
      ctx.beginPath();
      ctx.arc(ex + pupilX, eyeOffsetY + pupilY, eyeRadius * 0.58, 0, Math.PI * 2);
      ctx.fill();

      // Cute big catchlight shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + pupilX - 3, eyeOffsetY + pupilY - 3, eyeRadius * 0.24, 0, Math.PI * 2);
      ctx.fill();

      // Small secondary shine
      ctx.beginPath();
      ctx.arc(ex + pupilX + 2, eyeOffsetY + pupilY + 3, eyeRadius * 0.12, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawMouth(ctx) {
    const r = this.radius;
    const mouthY = r * 0.25;

    ctx.save();
    ctx.translate(0, mouthY);

    if (this.sadTimer > 0) {
      // Silly pout / wavy mouth
      ctx.strokeStyle = '#2d1844';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 10, 12, Math.PI + 0.3, -0.3);
      ctx.stroke();
    } else if (this.chewingTimer > 0) {
      // Chewing animation (mouth opens and closes rapidly)
      const chewPhase = Math.sin(this.chewingTimer * 0.5);
      const chewHeight = 8 + chewPhase * 6;
      ctx.fillStyle = '#800020';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, chewHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pink tongue
      ctx.fillStyle = '#ff758f';
      ctx.beginPath();
      ctx.arc(0, chewHeight * 0.4, 7, 0, Math.PI);
      ctx.fill();
    } else if (this.mouthOpen > 0.1) {
      // Food incoming: Mouth opens wide in anticipation!
      const openHeight = 10 + this.mouthOpen * 18;
      ctx.fillStyle = '#4a0e17';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 + this.mouthOpen * 6, openHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute tongue
      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.arc(0, openHeight * 0.45, 9, 0, Math.PI);
      ctx.fill();
    } else {
      // Sweet idle smile
      ctx.strokeStyle = '#2d1844';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -2, 12, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawHat(ctx, hatKey) {
    const r = this.radius;
    const hatY = -r * 0.75;

    ctx.save();
    ctx.translate(0, hatY);

    switch (hatKey) {
      case 'chef':
        // Big fluffy chef hat
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2dbf0';
        ctx.lineWidth = 2;
        // Brim
        ctx.fillRect(-22, -4, 44, 10);
        // Puffs
        ctx.beginPath();
        ctx.arc(-14, -18, 14, 0, Math.PI * 2);
        ctx.arc(0, -26, 18, 0, Math.PI * 2);
        ctx.arc(14, -18, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'party':
        // Striped party cone with fluffy pom-pom
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(0, -42);
        ctx.lineTo(18, 0);
        ctx.closePath();
        ctx.fill();

        // Yellow stripes
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(10, -14);
        ctx.moveTo(-5, -28);
        ctx.lineTo(5, -28);
        ctx.stroke();

        // Pom pom
        ctx.fillStyle = '#00f5d4';
        ctx.beginPath();
        ctx.arc(0, -44, 7, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'crown':
        // Royal golden crown with jewels
        ctx.fillStyle = '#ffbe0b';
        ctx.strokeStyle = '#fb5607';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(-24, -22);
        ctx.lineTo(-12, -12);
        ctx.lineTo(0, -28);
        ctx.lineTo(12, -12);
        ctx.lineTo(24, -22);
        ctx.lineTo(22, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Red gems
        ctx.fillStyle = '#ff0054';
        [-15, 0, 15].forEach(gx => {
          ctx.beginPath();
          ctx.arc(gx, -6, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'dino':
        // Green dino spikes
        ctx.fillStyle = '#06d6a0';
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 16 - 8, 2);
          ctx.lineTo(i * 16, -20);
          ctx.lineTo(i * 16 + 8, 2);
          ctx.closePath();
          ctx.fill();
        }
        break;

      case 'sunglasses':
        // Cool pixel/star shades on eyes
        ctx.translate(0, r * 0.65);
        ctx.fillStyle = '#111827';
        // Left lens
        ctx.fillRect(-26, -10, 22, 16);
        // Right lens
        ctx.fillRect(4, -10, 22, 16);
        // Bridge
        ctx.fillRect(-4, -6, 8, 4);
        // Highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-22, -7);
        ctx.lineTo(-10, 3);
        ctx.lineTo(-7, 3);
        ctx.lineTo(-19, -7);
        ctx.fill();
        break;

      case 'flower':
        // Flower headband
        [-16, 0, 16].forEach((fx, idx) => {
          ctx.fillStyle = ['#ff70a6', '#ffd166', '#70d6ff'][idx];
          ctx.beginPath();
          ctx.arc(fx, -6, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx, -6, 3, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'wizard':
        // Purple star wizard hat
        ctx.fillStyle = '#7209b7';
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.quadraticCurveTo(0, -45, 12, -50);
        ctx.quadraticCurveTo(8, -25, 18, 0);
        ctx.fill();
        // Star on hat
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(3, -25, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  drawThoughtBubble(ctx, bx, by) {
    const food = FOOD_DATA[this.desiredFood];
    if (!food) return;

    ctx.save();
    ctx.translate(bx, by);

    // Cute bubble pop floating animation
    const bob = Math.sin(Date.now() * 0.005 + this.idleOffset) * 3;
    ctx.translate(0, bob);

    // Little tail bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(-8, 18, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-4, 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Main cloud bubble
    ctx.beginPath();
    ctx.roundRect(-26, -18, 52, 36, 16);
    ctx.fill();
    ctx.stroke();

    // Snack Emoji or Color Icon
    ctx.font = '22px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.emoji, 0, 0);

    ctx.restore();
  }

  drawHungerBar(ctx, bx, by) {
    const width = 60;
    const height = 8;
    const progress = Math.max(0, this.hungerCurrent / this.hungerMax);

    ctx.save();
    ctx.translate(bx - width / 2, by);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 4);
    ctx.fill();

    // Fill bar
    ctx.fillStyle = progress > 0.4 ? '#10b981' : progress > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(1, 1, (width - 2) * progress, height - 2, 3);
    ctx.fill();

    ctx.restore();
  }
}

window.CRITTER_TYPES = CRITTER_TYPES;
window.FOOD_DATA = FOOD_DATA;
window.Critter = Critter;

