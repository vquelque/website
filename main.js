// current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// laser pointer + drag-to-cut — disabled for touch devices and reduced-motion users
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFinePointer = window.matchMedia("(pointer: fine)").matches;

if (isFinePointer && !prefersReducedMotion) {
  const laser = document.querySelector(".laser");
  const dot = document.querySelector(".laser-dot");
  const flare = document.querySelector(".laser-flare");
  const canvas = document.querySelector(".cut-canvas");
  const ctx = canvas.getContext("2d");

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let flareX = targetX;
  let flareY = targetY;
  let active = false;

  // cutting state
  let cutting = false;
  let currentStroke = null;
  const strokes = [];  // each: { points: [{x,y}], releasedAt: number|null }
  const sparks = [];   // flying particles
  const FADE = 1200;   // ms to fade out a stroke after release
  const SPARK_LIFE = 650;

  function now() { return performance.now(); }

  function spawnSparks(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 3.5;
      sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        born: now(),
        life: SPARK_LIFE * (0.5 + Math.random() * 0.5),
      });
    }
  }

  window.addEventListener("pointermove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    dot.style.transform = `translate(${targetX}px, ${targetY}px)`;
    if (!active) {
      active = true;
      laser.classList.add("is-active");
    }
    if (cutting && currentStroke) {
      const pts = currentStroke.points;
      const last = pts[pts.length - 1];
      if (Math.hypot(targetX - last.x, targetY - last.y) > 6) {
        spawnSparks(targetX, targetY, 2);
      }
      pts.push({ x: targetX, y: targetY });
    }
  });

  window.addEventListener("pointerdown", (e) => {
    cutting = true;
    laser.classList.add("cutting");
    currentStroke = { points: [{ x: e.clientX, y: e.clientY }], releasedAt: null };
    strokes.push(currentStroke);
    spawnSparks(e.clientX, e.clientY, 6);
  });

  function stopCutting() {
    cutting = false;
    laser.classList.remove("cutting");
    if (currentStroke) {
      currentStroke.releasedAt = now();
      currentStroke = null;
    }
  }
  window.addEventListener("pointerup", stopCutting);
  window.addEventListener("pointerleave", () => {
    active = false;
    laser.classList.remove("is-active");
    stopCutting();
  });

  // build one smooth continuous path (no per-segment caps → no beading)
  function tracePath(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  function drawStroke(pts, alpha) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // outer red glow — one continuous stroke
    ctx.strokeStyle = `rgba(255, 40, 0, ${0.18 * alpha})`;
    ctx.lineWidth = 16;
    tracePath(pts);
    ctx.stroke();
    // hot orange middle (brand)
    ctx.strokeStyle = `rgba(255, 123, 26, ${0.55 * alpha})`;
    ctx.lineWidth = 4.5;
    tracePath(pts);
    ctx.stroke();
    // white-hot core
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * alpha})`;
    ctx.lineWidth = 1.6;
    tracePath(pts);
    ctx.stroke();
  }

  const animate = () => {
    // trailing flare follows the precise dot
    flareX += (targetX - flareX) * 0.18;
    flareY += (targetY - flareY) * 0.18;
    flare.style.transform = `translate(${flareX}px, ${flareY}px)`;

    const t = now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    // slash strokes — full opacity while cutting, fade after release
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      let alpha = 1;
      if (s.releasedAt !== null) {
        const fade = s.fade || FADE;
        const age = t - s.releasedAt;
        if (age > fade) { strokes.splice(i, 1); continue; }
        alpha = 1 - age / fade;
      }
      if (s.points.length >= 2) drawStroke(s.points, alpha);
    }

    // sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const age = t - s.born;
      if (age > s.life) { sparks.splice(i, 1); continue; }
      const a = 1 - age / s.life;
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.06; // slight gravity
      ctx.fillStyle = `rgba(255, ${150 + Math.floor(80 * a)}, 60, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.6 * a + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(animate);
  };
  animate();

  // intro: auto-draw a glowing "V" cut in the middle of the page on load
  function runIntroCut() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const halfH = window.innerHeight * 0.40; // V spans 80% of full height
    const halfW = halfH * 0.6;
    const P0 = { x: cx - halfW, y: cy - halfH };
    const P1 = { x: cx, y: cy + halfH };
    const P2 = { x: cx + halfW, y: cy - halfH };

    const stroke = { points: [{ x: P0.x, y: P0.y }], releasedAt: null, fade: 2800 };
    strokes.push(stroke);
    laser.classList.add("is-active", "cutting");

    const DURATION = 10000;
    const start = now();
    let lastSpark = 0;

    function step() {
      const e = Math.min((now() - start) / DURATION, 1);
      // easeInOutCubic
      const p = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
      let hx, hy;
      if (p < 0.5) {
        const u = p / 0.5;
        hx = P0.x + (P1.x - P0.x) * u;
        hy = P0.y + (P1.y - P0.y) * u;
      } else {
        const u = (p - 0.5) / 0.5;
        hx = P1.x + (P2.x - P1.x) * u;
        hy = P1.y + (P2.y - P1.y) * u;
      }
      stroke.points.push({ x: hx, y: hy });
      dot.style.transform = `translate(${hx}px, ${hy}px)`;
      if (now() - lastSpark > 26) { spawnSparks(hx, hy, 2); lastSpark = now(); }

      if (e < 1) {
        requestAnimationFrame(step);
      } else {
        laser.classList.remove("is-active", "cutting");
        // hold the finished slash at full brightness, then let it fade
        setTimeout(() => { stroke.releasedAt = now(); }, 800);
      }
    }
    step();
  }
  // let the page entrance settle first, then slash
  setTimeout(runIntroCut, 500);

  // avoid native text selection while slashing across copy
  document.addEventListener("selectstart", (e) => { if (cutting) e.preventDefault(); });
}
