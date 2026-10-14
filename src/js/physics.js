// Verlet Physics Engine for LuckyDangle Rope and Talisman

class Point {
  constructor(x, y, pinned = false, mass = 1) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.pinned = pinned;
    this.mass = mass;
  }

  update(dt, gravity, damping) {
    if (this.pinned) return;

    const vx = (this.x - this.oldX) * damping;
    const vy = (this.y - this.oldY) * damping;

    this.oldX = this.x;
    this.oldY = this.y;

    this.x += vx;
    this.y += vy + gravity * dt * dt;
  }

  applyForce(fx, fy) {
    if (this.pinned) return;
    this.x += fx;
    this.y += fy;
  }
}

class Constraint {
  constructor(p1, p2, length, stiffness = 1) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
    this.stiffness = stiffness;
  }

  resolve() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const diff = (dist - this.length) / dist;

    const m1 = this.p1.pinned ? 0 : 1 / this.p1.mass;
    const m2 = this.p2.pinned ? 0 : 1 / this.p2.mass;
    const totalMass = m1 + m2;

    if (totalMass === 0) return;

    const offsetX = dx * diff * this.stiffness;
    const offsetY = dy * diff * this.stiffness;

    if (!this.p1.pinned) {
      this.p1.x += offsetX * (m1 / totalMass);
      this.p1.y += offsetY * (m1 / totalMass);
    }
    if (!this.p2.pinned) {
      this.p2.x -= offsetX * (m2 / totalMass);
      this.p2.y -= offsetY * (m2 / totalMass);
    }
  }
}

class DangleSimulation {
  constructor(config = {}) {
    this.anchorX = config.anchorX || 400;
    this.anchorY = config.anchorY || 0;
    this.numSegments = config.numSegments || 7;
    this.segmentLength = config.segmentLength || 25;
    this.gravity = config.gravity || 980; // px/s^2
    this.damping = config.damping || 0.992; // smooth air resistance
    this.iterations = config.iterations || 8;

    this.points = [];
    this.constraints = [];

    // Dragging state
    this.isDragging = false;
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };
    this.mouseHistory = [];

    // Charm rotational physics
    this.charmAngle = 0;
    this.charmAngularVel = 0;
    this.targetCharmAngle = 0;

    this.init();
  }

  init() {
    this.points = [];
    this.constraints = [];

    for (let i = 0; i <= this.numSegments; i++) {
      const y = this.anchorY + i * this.segmentLength;
      const pinned = i === 0;
      // Charm end point has more mass for realistic pendulum momentum
      const mass = i === this.numSegments ? 3.5 : 1;
      this.points.push(new Point(this.anchorX, y, pinned, mass));
    }

    for (let i = 0; i < this.points.length - 1; i++) {
      this.constraints.push(
        new Constraint(this.points[i], this.points[i + 1], this.segmentLength, 0.95)
      );
    }
  }

  setLength(totalLength) {
    this.segmentLength = totalLength / this.numSegments;
    for (let c of this.constraints) {
      c.length = this.segmentLength;
    }
  }

  setAnchor(x, y) {
    this.anchorX = x;
    this.anchorY = y;
    if (this.points[0]) {
      this.points[0].x = x;
      this.points[0].y = y;
      this.points[0].oldX = x;
      this.points[0].oldY = y;
    }
  }

  getCharmPoint() {
    return this.points[this.points.length - 1];
  }

  update(dt, mousePos, mouseVel) {
    // 1. Mouse breeze / wind interaction (when mouse moves past)
    if (mousePos && mouseVel) {
      const speed = Math.hypot(mouseVel.x, mouseVel.y);
      if (speed > 15) {
        for (let i = 1; i < this.points.length; i++) {
          const p = this.points[i];
          const dist = Math.hypot(p.x - mousePos.x, p.y - mousePos.y);
          if (dist < 120 && dist > 5) {
            // Force drops off with distance
            const factor = (1 - dist / 120) * 0.08;
            p.x += mouseVel.x * factor;
            p.y += mouseVel.y * factor * 0.3;
          }
        }
      }
    }

    // 2. Drag handling
    if (this.isDragging && this.dragTarget) {
      const charm = this.getCharmPoint();
      charm.x = mousePos.x - this.dragOffset.x;
      charm.y = Math.max(this.anchorY + 10, mousePos.y - this.dragOffset.y);

      // Store recent mouse positions for flick velocity
      this.mouseHistory.push({ x: mousePos.x, y: mousePos.y, t: performance.now() });
      if (this.mouseHistory.length > 5) this.mouseHistory.shift();
    }

    // 3. Verlet physics update
    for (let i = 0; i < this.points.length; i++) {
      if (this.isDragging && i === this.points.length - 1) continue;
      this.points[i].update(dt, this.gravity, this.damping);
    }

    // 4. Constraint resolution iterations
    for (let iter = 0; iter < this.iterations; iter++) {
      for (let c of this.constraints) {
        c.resolve();
      }
    }

    // 5. Calculate charm orientation & torsional sway
    const pPrev = this.points[this.points.length - 2];
    const pEnd = this.points[this.points.length - 1];
    const ropeAngle = Math.atan2(pEnd.x - pPrev.x, pEnd.y - pPrev.y);

    // Spring towards rope angle with damping
    const angleDiff = -ropeAngle - this.charmAngle;
    this.charmAngularVel += angleDiff * 8.0 * dt;
    this.charmAngularVel *= 0.94; // torsional damping
    this.charmAngle += this.charmAngularVel;
  }

  startDrag(mx, my, charmRadius) {
    const charm = this.getCharmPoint();
    const dist = Math.hypot(charm.x - mx, charm.y - my);
    if (dist <= charmRadius * 1.3) {
      this.isDragging = true;
      this.dragTarget = charm;
      this.dragOffset = { x: mx - charm.x, y: my - charm.y };
      this.mouseHistory = [{ x: mx, y: my, t: performance.now() }];
      return true;
    }
    return false;
  }

  stopDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Flick calculation
    if (this.mouseHistory.length >= 2) {
      const oldest = this.mouseHistory[0];
      const newest = this.mouseHistory[this.mouseHistory.length - 1];
      const dt = (newest.t - oldest.t) / 1000;
      if (dt > 0.005) {
        const vx = (newest.x - oldest.x) / dt;
        const vy = (newest.y - oldest.y) / dt;
        const charm = this.getCharmPoint();
        // Impart momentum (clamped to prevent explosions)
        const flickX = Math.max(-1200, Math.min(1200, vx * 0.035));
        const flickY = Math.max(-600, Math.min(600, vy * 0.035));
        charm.oldX = charm.x - flickX;
        charm.oldY = charm.y - flickY;
        this.charmAngularVel += (vx / 400);
      }
    }

    this.dragTarget = null;
    this.mouseHistory = [];
  }

  impulse(fx, fy) {
    const charm = this.getCharmPoint();
    charm.oldX -= fx;
    charm.oldY -= fy;
    this.charmAngularVel += (fx / 150);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Point, Constraint, DangleSimulation };
}
