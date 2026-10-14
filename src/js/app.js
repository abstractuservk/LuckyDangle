// Main Application Controller for LuckyDangle Windows Overlay

(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const anchorHandle = document.getElementById('anchorHandle');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthVal = document.getElementById('lengthVal');
  const swaySlider = document.getElementById('swaySlider');
  const swayVal = document.getElementById('swayVal');
  const soundToggle = document.getElementById('soundToggle');
  const centerBtn = document.getElementById('centerBtn');
  const minimizeBtn = document.getElementById('minimizeBtn');
  const charmCards = document.querySelectorAll('.charm-card');
  const customSection = document.getElementById('customImageSection');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  // Sound Engine
  const sound = new SoundEngine();

  // State
  let dpr = window.devicePixelRatio || 1;
  let width = window.innerWidth;
  let height = window.innerHeight;

  let currentCharmKey = 'nazar';
  let isDraggingAnchor = false;
  let isSettingsOpen = false;
  let isMouseOverInteractive = false;
  let lastMouse = { x: width / 2, y: 150 };
  let mouseVel = { x: 0, y: 0 };
  let lastMouseTime = performance.now();

  // Saved Settings
  try {
    const saved = JSON.parse(localStorage.getItem('luckydangle_settings') || '{}');
    if (saved.charm && Charms[saved.charm]) currentCharmKey = saved.charm;
    if (saved.soundEnabled !== undefined) {
      sound.enabled = saved.soundEnabled;
      soundToggle.checked = saved.soundEnabled;
    }
  } catch (e) {
    console.warn('Could not read saved settings', e);
  }

  // Create Simulation
  const initialAnchorX = Math.round(width / 2);
  const sim = new DangleSimulation({
    anchorX: initialAnchorX,
    anchorY: 0,
    segmentLength: 26,
    numSegments: 7,
    damping: 0.992
  });

  // Setup Canvas
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
  });
  resizeCanvas();

  // Setup UI elements position
  function updateAnchorKnobPosition() {
    anchorHandle.style.left = `${sim.anchorX}px`;
    menuToggleBtn.style.left = `${sim.anchorX + 26}px`;
  }
  updateAnchorKnobPosition();

  // Switch Charm
  function setCharm(key) {
    if (!Charms[key]) return;
    currentCharmKey = key;

    charmCards.forEach(c => {
      c.classList.toggle('active', c.dataset.charm === key);
    });

    customSection.classList.toggle('visible', key === 'custom');

    // Play switch sound
    const charm = Charms[key];
    if (charm.sound === 'chime') sound.playGlassChime(1.2);
    else if (charm.sound === 'coin') sound.playCoinJingle();
    else sound.playWoodenTap();

    saveState();
  }

  function saveState() {
    try {
      localStorage.setItem('luckydangle_settings', JSON.stringify({
        charm: currentCharmKey,
        soundEnabled: sound.enabled,
        length: lengthSlider.value,
        damping: swaySlider.value,
        anchorX: sim.anchorX
      }));
    } catch (e) {}
  }

  // Geometry Distance Helper for hit testing line segments
  function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // Check if cursor is over interactive area
  function checkInteractiveHit(mx, my) {
    if (sim.isDragging || isDraggingAnchor) return true;

    // 1. Settings panel if open
    if (isSettingsOpen) {
      const rect = settingsPanel.getBoundingClientRect();
      if (mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom) {
        return true;
      }
    }

    // 2. Anchor knob & Settings button
    const knobRect = anchorHandle.getBoundingClientRect();
    if (mx >= knobRect.left - 4 && mx <= knobRect.right + 4 && my >= 0 && my <= knobRect.bottom + 6) {
      return true;
    }
    const btnRect = menuToggleBtn.getBoundingClientRect();
    if (mx >= btnRect.left - 4 && mx <= btnRect.right + 4 && my >= btnRect.top - 4 && my <= btnRect.bottom + 4) {
      return true;
    }

    // 3. Charm head hit-test
    const charmPoint = sim.getCharmPoint();
    const charm = Charms[currentCharmKey];
    const charmHitRadius = (charm.radius || 38) + 16;
    const distToCharm = Math.hypot(mx - charmPoint.x, my - charmPoint.y);
    if (distToCharm <= charmHitRadius) return true;

    // 4. String hit-test (clicking anywhere on the thread)
    for (let i = 0; i < sim.points.length - 1; i++) {
      const p1 = sim.points[i];
      const p2 = sim.points[i + 1];
      if (distToSegment(mx, my, p1.x, p1.y, p2.x, p2.y) < 16) {
        return true;
      }
    }

    return false;
  }

  // Update Click-Through State
  function updateInteractiveState(interactive) {
    if (isMouseOverInteractive === interactive) return;
    isMouseOverInteractive = interactive;

    if (window.electronAPI) {
      // Invert: if interactive, do NOT ignore mouse events!
      window.electronAPI.setIgnoreMouseEvents(!interactive, { forward: true });
    }
  }

  // Global cursor position from Electron Main Process
  if (window.electronAPI) {
    window.electronAPI.onGlobalCursorPos((cursor) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastMouseTime);

      mouseVel.x = (cursor.x - lastMouse.x) / (dt / 16.6);
      mouseVel.y = (cursor.y - lastMouse.y) / (dt / 16.6);
      lastMouse.x = cursor.x;
      lastMouse.y = cursor.y;
      lastMouseTime = now;

      const hit = checkInteractiveHit(cursor.x, cursor.y);
      updateInteractiveState(hit);
    });

    // Tray Menu Actions
    window.electronAPI.onMenuAction((action, data) => {
      if (action === 'set-charm' && Charms[data]) {
        setCharm(data);
      } else if (action === 'toggle-settings') {
        toggleSettings();
      } else if (action === 'reset-pos') {
        resetPosition();
      } else if (action === 'toggle-sound') {
        sound.enabled = !sound.enabled;
        soundToggle.checked = sound.enabled;
      }
    });
  }

  // Local DOM Mouse Events
  window.addEventListener('mousedown', (e) => {
    const mx = e.clientX;
    const my = e.clientY;

    // Check if clicked anchor knob
    const knobRect = anchorHandle.getBoundingClientRect();
    if (mx >= knobRect.left && mx <= knobRect.right && my >= 0 && my <= knobRect.bottom) {
      isDraggingAnchor = true;
      updateInteractiveState(true);
      return;
    }

    // Check if clicked charm
    const charmPoint = sim.getCharmPoint();
    const charm = Charms[currentCharmKey];
    const dist = Math.hypot(mx - charmPoint.x, my - charmPoint.y);

    if (dist <= (charm.radius || 38) * 1.3) {
      // Check for specific interactive click on charm (e.g. Daruma eye wishing)
      const localX = (mx - charmPoint.x) * Math.cos(-sim.charmAngle) - (my - charmPoint.y) * Math.sin(-sim.charmAngle);
      const localY = (mx - charmPoint.x) * Math.sin(-sim.charmAngle) + (my - charmPoint.y) * Math.cos(-sim.charmAngle);

      if (charm.onClick && charm.onClick(localX, localY)) {
        sound.playWoodenTap();
        return;
      }

      // Start drag & play pluck
      if (sim.startDrag(mx, my, charm.radius || 38)) {
        sound.playStringPluck();
        updateInteractiveState(true);
      }
    }
  });

  window.addEventListener('mousemove', (e) => {
    const mx = e.clientX;
    const my = e.clientY;

    if (isDraggingAnchor) {
      const clampedX = Math.max(60, Math.min(width - 60, mx));
      sim.setAnchor(clampedX, 0);
      updateAnchorKnobPosition();
      return;
    }

    const hit = checkInteractiveHit(mx, my);
    updateInteractiveState(hit);
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingAnchor) {
      isDraggingAnchor = false;
      saveState();
    }

    if (sim.isDragging) {
      sim.stopDrag();
      const charm = Charms[currentCharmKey];
      if (charm.sound === 'chime') sound.playGlassChime(1.0);
      else if (charm.sound === 'coin') sound.playCoinJingle();
      else sound.playWoodenTap();
    }

    const hit = checkInteractiveHit(lastMouse.x, lastMouse.y);
    updateInteractiveState(hit);
  });

  // UI Event Listeners
  function toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
    settingsPanel.classList.toggle('visible', isSettingsOpen);
    menuToggleBtn.classList.toggle('active', isSettingsOpen);
    if (isSettingsOpen) {
      updateInteractiveState(true);
    }
  }

  menuToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSettings();
  });

  closeSettingsBtn.addEventListener('click', () => {
    toggleSettings();
  });

  minimizeBtn.addEventListener('click', () => {
    toggleSettings();
  });

  charmCards.forEach(card => {
    card.addEventListener('click', () => {
      setCharm(card.dataset.charm);
    });
  });

  lengthSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    sim.setLength(val);
    lengthVal.textContent = val < 150 ? 'Short' : (val > 240 ? 'Long' : 'Medium');
    saveState();
  });

  swaySlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    sim.damping = val;
    swayVal.textContent = val < 0.985 ? 'Gentle' : (val > 0.994 ? 'Bouncy' : 'Playful');
    saveState();
  });

  soundToggle.addEventListener('change', (e) => {
    sound.enabled = e.target.checked;
    saveState();
  });

  function resetPosition() {
    const midX = Math.round(width / 2);
    sim.setAnchor(midX, 0);
    sim.init();
    updateAnchorKnobPosition();
    sound.playGlassChime(1.5);
    saveState();
  }

  centerBtn.addEventListener('click', resetPosition);

  // Custom Image Upload Handling
  dropzone.addEventListener('click', async () => {
    if (window.electronAPI) {
      const dataUrl = await window.electronAPI.selectCustomImage();
      if (dataUrl) loadCustomImage(dataUrl);
    } else {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => loadCustomImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  });

  function loadCustomImage(src) {
    const img = new Image();
    img.onload = () => {
      Charms.custom.setImage(img);
      setCharm('custom');
      dropzone.textContent = 'Custom image loaded! (Click to replace)';
    };
    img.src = src;
  }

  // Animation Loop
  let lastFrameTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min(0.033, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    // Physics step
    sim.update(dt, lastMouse, mouseVel);
    // Mouse velocity decay
    mouseVel.x *= 0.88;
    mouseVel.y *= 0.88;

    // Render Canvas
    ctx.clearRect(0, 0, width, height);

    const charm = Charms[currentCharmKey];

    // 1. Draw String / Cord
    const pts = sim.points;
    if (pts.length > 1) {
      // String shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      ctx.strokeStyle = charm.stringColor || '#b91c1c';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        // Smooth curve through midpoints
        const xc = (pts[i - 1].x + pts[i].x) / 2;
        const yc = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
      ctx.restore();

      // Draw subtle decorative knots along the thread
      ctx.fillStyle = charm.stringColor || '#b91c1c';
      for (let i = 2; i < pts.length - 1; i += 2) {
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Draw Charm at the end point
    const charmPoint = sim.getCharmPoint();
    ctx.save();
    ctx.translate(charmPoint.x, charmPoint.y);
    ctx.rotate(sim.charmAngle);
    charm.draw(ctx, charmPoint, sim);
    ctx.restore();
  }

  // Start animation loop
  requestAnimationFrame(animate);

  // Initial gentle nudge to show it's alive!
  setTimeout(() => {
    sim.impulse(18, 0);
  }, 400);

})();
