const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const comboEl = document.querySelector('#combo');
const heatEl = document.querySelector('#heat');
const speedEl = document.querySelector('#speed');
const startButton = document.querySelector('#startButton');

const keys = new Set();
const state = {
  running: false,
  time: 0,
  score: 0,
  combo: 1,
  heat: 0,
  speed: 0,
  shake: 0,
  flash: 0,
  lightning: 0,
  nextCar: 0,
  nextHazard: 0,
  nextDrone: 4,
  roadOffset: 0,
  rainOffset: 0,
};

const player = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  w: 54,
  h: 92,
  armor: 100,
  nitro: 1,
  invincible: 0,
};

const traffic = [];
const particles = [];
const sparks = [];
const hazards = [];
const drones = [];
const pickups = [];

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  player.x = player.x || innerWidth / 2;
  player.y = innerHeight * 0.78;
}

function resetGame() {
  traffic.length = 0;
  particles.length = 0;
  sparks.length = 0;
  hazards.length = 0;
  drones.length = 0;
  pickups.length = 0;
  Object.assign(state, {
    running: true,
    time: 0,
    score: 0,
    combo: 1,
    heat: 12,
    speed: 180,
    shake: 0,
    flash: 0,
    lightning: 0,
    nextCar: 0,
    nextHazard: 1.5,
    nextDrone: 6,
    roadOffset: 0,
  });
  Object.assign(player, {
    x: innerWidth / 2,
    y: innerHeight * 0.78,
    vx: 0,
    vy: 0,
    armor: 100,
    nitro: 1,
    invincible: 1.3,
  });
  startButton.classList.add('hidden');
}

function roadAt(y) {
  const horizon = innerHeight * 0.24;
  const t = clamp((y - horizon) / (innerHeight - horizon), 0, 1);
  const center = innerWidth / 2 + Math.sin(state.time * 0.55 + t * 2.8) * 70 * t;
  const width = lerp(innerWidth * 0.18, innerWidth * 0.86, t);
  return { center, width, t };
}

function spawnCar() {
  const y = innerHeight * 0.18;
  const road = roadAt(y);
  const lane = Math.floor(rand(0, 5));
  const laneX = road.center - road.width * 0.38 + lane * road.width * 0.19;
  traffic.push({
    x: laneX + rand(-18, 18),
    y,
    z: rand(0.25, 0.7),
    vx: rand(-22, 22),
    vy: rand(115, 250) + state.speed * 0.35,
    w: rand(38, 58),
    h: rand(70, 110),
    hue: rand(0, 360),
    spin: 0,
    damage: 0,
    angry: Math.random() < 0.22,
  });
}

function spawnHazard() {
  const y = innerHeight * 0.22;
  const road = roadAt(y);
  hazards.push({
    x: road.center + rand(-road.width * 0.35, road.width * 0.35),
    y,
    r: rand(18, 34),
    vy: rand(180, 310) + state.speed * 0.28,
    type: Math.random() > 0.5 ? 'oil' : 'barrel',
    spin: rand(-5, 5),
  });
}

function spawnDrone() {
  drones.push({
    x: rand(innerWidth * 0.15, innerWidth * 0.85),
    y: innerHeight * 0.12,
    vx: rand(-90, 90),
    vy: rand(75, 125),
    t: 0,
    fire: 1.5,
  });
}

function explode(x, y, color = '#ff3b74', amount = 44) {
  state.shake = Math.min(28, state.shake + 9);
  state.flash = Math.min(0.55, state.flash + 0.15);
  for (let i = 0; i < amount; i++) {
    const a = rand(0, Math.PI * 2);
    const s = rand(60, 520);
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(0.35, 1.2),
      max: 1,
      size: rand(2, 9),
      color,
      gravity: rand(240, 620),
    });
  }
}

function rectsOverlap(a, b, padding = 0) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 - padding && Math.abs(a.y - b.y) < (a.h + b.h) / 2 - padding;
}

function update(dt) {
  if (!state.running) return;
  state.time += dt;
  state.speed = clamp(state.speed + dt * 3.5, 180, 390);
  state.heat = clamp(state.heat + dt * 1.7 + state.combo * 0.01, 0, 100);
  state.roadOffset += dt * state.speed * 2.15;
  state.rainOffset += dt * 1900;
  state.shake = Math.max(0, state.shake - dt * 26);
  state.flash = Math.max(0, state.flash - dt * 1.6);
  state.lightning = Math.max(0, state.lightning - dt * 3.5);
  player.invincible = Math.max(0, player.invincible - dt);
  player.nitro = clamp(player.nitro + dt * 0.09, 0, 1);

  const left = keys.has('ArrowLeft') || keys.has('a');
  const right = keys.has('ArrowRight') || keys.has('d');
  const up = keys.has('ArrowUp') || keys.has('w');
  const down = keys.has('ArrowDown') || keys.has('s');
  const drifting = keys.has('Shift') && player.nitro > 0;
  const thrust = drifting ? 2.1 : 1;
  player.vx += ((right ? 1 : 0) - (left ? 1 : 0)) * 900 * thrust * dt;
  player.vy += ((down ? 1 : 0) - (up ? 1 : 0)) * 620 * dt;
  if (drifting && (left || right || up)) {
    player.nitro = Math.max(0, player.nitro - dt * 0.38);
    state.speed = clamp(state.speed + dt * 55, 0, 460);
    addSparks(player.x, player.y + 45, right ? -1 : 1, '#39f7ff');
  }
  player.vx *= Math.pow(0.045, dt);
  player.vy *= Math.pow(0.075, dt);
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  const road = roadAt(player.y);
  player.x = clamp(player.x, road.center - road.width * 0.46, road.center + road.width * 0.46);
  player.y = clamp(player.y, innerHeight * 0.38, innerHeight * 0.9);

  state.nextCar -= dt;
  state.nextHazard -= dt;
  state.nextDrone -= dt;
  if (state.nextCar <= 0) {
    spawnCar();
    state.nextCar = rand(0.18, 0.55) * clamp(1.2 - state.heat / 150, 0.46, 1.1);
  }
  if (state.nextHazard <= 0) {
    spawnHazard();
    state.nextHazard = rand(1.2, 2.4);
  }
  if (state.nextDrone <= 0) {
    spawnDrone();
    state.nextDrone = rand(5, 9) * clamp(1.2 - state.heat / 130, 0.55, 1.2);
  }
  if (Math.random() < dt * 0.18) state.lightning = 1;

  updateTraffic(dt);
  updateHazards(dt);
  updateDrones(dt);
  updateParticles(dt);
  updatePickups(dt);

  state.score += dt * state.speed * state.combo;
  if (player.armor <= 0) endGame();
  updateHud();
}

function updateTraffic(dt) {
  for (let i = traffic.length - 1; i >= 0; i--) {
    const car = traffic[i];
    const road = roadAt(car.y);
    car.y += car.vy * dt;
    car.x += (car.vx + Math.sin(state.time * 3 + car.y * 0.01) * (car.angry ? 80 : 18)) * dt;
    car.x = clamp(car.x, road.center - road.width * 0.48, road.center + road.width * 0.48);
    car.spin *= 0.96;
    car.damage = Math.max(0, car.damage - dt * 0.5);

    if (rectsOverlap(player, car, 18) && player.invincible <= 0) {
      player.armor -= car.angry ? 22 : 16;
      player.invincible = 0.55;
      car.damage = 1;
      car.spin = rand(-1.4, 1.4);
      car.vx += Math.sign(car.x - player.x || 1) * rand(210, 430);
      state.combo = 1;
      explode((player.x + car.x) / 2, (player.y + car.y) / 2, '#ffcb47', 28);
    } else if (Math.abs(player.y - car.y) < 120 && Math.abs(player.x - car.x) < 92 && car.y > player.y - 30) {
      state.combo = clamp(state.combo + dt * 1.9, 1, 12);
      state.score += 25 * state.combo;
      addSparks(car.x, car.y, Math.sign(car.x - player.x), '#fff3a3');
    }

    if (car.y > innerHeight + 160) traffic.splice(i, 1);
  }
}

function updateHazards(dt) {
  for (let i = hazards.length - 1; i >= 0; i--) {
    const hz = hazards[i];
    hz.y += hz.vy * dt;
    hz.x += Math.sin(state.time * 4 + hz.y) * 24 * dt;
    hz.spin += dt * 2;
    if (Math.hypot(player.x - hz.x, player.y - hz.y) < hz.r + 36 && player.invincible <= 0) {
      if (hz.type === 'oil') {
        player.vx += rand(-850, 850);
        player.vy += rand(-320, 180);
        state.shake += 7;
      } else {
        player.armor -= 24;
        explode(hz.x, hz.y, '#ff5b21', 56);
      }
      hazards.splice(i, 1);
    } else if (hz.y > innerHeight + 80) hazards.splice(i, 1);
  }
}

function updateDrones(dt) {
  for (let i = drones.length - 1; i >= 0; i--) {
    const drone = drones[i];
    drone.t += dt;
    drone.fire -= dt;
    drone.x += (drone.vx + Math.sin(drone.t * 4) * 70) * dt;
    drone.y += drone.vy * dt;
    if (drone.fire <= 0) {
      drone.fire = rand(1.1, 2.1);
      hazards.push({ x: drone.x, y: drone.y + 35, r: 15, vy: 450, type: 'barrel', spin: 0 });
      addSparks(drone.x, drone.y + 28, 0, '#ff2d87');
    }
    if (Math.hypot(player.x - drone.x, player.y - drone.y) < 70) {
      explode(drone.x, drone.y, '#7ef9ff', 42);
      state.score += 1500;
      pickups.push({ x: drone.x, y: drone.y, vy: 280, r: 18, type: 'repair' });
      drones.splice(i, 1);
    } else if (drone.y > innerHeight + 120) drones.splice(i, 1);
  }
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.y += p.vy * dt;
    if (Math.hypot(player.x - p.x, player.y - p.y) < p.r + 36) {
      player.armor = clamp(player.armor + 22, 0, 100);
      state.combo += 1;
      pickups.splice(i, 1);
    } else if (p.y > innerHeight + 50) pickups.splice(i, 1);
  }
}

function addSparks(x, y, dir, color) {
  for (let i = 0; i < 3; i++) {
    sparks.push({ x, y, vx: rand(80, 260) * (dir || rand(-1, 1)), vy: rand(-60, 120), life: rand(0.18, 0.35), color });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.life -= dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vx *= Math.pow(0.01, dt);
    if (s.life <= 0) sparks.splice(i, 1);
  }
}

function shockwave() {
  if (!state.running || player.nitro < 0.35) return;
  player.nitro -= 0.35;
  state.shake += 16;
  state.flash = 0.55;
  for (const car of traffic) {
    const d = Math.hypot(car.x - player.x, car.y - player.y);
    if (d < 260) {
      car.vx += ((car.x - player.x) / Math.max(1, d)) * 920;
      car.vy += ((car.y - player.y) / Math.max(1, d)) * 420;
      car.damage = 1;
      state.score += 500;
    }
  }
  for (let i = drones.length - 1; i >= 0; i--) {
    const d = Math.hypot(drones[i].x - player.x, drones[i].y - player.y);
    if (d < 300) {
      explode(drones[i].x, drones[i].y, '#89f7ff', 42);
      drones.splice(i, 1);
      state.score += 1000;
    }
  }
  explode(player.x, player.y, '#89f7ff', 24);
}

function endGame() {
  state.running = false;
  startButton.querySelector('strong').textContent = 'Run wrecked — restart?';
  startButton.querySelector('small').textContent = `Final score ${Math.floor(state.score).toLocaleString()} with peak chaos heat ${Math.floor(state.heat)}%.`;
  startButton.classList.remove('hidden');
  explode(player.x, player.y, '#ff234f', 90);
}

function updateHud() {
  scoreEl.textContent = Math.floor(state.score).toLocaleString();
  comboEl.textContent = `x${state.combo.toFixed(1)}`;
  heatEl.textContent = `${Math.floor(state.heat)}%`;
  speedEl.textContent = Math.floor(state.speed).toString();
}

function draw() {
  const sx = rand(-state.shake, state.shake);
  const sy = rand(-state.shake, state.shake);
  ctx.save();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.translate(sx, sy);
  drawSky();
  drawRoad();
  drawHazards();
  drawPickups();
  drawTraffic();
  drawDrones();
  drawPlayer();
  drawParticles();
  drawWeather();
  drawVignette();
  ctx.restore();
  if (state.flash > 0 || state.lightning > 0) {
    ctx.fillStyle = `rgba(190, 235, 255, ${Math.max(state.flash, state.lightning * 0.22)})`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, innerHeight);
  g.addColorStop(0, '#08091e');
  g.addColorStop(0.38, '#151035');
  g.addColorStop(1, '#16070f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  for (let i = 0; i < 34; i++) {
    const x = ((i * 173 + state.time * (18 + i % 4)) % (innerWidth + 260)) - 130;
    const h = 80 + (i * 37) % 240;
    const w = 35 + (i * 19) % 95;
    const y = innerHeight * 0.25 - h * 0.5 + (i % 5) * 10;
    ctx.fillStyle = `rgba(${20 + i % 4 * 22}, ${24 + i % 3 * 18}, ${52 + i % 5 * 28}, 0.72)`;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = i % 3 === 0 ? '#ff2d87' : '#2ee9ff';
    ctx.globalAlpha = 0.28;
    ctx.fillRect(x + 7, y + 15 + (i % 7) * 5, w - 14, 4);
    ctx.globalAlpha = 1;
  }
}

function drawRoad() {
  const horizon = innerHeight * 0.24;
  const roadTop = roadAt(horizon);
  const roadBottom = roadAt(innerHeight);
  ctx.beginPath();
  ctx.moveTo(roadTop.center - roadTop.width / 2, horizon);
  ctx.lineTo(roadTop.center + roadTop.width / 2, horizon);
  ctx.lineTo(roadBottom.center + roadBottom.width / 2, innerHeight + 40);
  ctx.lineTo(roadBottom.center - roadBottom.width / 2, innerHeight + 40);
  ctx.closePath();
  const roadGradient = ctx.createLinearGradient(0, horizon, 0, innerHeight);
  roadGradient.addColorStop(0, '#151826');
  roadGradient.addColorStop(1, '#090a10');
  ctx.fillStyle = roadGradient;
  ctx.fill();

  for (let i = 0; i < 42; i++) {
    const y = horizon + ((i * 46 + state.roadOffset) % (innerHeight - horizon + 90));
    const road = roadAt(y);
    const t = road.t;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + t * 0.42})`;
    const stripeW = lerp(2, 12, t);
    const stripeH = lerp(12, 70, t);
    for (let lane = -1; lane <= 1; lane++) {
      ctx.fillRect(road.center + lane * road.width * 0.19 - stripeW / 2, y, stripeW, stripeH);
    }
    ctx.fillStyle = `rgba(0, 229, 255, ${0.25 + t * 0.25})`;
    ctx.fillRect(road.center - road.width * 0.5, y, stripeW, stripeH * 0.8);
    ctx.fillStyle = `rgba(255, 25, 118, ${0.25 + t * 0.25})`;
    ctx.fillRect(road.center + road.width * 0.5, y, stripeW, stripeH * 0.8);
  }
}

function drawVehicle(x, y, w, h, hue, angle = 0, glow = 0.35) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.shadowBlur = 26;
  ctx.shadowColor = `hsla(${hue}, 100%, 62%, ${glow})`;
  const body = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  body.addColorStop(0, `hsl(${hue}, 90%, 58%)`);
  body.addColorStop(0.5, '#d8efff');
  body.addColorStop(1, `hsl(${(hue + 55) % 360}, 90%, 38%)`);
  roundRect(-w / 2, -h / 2, w, h, 12, body);
  ctx.shadowBlur = 0;
  roundRect(-w * 0.33, -h * 0.27, w * 0.66, h * 0.38, 8, 'rgba(5, 12, 24, 0.78)');
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(-w * 0.36, -h * 0.48, w * 0.26, 5);
  ctx.fillRect(w * 0.1, -h * 0.48, w * 0.26, 5);
  ctx.fillStyle = '#ff174f';
  ctx.fillRect(-w * 0.38, h * 0.42, w * 0.23, 7);
  ctx.fillRect(w * 0.15, h * 0.42, w * 0.23, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.58)';
  ctx.fillRect(-w * 0.58, -h * 0.32, 7, h * 0.22);
  ctx.fillRect(w * 0.46, -h * 0.32, 7, h * 0.22);
  ctx.fillRect(-w * 0.58, h * 0.14, 7, h * 0.22);
  ctx.fillRect(w * 0.46, h * 0.14, 7, h * 0.22);
  ctx.restore();
}

function drawTraffic() {
  for (const car of traffic) drawVehicle(car.x, car.y, car.w, car.h, car.hue, car.spin, car.damage ? 0.9 : 0.25);
}

function drawPlayer() {
  const angle = clamp(player.vx / 1100, -0.32, 0.32);
  drawVehicle(player.x, player.y, player.w, player.h, 195, angle, 0.8);
  ctx.save();
  ctx.translate(player.x, player.y + player.h * 0.48);
  const flame = ctx.createLinearGradient(0, 0, 0, 70);
  flame.addColorStop(0, 'rgba(90, 245, 255, 0.95)');
  flame.addColorStop(0.5, 'rgba(255, 60, 168, 0.65)');
  flame.addColorStop(1, 'rgba(255, 154, 32, 0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(0, 45 + Math.random() * 35 * (0.3 + player.nitro));
  ctx.lineTo(18, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = `rgba(100, 235, 255, ${0.18 + player.nitro * 0.4})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 76 + Math.sin(state.time * 8) * 4, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHazards() {
  for (const hz of hazards) {
    ctx.save();
    ctx.translate(hz.x, hz.y);
    ctx.rotate(hz.spin);
    if (hz.type === 'oil') {
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, hz.r * 1.7);
      g.addColorStop(0, 'rgba(12, 7, 22, 0.88)');
      g.addColorStop(0.55, 'rgba(115, 31, 180, 0.42)');
      g.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, hz.r * 1.8, hz.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      roundRect(-hz.r, -hz.r, hz.r * 2, hz.r * 2, 8, '#ff5d1f');
      ctx.fillStyle = '#ffe05c';
      ctx.fillRect(-hz.r, -4, hz.r * 2, 8);
    }
    ctx.restore();
  }
}

function drawDrones() {
  for (const drone of drones) {
    ctx.save();
    ctx.translate(drone.x, drone.y);
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff2d87';
    roundRect(-34, -16, 68, 32, 14, '#1a1b34');
    ctx.fillStyle = '#ff2d87';
    ctx.fillRect(-8, -5, 16, 10);
    ctx.strokeStyle = '#7ef9ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-42, 0, 12, 0, Math.PI * 2);
    ctx.arc(42, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPickups() {
  for (const p of pickups) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(state.time * 5);
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#4cff7a';
    roundRect(-14, -14, 28, 28, 7, '#4cff7a');
    ctx.fillStyle = '#06230e';
    ctx.fillRect(-3, -10, 6, 20);
    ctx.fillRect(-10, -3, 20, 6);
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = clamp(p.life / 1.2, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 18;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  for (const s of sparks) {
    ctx.strokeStyle = s.color;
    ctx.globalAlpha = clamp(s.life * 4, 0, 1);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawWeather() {
  ctx.strokeStyle = 'rgba(190, 232, 255, 0.28)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 150; i++) {
    const x = (i * 83 + state.rainOffset * 0.42) % (innerWidth + 120) - 60;
    const y = (i * 47 + state.rainOffset) % (innerHeight + 90) - 45;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 20, y + 54);
    ctx.stroke();
  }
}

function drawVignette() {
  const g = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, innerHeight * 0.1, innerWidth / 2, innerHeight / 2, innerWidth * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  ctx.fillStyle = 'rgba(255, 45, 135, 0.16)';
  ctx.fillRect(20, innerHeight - 26, innerWidth * (player.armor / 100) * 0.28, 8);
  ctx.fillStyle = 'rgba(80, 245, 255, 0.2)';
  ctx.fillRect(20, innerHeight - 12, innerWidth * player.nitro * 0.28, 6);
}

function roundRect(x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

addEventListener('resize', resize);
addEventListener('keydown', (event) => {
  keys.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  if (event.code === 'Space') {
    event.preventDefault();
    shockwave();
  }
});
addEventListener('keyup', (event) => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
startButton.addEventListener('click', resetGame);

resize();
updateHud();
requestAnimationFrame(frame);
