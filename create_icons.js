const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function generateMiftahPng(size, isRound = false) {
  const width = size;
  const height = size;

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const cx = x - width / 2;
      const cy = y - height / 2;
      const radius = size * 0.48;
      const dist = Math.sqrt(cx * cx + cy * cy);

      if (isRound && dist > radius) {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Premium Deep Midnight Sapphire gradient background
      const t = (x + y) / (width + height);
      let bgR = Math.floor(7 * (1 - t) + 11 * t);
      let bgG = Math.floor(13 * (1 - t) + 25 * t);
      let bgB = Math.floor(30 * (1 - t) + 54 * t);

      const nx = x / size;
      const ny = y / size;

      // Mathematical definition of the Miftah (Key + M) Emblem
      // 1. Key Bow Head (Upper 'M' Arches)
      const dLeftBow = Math.sqrt((nx - 0.38) ** 2 + (ny - 0.32) ** 2);
      const dRightBow = Math.sqrt((nx - 0.62) ** 2 + (ny - 0.32) ** 2);
      const inMHeadOuter = (dLeftBow < 0.16 || dRightBow < 0.16 || (nx >= 0.34 && nx <= 0.66 && ny >= 0.28 && ny <= 0.44));

      // Inner 'M' Cutouts
      const dLeftInner = Math.sqrt((nx - 0.38) ** 2 + (ny - 0.32) ** 2);
      const dRightInner = Math.sqrt((nx - 0.62) ** 2 + (ny - 0.32) ** 2);
      const inLeftHole = dLeftInner < 0.075;
      const inRightHole = dRightInner < 0.075;

      // Central Keyhole Spark
      const dCenterSpark = Math.sqrt((nx - 0.50) ** 2 + (ny - 0.34) ** 2);
      const inCenterSpark = dCenterSpark < 0.035;

      // 2. Key Stem (Vertical Shaft)
      const inStem = nx >= 0.44 && nx <= 0.56 && ny >= 0.42 && ny <= 0.80;
      const inStemBottomRound = Math.sqrt((nx - 0.50) ** 2 + (ny - 0.80) ** 2) < 0.06;

      // 3. Key Teeth / Digital Tool Notches (Right Side)
      const inUpperTooth = nx >= 0.56 && nx <= 0.72 && ny >= 0.62 && ny <= 0.68;
      const inLowerTooth = nx >= 0.56 && nx <= 0.67 && ny >= 0.72 && ny <= 0.78;

      let isKeyBody = (inMHeadOuter && !inLeftHole && !inRightHole) || inStem || inStemBottomRound || inUpperTooth || inLowerTooth;

      let r = bgR;
      let g = bgG;
      let b = bgB;
      let a = 255;

      if (isKeyBody) {
        // Radiant Cyan to Royal Indigo Key gradient
        const keyT = (ny - 0.2) / 0.65;
        r = Math.floor(56 * (1 - keyT) + 99 * keyT);
        g = Math.floor(189 * (1 - keyT) + 102 * keyT);
        b = Math.floor(248 * (1 - keyT) + 241 * keyT);

        // Highlight bevel edge
        if (nx < 0.46 || (inMHeadOuter && ny < 0.25)) {
          r = Math.min(255, r + 40);
          g = Math.min(255, g + 40);
          b = Math.min(255, b + 20);
        }
      }

      if (inCenterSpark) {
        // Luminous Golden Core Spark
        r = 252;
        g = 211;
        b = 77;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// 1. Web PWA Icons
if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/icon-192.png', generateMiftahPng(192));
fs.writeFileSync('public/icon-512.png', generateMiftahPng(512));
fs.writeFileSync('public/apple-touch-icon.png', generateMiftahPng(180));
fs.writeFileSync('public/favicon.ico', generateMiftahPng(64));
console.log('✅ Generated Miftah Web Icons in public/');

// 2. Android Mipmap Icons
const mipmaps = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

const resDir = path.join(__dirname, 'android/app/src/main/res');

mipmaps.forEach(({ dir, size }) => {
  const targetDir = path.join(resDir, dir);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), generateMiftahPng(size, false));
  fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), generateMiftahPng(size, true));
  fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), generateMiftahPng(size, false));
  console.log(`✅ Generated Android ${dir} (${size}x${size})`);
});

console.log('🎉 All Miftah Tools Android Launcher & Web Icons Generated Successfully!');
