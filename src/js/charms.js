// Charm Visuals and Drawing Implementations for LuckyDangle

const Charms = {
  nazar: {
    id: 'nazar',
    name: 'Evil Eye (Nazar)',
    radius: 38,
    stringColor: '#1a365d',
    hasCustomEyes: false,
    sound: 'chime',
    draw(ctx, charm, sim) {
      const r = this.radius;

      // Top suspension loop & decorative bead
      ctx.fillStyle = '#b7791f';
      ctx.beginPath();
      ctx.arc(0, -r - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Golden ring connector
      ctx.strokeStyle = '#d69e2e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -r, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Outer drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;

      // Base glass disc: Deep cobalt blue
      const blueGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 5, 0, 0, r);
      blueGrad.addColorStop(0, '#1e40af');
      blueGrad.addColorStop(0.7, '#1e3a8a');
      blueGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = blueGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // White ring
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
      ctx.fill();

      // Turquoise / sky-blue iris
      const irisGrad = ctx.createRadialGradient(-r * 0.1, -r * 0.1, 2, 0, 0, r * 0.42);
      irisGrad.addColorStop(0, '#38bdf8');
      irisGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Black pupil
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Glass specular reflection arcs (3D blown glass effect)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-r * 0.28, -r * 0.28, r * 0.42, r * 0.22, -Math.PI / 4, 0, Math.PI * 2);
      const specGrad = ctx.createLinearGradient(-r * 0.5, -r * 0.5, 0, 0);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specGrad;
      ctx.fill();

      // Subtle lower rim highlight
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, Math.PI * 0.25, Math.PI * 0.75);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  },

  nimbuMirchi: {
    id: 'nimbuMirchi',
    name: 'Nimbu Mirchi',
    radius: 46,
    stringColor: '#18181b', // traditional black cord
    sound: 'wood',
    draw(ctx, charm, sim) {
      // Traditional Indian talisman: 7 green chilies + 1 yellow lemon + charcoal
      const time = performance.now() * 0.002;
      const sway = Math.sin(time) * 0.04;

      // 1. Top charcoal bead
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(0, -50, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Hanging green chilies (arrayed gracefully)
      const chilies = [
        { angle: -0.45 + sway, len: 48, curve: -15, col: '#15803d' },
        { angle: -0.3 + sway, len: 54, curve: -10, col: '#16a34a' },
        { angle: -0.15 + sway, len: 50, curve: -6, col: '#22c55e' },
        { angle: 0.0 + sway, len: 56, curve: 0, col: '#16a34a' },
        { angle: 0.15 + sway, len: 52, curve: 8, col: '#22c55e' },
        { angle: 0.3 + sway, len: 55, curve: 12, col: '#15803d' },
        { angle: 0.45 + sway, len: 46, curve: 16, col: '#166534' }
      ];

      chilies.forEach((ch, idx) => {
        ctx.save();
        ctx.rotate(ch.angle * 0.5);

        // Dark stem
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(0, -36);
        ctx.stroke();

        // Chili body
        ctx.beginPath();
        ctx.moveTo(0, -36);
        const startY = -36;
        const midY = startY + ch.len * 0.6;
        const endY = startY + ch.len;
        ctx.quadraticCurveTo(ch.curve, midY, ch.curve * 0.5, endY);
        ctx.quadraticCurveTo(ch.curve * 0.2, midY, 0, -36);

        ctx.fillStyle = ch.col;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.fill();

        // Chili highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-1, -34);
        ctx.quadraticCurveTo(ch.curve * 0.8, midY, ch.curve * 0.4, endY - 6);
        ctx.stroke();

        ctx.restore();
      });

      // 3. Central Plump Yellow Lemon
      ctx.save();
      ctx.translate(0, 16);

      // Lemon shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Lemon body gradient
      const lemonGrad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 24);
      lemonGrad.addColorStop(0, '#fef08a');
      lemonGrad.addColorStop(0.5, '#eab308');
      lemonGrad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = lemonGrad;

      // Slight oval lemon shape with pointed tips
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.bezierCurveTo(22, -18, 22, 18, 0, 22);
      ctx.bezierCurveTo(-22, 18, -22, -18, 0, -22);
      ctx.fill();

      // Lemon crown / stem dot
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.arc(0, 22, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Lemon skin pores / highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-7, -7, 6, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Bottom red thread tie
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 42, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  daruma: {
    id: 'daruma',
    name: 'Japanese Daruma',
    radius: 42,
    stringColor: '#991b1b', // crimson cord
    sound: 'wood',
    leftEyeFilled: false,
    rightEyeFilled: false,
    draw(ctx, charm, sim) {
      const r = this.radius;

      // Top suspension knot
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, -r - 4, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Body drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      // Classic tumbler body: Crimson red
      const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 8, 0, 0, r);
      bodyGrad.addColorStop(0, '#ef4444');
      bodyGrad.addColorStop(0.7, '#dc2626');
      bodyGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = bodyGrad;

      // Daruma iconic shape (slightly pear/round)
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.9, -r, r * 1.05, r * 0.8, 0, r);
      ctx.bezierCurveTo(-r * 1.05, r * 0.8, -r * 0.9, -r, 0, -r);
      ctx.fill();
      ctx.restore();

      // Gold shoulder accents
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-r * 0.55, r * 0.1, 14, -0.5, 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r * 0.55, r * 0.1, 14, Math.PI - 1.2, Math.PI + 0.5);
      ctx.stroke();

      // Face area (Cream / White mask)
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.2, r * 0.62, r * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Crane Eyebrows (Traditional Japanese symbol of longevity)
      ctx.fillStyle = '#1c1917';
      // Left eyebrow
      ctx.beginPath();
      ctx.moveTo(-22, -26);
      ctx.bezierCurveTo(-15, -34, -6, -26, -5, -23);
      ctx.bezierCurveTo(-10, -26, -18, -26, -22, -26);
      ctx.fill();
      // Right eyebrow
      ctx.beginPath();
      ctx.moveTo(22, -26);
      ctx.bezierCurveTo(15, -34, 6, -26, 5, -23);
      ctx.bezierCurveTo(10, -26, 18, -26, 22, -26);
      ctx.fill();

      // Eyes (Interactive Daruma tradition: fill in left eye when setting a goal!)
      const eyeR = 6.5;
      // Eye sockets (white bases with gold outline)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;

      // Left eye
      ctx.beginPath();
      ctx.arc(-13, -15, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (this.leftEyeFilled) {
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(-13, -15, eyeR * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Right eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(13, -15, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (this.rightEyeFilled) {
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(13, -15, eyeR * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tortoise Whiskers / Beard
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(-16, -3);
      ctx.bezierCurveTo(-6, 4, 6, 4, 16, -3);
      ctx.bezierCurveTo(10, 8, -10, 8, -16, -3);
      ctx.fill();

      // Golden "福" (Fuku = Good Fortune) Kanji on stomach
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('福', 0, r * 0.44);
    },
    onClick(localX, localY) {
      // Toggle eye wishing interaction!
      if (localY > -24 && localY < -6) {
        if (localX < 0) {
          this.leftEyeFilled = !this.leftEyeFilled;
          return true;
        } else {
          this.rightEyeFilled = !this.rightEyeFilled;
          return true;
        }
      }
      return false;
    }
  },

  luckyCoin: {
    id: 'luckyCoin',
    name: 'Feng Shui Lucky Coin',
    radius: 36,
    stringColor: '#dc2626', // imperial red silk cord
    sound: 'coin',
    draw(ctx, charm, sim) {
      const r = this.radius;

      // Top Chinese Endless Knot (Pan Chang)
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.rect(-10, -r - 18, 20, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, -r - 11);
      ctx.lineTo(10, -r - 11);
      ctx.moveTo(0, -r - 18);
      ctx.lineTo(0, -r - 4);
      ctx.stroke();
      ctx.restore();

      // Coin shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;

      // Brass / Gold gradient disc
      const coinGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r);
      coinGrad.addColorStop(0, '#fde047');
      coinGrad.addColorStop(0.4, '#eab308');
      coinGrad.addColorStop(0.85, '#a16207');
      coinGrad.addColorStop(1, '#713f12');
      ctx.fillStyle = coinGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer rim relief
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
      ctx.stroke();

      // Center square cutout
      const sq = 12;
      ctx.fillStyle = '#0f172a'; // see-through to background
      ctx.fillRect(-sq, -sq, sq * 2, sq * 2);

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(-sq, -sq, sq * 2, sq * 2);

      // Four Traditional Chinese Characters (招財進寶 - Zhao Cai Jin Bao)
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 10px "Microsoft YaHei", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText('招', 0, -r + 14); // Top
      ctx.fillText('寶', 0, r - 13);  // Bottom
      ctx.fillText('進', -r + 13, 0); // Left
      ctx.fillText('財', r - 13, 0);  // Right

      // Bottom Red Silk Tassel with dynamic sway
      ctx.save();
      const tasselSway = Math.sin(performance.now() * 0.003 + sim.charmAngle) * 6;
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, r + 2);
      ctx.lineTo(tasselSway * 0.5, r + 14);
      ctx.stroke();

      // Tassel head bead
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(tasselSway * 0.5, r + 14, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tassel fringe threads
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.8;
      for (let i = -8; i <= 8; i += 2) {
        ctx.beginPath();
        ctx.moveTo(tasselSway * 0.5 + i * 0.5, r + 18);
        ctx.lineTo(tasselSway + i * 1.2, r + 52);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  windChime: {
    id: 'windChime',
    name: 'Temple Wind Chime',
    radius: 36,
    stringColor: '#78350f',
    sound: 'chime',
    draw(ctx, charm, sim) {
      const r = this.radius;

      // Temple Bell (Furin)
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Bronze / Brass bell gradient
      const bellGrad = ctx.createLinearGradient(-r * 0.7, -r, r * 0.7, 0);
      bellGrad.addColorStop(0, '#fef08a');
      bellGrad.addColorStop(0.3, '#d97706');
      bellGrad.addColorStop(0.7, '#b45309');
      bellGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = bellGrad;

      // Dome bell shape
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.8, -r, r * 0.85, 0, r * 0.9, 8);
      ctx.lineTo(-r * 0.9, 8);
      ctx.bezierCurveTo(-r * 0.85, 0, -r * 0.8, -r, 0, -r);
      ctx.fill();
      ctx.restore();

      // Bell lip
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.ellipse(0, 8, r * 0.9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Clapper
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, 16, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Tanzaku (Fluttering windcatcher paper strip)
      ctx.save();
      const flutter = Math.sin(performance.now() * 0.0035) * 12;
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(flutter * 0.3, 28);
      ctx.stroke();

      // Paper rectangle
      ctx.translate(flutter * 0.3, 28);
      ctx.rotate(flutter * 0.03);
      ctx.fillStyle = '#fef9c3';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 4;
      ctx.fillRect(-10, 0, 20, 48);

      // Red stamp seal on tanzaku
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-4, 28, 8, 8);

      // Calligraphy line
      ctx.fillStyle = '#334155';
      ctx.font = '8px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('風', 0, 16);
      ctx.restore();
    }
  },

  custom: {
    id: 'custom',
    name: 'Custom Image Charm',
    radius: 40,
    stringColor: '#e11d48',
    sound: 'wood',
    img: null,
    setImage(imageElement) {
      this.img = imageElement;
    },
    draw(ctx, charm, sim) {
      const r = this.radius;

      // Top suspension ring
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -r, 5, 0, Math.PI * 2);
      ctx.stroke();

      if (this.img && this.img.complete && this.img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // Clip to circular or rounded badge
        const size = r * 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(this.img, -r, -r, size, size);
        ctx.restore();

        // Border ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Placeholder badge prompting upload
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Drop PNG', 0, -4);
        ctx.font = '9px "Segoe UI", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('or pick image', 0, 10);
      }
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = { Charms };
}
