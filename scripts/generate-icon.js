const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createEvilEyeIcon(size = 32) {
  const width = size;
  const height = size;
  const rawData = [];

  const center = size / 2;
  const rOuter = size * 0.44;
  const rWhite = size * 0.30;
  const rCyan = size * 0.18;
  const rBlack = size * 0.08;

  for (let y = 0; y < height; y++) {
    rawData.push(0); // Filter byte: None
    for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - center;
      const dy = y + 0.5 - center;
      const dist = Math.hypot(dx, dy);

      if (dist <= rBlack) {
        // Black pupil
        rawData.push(15, 23, 42, 255);
      } else if (dist <= rCyan) {
        // Cyan / Sky blue
        rawData.push(56, 189, 248, 255);
      } else if (dist <= rWhite) {
        // White
        rawData.push(248, 250, 252, 255);
      } else if (dist <= rOuter) {
        // Cobalt blue
        rawData.push(30, 64, 175, 255);
      } else if (dist <= rOuter + 1) {
        // Antialiased edge
        const alpha = Math.max(0, Math.min(255, Math.round((rOuter + 1 - dist) * 255)));
        rawData.push(30, 64, 175, alpha);
      } else {
        // Transparent
        rawData.push(0, 0, 0, 0);
      }
    }
  }

  const rawBuf = Buffer.from(rawData);
  const compressed = zlib.deflateSync(rawBuf);

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const png = createEvilEyeIcon(32);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), png);
console.log('Created assets/icon.png successfully!');
