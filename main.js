import './style.css';
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
camera.position.set(-3, 0, 30);

// Pure black space background with subtle star dust
const bgC = document.createElement('canvas');
bgC.width = bgC.height = 2048;
const ctx = bgC.getContext('2d');
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 2048, 2048);
for (let i = 0; i < 1500; i++) {
  const x = Math.random() * 2048, y = Math.random() * 2048;
  const b = Math.random();
  ctx.beginPath();
  ctx.arc(x, y, b > 0.95 ? 1.2 : 0.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${0.05 + b * 0.25})`;
  ctx.fill();
}
scene.background = new THREE.CanvasTexture(bgC);

// Lights
const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(15, 10, 10);
const fillLight = new THREE.DirectionalLight(0x8888cc, 0.6);
fillLight.position.set(-10, -5, -10);
const ambient = new THREE.AmbientLight(0x444466, 2);
scene.add(sunLight, fillLight, ambient);

function makeTexture(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  return new THREE.CanvasTexture(c);
}

// SUN — textured glowing star
const sunTex = makeTexture(512, 256, (c, w, h) => {
  const g = c.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.15, '#fff4cc');
  g.addColorStop(0.4, '#ffaa44'); g.addColorStop(0.7, '#ff6600');
  g.addColorStop(1, '#cc3300');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) {
    c.beginPath(); c.arc(Math.random()*w, Math.random()*h, Math.random()*2.5, 0, Math.PI*2);
    c.fillStyle = `rgba(255,${100+Math.random()*155},0,${Math.random()*0.25})`; c.fill();
  }
});
// (Sun removed — hero planet is the star of the show)

// HERO PLANET — large textured planet that dominates the first view
const heroPlanetTex = makeTexture(1024, 512, (c, w, h) => {
  // Deep blue/purple gas giant
  c.fillStyle = '#0a0820'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const hue = 240 + Math.sin(y * 0.03) * 25 + Math.sin(y * 0.1) * 8;
    const sat = 55 + Math.sin(y * 0.05) * 20;
    const light = 12 + Math.sin(y * 0.06) * 6 + Math.random() * 2;
    c.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
    c.fillRect(0, y, w, 1.5);
  }
  // Storms
  for (let i = 0; i < 10; i++) {
    const cx = Math.random()*w, cy = Math.random()*h;
    const sg = c.createRadialGradient(cx, cy, 0, cx, cy, 10+Math.random()*25);
    sg.addColorStop(0, `rgba(${80+Math.random()*60},${40+Math.random()*40},${150+Math.random()*80},0.3)`);
    sg.addColorStop(1, 'rgba(10,5,30,0)');
    c.fillStyle = sg; c.fillRect(cx-40, cy-40, 80, 80);
  }
});
const heroPlanet = new THREE.Mesh(
  new THREE.SphereGeometry(6, 64, 64),
  new THREE.MeshStandardMaterial({ map: heroPlanetTex, metalness: 0.2, roughness: 0.5 })
);
heroPlanet.position.set(12, -4, 8);
scene.add(heroPlanet);

// Hero planet atmosphere
const heroAtmo = new THREE.Mesh(
  new THREE.SphereGeometry(6.3, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0x6644cc, transparent: true, opacity: 0.06, side: THREE.BackSide })
);
heroAtmo.position.copy(heroPlanet.position);
scene.add(heroAtmo);

// Hero planet ring (Saturn-style)
const heroRingTex = makeTexture(512, 64, (c, w, h) => {
  for (let x = 0; x < w; x++) {
    const b = 30 + Math.sin(x * 0.08) * 15 + Math.random() * 10;
    c.fillStyle = `rgba(${b+50},${b+30},${b+80},${0.4 + Math.sin(x*0.04)*0.25})`;
    c.fillRect(x, 0, 1, h);
  }
});
const heroRing = new THREE.Mesh(
  new THREE.RingGeometry(8, 12, 100),
  new THREE.MeshStandardMaterial({ map: heroRingTex, side: THREE.DoubleSide, transparent: true, opacity: 0.5, metalness: 0.3, roughness: 0.6 })
);
heroRing.position.copy(heroPlanet.position);
heroRing.rotation.x = Math.PI / 2.5;
heroRing.rotation.z = 0.15;
scene.add(heroRing);

// Small orbiting moons around hero planet
const heroMoons = [];
for (let i = 0; i < 3; i++) {
  const colors = [0xaaaaaa, 0xcc9966, 0x88aacc];
  const moonTex2 = makeTexture(128, 64, (c, w, h) => {
    c.fillStyle = ['#888888','#aa8855','#6688aa'][i]; c.fillRect(0,0,w,h);
    for (let j = 0; j < 300; j++) {
      c.beginPath(); c.arc(Math.random()*w, Math.random()*h, Math.random()*3, 0, Math.PI*2);
      c.fillStyle = `rgba(0,0,0,${Math.random()*0.2})`; c.fill();
    }
  });
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.3 + i * 0.15, 32, 32),
    new THREE.MeshStandardMaterial({ map: moonTex2, metalness: 0.05, roughness: 0.85 })
  );
  m.userData = { radius: 8 + i * 2.5, speed: 0.4 - i * 0.1, offset: i * Math.PI * 0.7 };
  scene.add(m);
  heroMoons.push(m);
}

// Shooting stars (streaking bright lines)
const shootingStars = [];
for (let i = 0; i < 5; i++) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array([0,0,0, -2,0,0]);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  line.userData = { active: false, timer: Math.random() * 200, speed: 0.8 + Math.random() * 0.5 };
  scene.add(line);
  shootingStars.push(line);
}

// MOON
const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 64, 64),
  new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('moon.jpg'), normalMap: new THREE.TextureLoader().load('normal.jpg'), metalness: 0.05, roughness: 0.85 }));
moon.position.set(-14, -3, 35);
scene.add(moon);

// EARTH
const earthTex = makeTexture(1024, 512, (c, w, h) => {
  c.fillStyle='#0a1a3a'; c.fillRect(0,0,w,h);
  for(let i=0;i<12;i++){const cx=Math.random()*w,cy=Math.random()*h;
    const eg=c.createRadialGradient(cx,cy,0,cx,cy,20+Math.random()*60);
    eg.addColorStop(0,`rgba(${40+Math.random()*30},${80+Math.random()*40},${30+Math.random()*20},0.7)`);
    eg.addColorStop(1,'rgba(20,60,25,0)'); c.fillStyle=eg; c.fillRect(cx-80,cy-80,160,160);}
  for(let i=0;i<2000;i++){c.beginPath();c.arc(Math.random()*w,Math.random()*h,Math.random()*5,0,Math.PI*2);
    c.fillStyle=`rgba(255,255,255,${Math.random()*0.06})`;c.fill();}
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(3.5, 64, 64), new THREE.MeshStandardMaterial({ map: earthTex, metalness: 0.1, roughness: 0.65 }));
earth.position.set(-10, 6, 20);
scene.add(earth);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(3.7, 64, 64), new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.06, side: THREE.BackSide }));
atmo.position.copy(earth.position); scene.add(atmo);

// MARS
const marsTex = makeTexture(1024, 512, (c, w, h) => {
  const g=c.createLinearGradient(0,0,w,h); g.addColorStop(0,'#8b3a1a'); g.addColorStop(0.5,'#b05525'); g.addColorStop(1,'#6b2810');
  c.fillStyle=g; c.fillRect(0,0,w,h);
  for(let i=0;i<6000;i++){c.beginPath();c.arc(Math.random()*w,Math.random()*h,0.5+Math.random()*3,0,Math.PI*2);
    c.fillStyle=`rgba(${40+Math.random()*50},${10+Math.random()*25},${Math.random()*15},${0.1+Math.random()*0.3})`;c.fill();}
  for(let i=0;i<20;i++){const cx=Math.random()*w,cy=Math.random()*h,cr=4+Math.random()*18;
    const cg=c.createRadialGradient(cx,cy,cr*0.3,cx,cy,cr);cg.addColorStop(0,'rgba(40,15,8,0.4)');cg.addColorStop(1,'rgba(40,15,8,0)');
    c.fillStyle=cg;c.fillRect(cx-cr,cy-cr,cr*2,cr*2);}
});
const mars = new THREE.Mesh(new THREE.SphereGeometry(3, 64, 64), new THREE.MeshStandardMaterial({ map: marsTex, metalness: 0.05, roughness: 0.9 }));
mars.position.set(18, 5, 50); scene.add(mars);

// GAS GIANT
const gasTex = makeTexture(1024, 512, (c, w, h) => {
  c.fillStyle='#1a1040'; c.fillRect(0,0,w,h);
  for(let y=0;y<h;y++){const hue=220+Math.sin(y*0.04)*30+Math.sin(y*0.12)*10;
    c.fillStyle=`hsl(${hue},${40+Math.sin(y*0.06)*15}%,${18+Math.sin(y*0.07)*8+Math.random()*3}%)`;c.fillRect(0,y,w,1.5);}
  for(let i=0;i<8;i++){const cx=Math.random()*w,cy=Math.random()*h;
    const sg=c.createRadialGradient(cx,cy,0,cx,cy,8+Math.random()*20);sg.addColorStop(0,'rgba(100,80,180,0.35)');sg.addColorStop(1,'rgba(20,10,40,0)');
    c.fillStyle=sg;c.fillRect(cx-30,cy-30,60,60);}
});
const gasGiant = new THREE.Mesh(new THREE.SphereGeometry(5.5, 64, 64), new THREE.MeshStandardMaterial({ map: gasTex, metalness: 0.15, roughness: 0.55 }));
gasGiant.position.set(-20, 8, 60); scene.add(gasGiant);
const ringTex = makeTexture(512, 64, (c, w, h) => {
  for(let x=0;x<w;x++){const b=40+Math.sin(x*0.1)*20+Math.random()*15;
    c.fillStyle=`rgba(${b+30},${b+20},${b+50},${0.5+Math.sin(x*0.05)*0.3})`;c.fillRect(x,0,1,h);}
});
const gasRing = new THREE.Mesh(new THREE.RingGeometry(7, 11, 100),
  new THREE.MeshStandardMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.6, metalness: 0.2, roughness: 0.7 }));
gasRing.position.copy(gasGiant.position); gasRing.rotation.x = Math.PI / 2.2; scene.add(gasRing);

// ICE PLANET
const iceTex = makeTexture(1024, 512, (c, w, h) => {
  const g=c.createRadialGradient(w*0.4,h*0.4,0,w/2,h/2,w*0.6);
  g.addColorStop(0,'#c0e8ff');g.addColorStop(0.3,'#5aafcc');g.addColorStop(0.7,'#2a7a99');g.addColorStop(1,'#1a4a60');
  c.fillStyle=g;c.fillRect(0,0,w,h);
  for(let i=0;i<60;i++){c.beginPath();c.moveTo(Math.random()*w,Math.random()*h);
    for(let j=0;j<6;j++)c.lineTo(Math.random()*w,Math.random()*h);
    c.strokeStyle=`rgba(200,240,255,${0.04+Math.random()*0.08})`;c.lineWidth=0.5+Math.random()*1.5;c.stroke();}
  for(let i=0;i<1500;i++){c.beginPath();c.arc(Math.random()*w,Math.random()*h,Math.random()*3,0,Math.PI*2);
    c.fillStyle=`rgba(230,245,255,${Math.random()*0.12})`;c.fill();}
});
const icePlanet = new THREE.Mesh(new THREE.SphereGeometry(2.5, 64, 64), new THREE.MeshStandardMaterial({ map: iceTex, metalness: 0.25, roughness: 0.45 }));
icePlanet.position.set(12, -8, 45); scene.add(icePlanet);

// BLACK HOLE
const bhGroup = new THREE.Group(); bhGroup.position.set(16, 2, 42);
bhGroup.add(new THREE.Mesh(new THREE.SphereGeometry(4, 64, 64), new THREE.MeshBasicMaterial({ color: 0x000000 })));
const accTex = makeTexture(512, 64, (c, w, h) => {
  for(let x=0;x<w;x++){const t2=x/w;const r=Math.floor(255*(0.8-t2*0.5));const g2=Math.floor(180*(0.6-t2*0.3)+Math.random()*20);const b=Math.floor(50*(1-t2)+Math.random()*20);
    c.fillStyle=`rgb(${r},${g2},${b})`;c.fillRect(x,0,1,h);}
});
const accDisk = new THREE.Mesh(new THREE.RingGeometry(5.5, 14, 100, 3),
  new THREE.MeshBasicMaterial({ map: accTex, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
accDisk.rotation.x = Math.PI / 2.1; bhGroup.add(accDisk);
const photonRing = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.15, 32, 200),
  new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xffaa22, emissiveIntensity: 1, metalness: 0.8, roughness: 0.1 }));
photonRing.rotation.x = Math.PI / 2.1; bhGroup.add(photonRing);
bhGroup.add(new THREE.Mesh(new THREE.SphereGeometry(7, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.05 })));
scene.add(bhGroup);

// STARS
const stars = [];
for (let i = 0; i < 400; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  s.position.set(...Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200)));
  scene.add(s); stars.push(s);
}

// Scroll camera
let mouseX = 0, mouseY = 0;
let targetRotX = 0, targetRotY = 0;
let targetPosX = 0, targetPosY = 0;

addEventListener('mousemove', (e) => {
  // Normalize mouse to -1 to 1
  mouseX = (e.clientX / innerWidth) * 2 - 1;
  mouseY = (e.clientY / innerHeight) * 2 - 1;
});

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.z = t * -0.008 + 30;
  camera.position.x = t * -0.0002 - 3;
  camera.rotation.y = t * -0.00015;
}
document.body.onscroll = moveCamera;

// Animate
const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // === CURSOR PARALLAX — smooth follow ===
  targetRotY += (mouseX * 0.3 - targetRotY) * 0.04;
  targetRotX += (-mouseY * 0.15 - targetRotX) * 0.04;
  targetPosX += (mouseX * 3 - targetPosX) * 0.03;
  targetPosY += (-mouseY * 2 - targetPosY) * 0.03;

  // Tilt entire scene based on cursor
  scene.rotation.y = targetRotY;
  scene.rotation.x = targetRotX;

  // HERO PLANET — moves opposite to cursor for deep parallax
  heroPlanet.position.x = 12 - targetPosX * 0.8;
  heroPlanet.position.y = -4 + Math.sin(t * 0.25) * 0.6 + targetPosY * 0.5;
  heroPlanet.rotation.y = t * 0.035;
  heroAtmo.position.x = heroPlanet.position.x;
  heroAtmo.position.y = heroPlanet.position.y;
  heroRing.position.x = heroPlanet.position.x;
  heroRing.position.y = heroPlanet.position.y;
  heroRing.rotation.z = 0.15 + Math.sin(t * 0.3) * 0.03;

  // Earth — lighter parallax
  earth.position.x = -10 + targetPosX * 0.4;
  earth.position.y = 6 - targetPosY * 0.3;
  earth.rotation.y = t * 0.07;
  atmo.position.x = earth.position.x;
  atmo.position.y = earth.position.y;
  atmo.rotation.y = t * 0.05;

  // Orbiting moons
  heroMoons.forEach(m => {
    const a = t * m.userData.speed + m.userData.offset;
    const r = m.userData.radius;
    m.position.x = heroPlanet.position.x + Math.cos(a) * r;
    m.position.z = heroPlanet.position.z + Math.sin(a) * r * 0.4;
    m.position.y = heroPlanet.position.y + Math.sin(a) * r * 0.2;
    m.rotation.y = t * 0.5;
  });

  // (Shooting stars removed)

  // Other planets — each with different parallax depth
  moon.rotation.y = t * 0.05;
  moon.position.y = -3 + Math.sin(t * 0.4) * 0.8 + targetPosY * 0.2;
  moon.position.x = -14 + targetPosX * 0.3;

  mars.rotation.y = t * 0.08;
  mars.position.y = 5 + Math.sin(t * 0.3 + 1) * 1.2 + targetPosY * 0.15;

  gasGiant.rotation.y = t * 0.03;
  gasGiant.position.y = 8 + Math.sin(t * 0.2) * 1 + targetPosY * 0.1;
  gasRing.rotation.z = t * 0.008;
  gasRing.position.y = gasGiant.position.y;

  icePlanet.rotation.y = t * 0.06;
  icePlanet.position.y = -8 + Math.sin(t * 0.35 + 2) * 0.6;

  bhGroup.rotation.y = t * 0.015; accDisk.rotation.z = t * 0.1; photonRing.rotation.z = t * 0.08;
  stars.forEach((s, i) => s.scale.setScalar(0.7 + Math.sin(t * 1.5 + i * 0.7) * 0.35));
  renderer.render(scene, camera);
})();

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
addEventListener('scroll', () => document.getElementById('navbar').classList.toggle('scrolled', scrollY > 80));
const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }), { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));


// ===== FUTURISTIC AI CURSOR =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const trailCanvas = document.getElementById('cursorTrail');
const tCtx = trailCanvas ? trailCanvas.getContext('2d') : null;

if (cursorDot && cursorRing && tCtx) {
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  // Neural network nodes — fixed orbit points that react to cursor
  const nodes = Array.from({ length: 12 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    baseX: 0, baseY: 0,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: 2 + Math.random() * 2,
    pulse: Math.random() * Math.PI * 2,
  }));
  nodes.forEach(n => { n.baseX = n.x; n.baseY = n.y; });

  // Data stream — recent cursor positions
  const stream = [];
  const maxStream = 30;

  function resizeTrailCanvas() {
    trailCanvas.width = innerWidth;
    trailCanvas.height = innerHeight;
  }
  resizeTrailCanvas();
  addEventListener('resize', () => {
    resizeTrailCanvas();
    nodes.forEach(n => {
      n.x = n.baseX = Math.random() * innerWidth;
      n.y = n.baseY = Math.random() * innerHeight;
    });
  });

  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  document.querySelectorAll('a, .work-card, .cred-row, .photo-frame').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.classList.add('hover'); cursorRing.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursorDot.classList.remove('hover'); cursorRing.classList.remove('hover'); });
  });

  let frame = 0;
  function tickCursor() {
    requestAnimationFrame(tickCursor);
    frame++;

    // Smooth ring follow
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    cursorDot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    cursorRing.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;

    // Record data stream (every 2 frames)
    if (frame % 2 === 0) {
      stream.push({ x: mx, y: my, age: 0 });
      if (stream.length > maxStream) stream.shift();
    }
    stream.forEach(p => p.age++);

    tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    // --- DATA STREAM: smooth path behind cursor ---
    if (stream.length > 2) {
      tCtx.beginPath();
      tCtx.moveTo(stream[0].x, stream[0].y);
      for (let i = 1; i < stream.length; i++) {
        const prev = stream[i - 1];
        const cur = stream[i];
        const cpx = (prev.x + cur.x) / 2;
        const cpy = (prev.y + cur.y) / 2;
        tCtx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
      }
      const gradient = tCtx.createLinearGradient(
        stream[0].x, stream[0].y,
        stream[stream.length - 1].x, stream[stream.length - 1].y
      );
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(139, 123, 255, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 229, 255, 0.6)');
      tCtx.strokeStyle = gradient;
      tCtx.lineWidth = 1.5;
      tCtx.stroke();
    }

    // --- NEURAL NODES: drift, attract to cursor, pulse ---
    const t = frame * 0.02;
    nodes.forEach((n, i) => {
      // Drift slowly
      n.baseX += n.vx;
      n.baseY += n.vy;
      if (n.baseX < 0 || n.baseX > innerWidth) n.vx *= -1;
      if (n.baseY < 0 || n.baseY > innerHeight) n.vy *= -1;

      // Attract toward cursor
      const dx = mx - n.baseX;
      const dy = my - n.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pull = Math.max(0, 1 - dist / 350) * 30;
      n.x = n.baseX + (dx / dist) * pull;
      n.y = n.baseY + (dy / dist) * pull;

      // Pulse size
      const pulse = 1 + Math.sin(t + n.pulse) * 0.4;
      const r = n.radius * pulse;

      // Draw node
      tCtx.beginPath();
      tCtx.arc(n.x, n.y, r, 0, Math.PI * 2);
      const alpha = 0.3 + Math.sin(t + i) * 0.15;
      tCtx.fillStyle = i % 2 === 0
        ? `rgba(0, 229, 255, ${alpha})`
        : `rgba(139, 123, 255, ${alpha})`;
      tCtx.fill();

      // Glow
      tCtx.beginPath();
      tCtx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
      tCtx.fillStyle = i % 2 === 0
        ? `rgba(0, 229, 255, ${alpha * 0.12})`
        : `rgba(139, 123, 255, ${alpha * 0.12})`;
      tCtx.fill();
    });

    // --- CONNECTIONS: draw lines between nearby nodes + cursor ---
    tCtx.lineWidth = 0.5;
    for (let i = 0; i < nodes.length; i++) {
      // Node to cursor
      const dcx = nodes[i].x - mx;
      const dcy = nodes[i].y - my;
      const distC = Math.sqrt(dcx * dcx + dcy * dcy);
      if (distC < 250) {
        const a = (1 - distC / 250) * 0.3;
        tCtx.beginPath();
        tCtx.moveTo(nodes[i].x, nodes[i].y);
        tCtx.lineTo(mx, my);
        tCtx.strokeStyle = `rgba(0, 229, 255, ${a})`;
        tCtx.stroke();
      }

      // Node to node
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200) {
          const a = (1 - d / 200) * 0.12;
          tCtx.beginPath();
          tCtx.moveTo(nodes[i].x, nodes[i].y);
          tCtx.lineTo(nodes[j].x, nodes[j].y);
          tCtx.strokeStyle = `rgba(139, 123, 255, ${a})`;
          tCtx.stroke();
        }
      }
    }

    // --- HEX SCAN RING around cursor ---
    tCtx.save();
    tCtx.translate(mx, my);
    tCtx.rotate(t * 0.5);
    const hexR = 25 + Math.sin(t * 2) * 3;
    tCtx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = Math.cos(angle) * hexR;
      const hy = Math.sin(angle) * hexR;
      i === 0 ? tCtx.moveTo(hx, hy) : tCtx.lineTo(hx, hy);
    }
    tCtx.closePath();
    tCtx.strokeStyle = `rgba(0, 229, 255, ${0.18 + Math.sin(t * 3) * 0.08})`;
    tCtx.lineWidth = 0.8;
    tCtx.stroke();
    tCtx.restore();
  }
  tickCursor();
}

