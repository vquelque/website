// current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// laser pointer + drag-to-cut — disabled for touch devices and reduced-motion users
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFinePointer = window.matchMedia("(pointer: fine)").matches;

if (isFinePointer && !prefersReducedMotion) {
  const laser = document.querySelector(".laser");
  const dot = document.querySelector(".laser-dot");
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

  // laser pointer is on at all times, tracking the cursor
  laser.classList.add("is-active");
  dot.style.transform = `translate(${targetX}px, ${targetY}px)`;

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
  // keep the laser visible even when the pointer leaves; just stop any cut
  window.addEventListener("pointerleave", stopCutting);

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
  // intro: the laser hand-draws the signature heading, leaving a glowing ember
  function buildSignatureHeading() {
    const sig = window.SIGNATURE;
    const h1 = document.querySelector(".name");
    if (!sig || !sig.strokes || !sig.strokes.length || !h1) return;

    const VBW = sig.width;
    const VBH = sig.height;
    const NS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "sig");
    svg.setAttribute("viewBox", `0 0 ${VBW} ${VBH}`);
    svg.setAttribute("aria-hidden", "true");

    // one path element per stroke — guarantees strokes reveal sequentially
    // (a single combined path reveals subpaths in parallel across pen lifts)
    const paths = [];
    for (const s of sig.strokes) {
      if (s.length < 2) continue;
      let d = `M ${s[0][0]} ${s[0][1]}`;
      for (let i = 1; i < s.length; i++) d += ` L ${s[i][0]} ${s[i][1]}`;
      const pe = document.createElementNS(NS, "path");
      pe.setAttribute("class", "sig-path");
      pe.setAttribute("d", d);
      svg.appendChild(pe);
      paths.push(pe);
    }

    // the tip where the y's tail finishes (rightmost stroke endpoint, not an
    // interior point) — the laser parks here at the end, like a period
    let brX = -Infinity, brY = 0;
    for (const s of sig.strokes) {
      if (s.length < 2) continue;
      for (const idx of [0, s.length - 1]) {
        const x = s[idx][0], y = s[idx][1];
        if (x > brX) { brX = x; brY = y; }
      }
    }

    h1.innerHTML = "";
    h1.setAttribute("aria-label", "Valentin Quelquejay");
    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = "Valentin Quelquejay";
    h1.appendChild(sr);
    h1.appendChild(svg);

    // measure once in the DOM; hide every stroke; compute cumulative offsets
    const lens = paths.map((pe) => pe.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    const cum = [];
    let acc = 0;
    for (const l of lens) { cum.push(acc); acc += l; }
    paths.forEach((pe, i) => {
      pe.style.strokeDasharray = lens[i];
      pe.style.strokeDashoffset = lens[i];
      pe.style.opacity = "0"; // round caps would otherwise dot the start point
    });

    // on load, place the laser at the signature's starting point, ready to draw
    if (paths.length) {
      const rStart = svg.getBoundingClientRect();
      const p0 = paths[0].getPointAtLength(0);
      targetX = rStart.left + (p0.x / VBW) * rStart.width;
      targetY = rStart.top + (p0.y / VBH) * rStart.height;
      dot.style.transform = `translate(${targetX}px, ${targetY}px)`;
    }

    const DURATION = 7000;
    let lastSpark = 0;
    let start = 0;
    const cooled = paths.map(() => false); // per-stroke: cooling started?

    function step() {
      const e = Math.min((now() - start) / DURATION, 1);
      const p = e; // linear → constant drawing speed along the whole signature
      const D = total * p; // length drawn so far, across all strokes in order

      // reveal each stroke up to where the tip has reached; once a stroke is
      // fully drawn it starts cooling immediately — so earlier letters burn out
      // before later ones (the V cools while the y is still being written)
      for (let i = 0; i < paths.length; i++) {
        const drawn = Math.max(0, Math.min(D - cum[i], lens[i]));
        paths[i].style.strokeDashoffset = lens[i] - drawn;
        paths[i].style.opacity = drawn > 0 ? "1" : "0";
        if (drawn >= lens[i] && !cooled[i]) {
          cooled[i] = true;
          paths[i].classList.add("cooling");
        }
      }

      // tip rides the stroke currently being drawn
      let idx = 0;
      while (idx < paths.length - 1 && D > cum[idx] + lens[idx]) idx++;
      const local = Math.max(0, Math.min(D - cum[idx], lens[idx]));
      const pt = paths[idx].getPointAtLength(local);
      const rect = svg.getBoundingClientRect();
      const sx = rect.left + (pt.x / VBW) * rect.width;
      const sy = rect.top + (pt.y / VBH) * rect.height;
      dot.style.transform = `translate(${sx}px, ${sy}px)`;
      if (now() - lastSpark > 28) { spawnSparks(sx, sy, 1); lastSpark = now(); }

      if (e < 1) {
        requestAnimationFrame(step);
      } else {
        paths.forEach((pe, i) => {
          pe.style.strokeDashoffset = 0;
          pe.style.opacity = "1";
          if (!cooled[i]) { cooled[i] = true; pe.classList.add("cooling"); }
        });
        laser.classList.remove("cutting");
        // park the laser as a dot at the end of the y, until the user moves
        const rEnd = svg.getBoundingClientRect();
        const ex = rEnd.left + (brX / VBW) * rEnd.width;
        const ey = rEnd.top + (brY / VBH) * rEnd.height;
        dot.style.transform = `translate(${ex}px, ${ey}px)`;
      }
    }

    // SVG is built and space reserved now; start the actual draw after a beat
    setTimeout(() => {
      start = now();
      laser.classList.add("cutting");
      step();
    }, 650);
  }

  // build the signature heading immediately (reserves the empty draw space)
  buildSignatureHeading();

  // avoid native text selection while slashing across copy
  document.addEventListener("selectstart", (e) => { if (cutting) e.preventDefault(); });
}
