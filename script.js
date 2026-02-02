// --- LOGIQUE UI ---
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const shyMsg = document.getElementById('shyMsg');
const proposalBox = document.getElementById('proposalBox');
const successBox = document.getElementById('successBox');

// Faire fuir le bouton No
noBtn.addEventListener('mouseover', () => {
  const x = Math.random() * (window.innerWidth - noBtn.offsetWidth - 20);
  const y = Math.random() * (window.innerHeight - noBtn.offsetHeight - 20);

  noBtn.style.position = 'fixed';
  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';

  shyMsg.style.opacity = '1';
});

// Accepter
yesBtn.addEventListener('click', () => {
  proposalBox.style.display = 'none';
  successBox.style.display = 'flex';
  startImpressiveFireworks();
});

// --- MOTEUR DE FEUX D'ARTIFICES AVANCÉ ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let cw = window.innerWidth;
let ch = window.innerHeight;

let fireworks = [];
let particles = [];
let timerTotal = 80;
let timerTick = 0;

function resizeCanvas() {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function calculateDistance(p1x, p1y, p2x, p2y) {
  return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
}

// --- CLASSE FEU D'ARTIFICE (LA FUSÉE QUI MONTE) ---
class Firework {
  constructor(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;

    this.coordinates = [];
    this.coordinateCount = 3;
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }

    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
  }

  update(index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    this.speed *= this.acceleration;

    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;

    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty);
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = 'hsl(' + random(0, 360) + ', 100%, ' + this.brightness + '%)';
    ctx.stroke();
  }
}

// --- CLASSE PARTICULE (L'EXPLOSION) ---
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.coordinates = [];
    this.coordinateCount = 5;
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }

    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95;
    this.gravity = 1;

    this.hue = random(0, 360);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.015, 0.03);
  }

  update(index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;

    this.alpha -= this.decay;

    if (this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);

    ctx.strokeStyle =
      'hsla(' +
      this.hue +
      ', 100%, ' +
      this.brightness +
      '%, ' +
      this.alpha +
      ')';
    ctx.stroke();
  }
}

function createParticles(x, y) {
  let particleCount = 50;
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}

let isLoopRunning = false;

function loop() {
  if (!isLoopRunning) return;
  requestAnimationFrame(loop);

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, cw, ch);

  ctx.globalCompositeOperation = 'lighter';

  let i = fireworks.length;
  while (i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  let j = particles.length;
  while (j--) {
    particles[j].draw();
    particles[j].update(j);
  }

  if (timerTick >= timerTotal) {
    // Feux automatiques
    fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
    timerTick = 0;
  } else {
    timerTick++;
  }
}

function startImpressiveFireworks() {
  fireworks.push(new Firework(cw / 2, ch, cw / 4, ch / 4));
  fireworks.push(new Firework(cw / 2, ch, cw * 0.75, ch / 4));

  if (!isLoopRunning) {
    isLoopRunning = true;
    loop();
  }
}
