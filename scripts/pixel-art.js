'use strict';

/**
 * Motor de pixel art para los iconos: lienzo de 16x16, fuente de 3x5,
 * glifos y sprites. Todo se emite como rects SVG con crispEdges, así que no
 * depende de fuentes ni de filtros.
 */

const INK = '#1a1626';
const CREAM = '#f5efdc';
const STEAM = '#cfd3dc';

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(hex, target, amount) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  const channel = (x, y) => Math.round(x + (y - x) * amount).toString(16).padStart(2, '0');
  return '#' + channel(a.r, b.r) + channel(a.g, b.g) + channel(a.b, b.b);
}

const light = (hex, amount = 0.28) => mix(hex, '#ffffff', amount);
const dark = (hex, amount = 0.32) => mix(hex, '#000000', amount);

function brightness(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

const FONT = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['101', '111', '111', '111', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  Q: ['010', '101', '101', '111', '011'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '011'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['110', '001', '010', '100', '111'],
  3: ['110', '001', '010', '001', '110'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '110', '001', '110'],
  6: ['011', '100', '111', '101', '111'],
  7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '110'],
  '+': ['000', '010', '111', '010', '000'],
  '#': ['101', '111', '101', '111', '101'],
  '{': ['011', '010', '010', '010', '011'],
  '}': ['110', '010', '010', '010', '110'],
  '<': ['001', '010', '100', '010', '001'],
  '>': ['100', '010', '001', '010', '100'],
  '/': ['001', '001', '010', '100', '100'],
  '_': ['000', '000', '000', '000', '111'],
  '-': ['000', '000', '111', '000', '000'],
  '.': ['000', '000', '000', '000', '010'],
  ' ': ['000', '000', '000', '000', '000'],
  '?': ['110', '001', '010', '000', '010'],
};

const GLYPHS = {
  list: ['#.####.', '#......', '#.####.', '#......', '#.####.'],
  sliders: ['#######', '..#....', '#######', '....#..', '#######'],
  db: ['.#####.', '#.....#', '#.....#', '#######', '#.....#', '#.....#', '.#####.'],
  prompt: ['##.....', '.##....', '..##...', '.##....', '##.....', '#######'],
  grid: ['#######', '#.#.#.#', '#######', '#.#.#.#', '#######', '#.#.#.#', '#######'],
  containers: ['###.###..', '###.###..', '###.###..', '....###..', '###.###..'],
  moon: ['..###..', '.##....', '##.....', '##.....', '.##....', '..###..'],
  chip: ['#.#.#.#.#', '#########', '#.......#', '#.......#', '#########', '#.#.#.#.#'],
  lines: ['#######', '.......', '#####..', '.......', '####...'],
};

function createCanvas(size = 16) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function setPixel(canvas, x, y, color) {
  if (!color) return;
  if (x >= 0 && y >= 0 && y < canvas.length && x < canvas[0].length) {
    canvas[y][x] = color;
  }
}

function fillRect(canvas, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(canvas, x + dx, y + dy, color);
    }
  }
}

function drawBitmap(canvas, rows, x, y, color) {
  rows.forEach((row, dy) => {
    row.split('').forEach((cell, dx) => {
      if (cell === '1' || cell === '#') setPixel(canvas, x + dx, y + dy, color);
    });
  });
}

function textWidth(text) {
  return text.length * 3 + (text.length - 1);
}

function drawText(canvas, text, x, y, color, shadowColor) {
  let cx = x;
  for (const character of text.toUpperCase()) {
    const rows = FONT[character] || FONT['?'];
    if (shadowColor) drawBitmap(canvas, rows, cx + 1, y + 1, shadowColor);
    drawBitmap(canvas, rows, cx, y, color);
    cx += 4;
  }
}

function svgFromCanvas(canvas) {
  const height = canvas.length;
  const width = canvas[0].length;
  const rects = [];
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      const color = canvas[y][x];
      if (!color) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < width && canvas[y][end] === color) end++;
      rects.push(`  <rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${color}"/>`);
      x = end;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="128" height="128" shape-rendering="crispEdges">
${rects.join('\n')}
</svg>
`;
}

/** Dibuja la página de un lenguaje con su sigla o glifo. */
function pageSvg(spec) {
  const base = spec.color;
  const c = createCanvas();
  const body = brightness(base) > 150 ? INK : CREAM;
  const shadow = body === CREAM ? INK : null;
  const lightColor = light(base, 0.3);
  const darkColor = dark(base, 0.32);
  const foldColor = dark(base, 0.46);

  fillRect(c, 3, 2, 8, 1, lightColor);
  fillRect(c, 3, 3, 8, 2, base);
  fillRect(c, 3, 5, 10, 7, base);
  fillRect(c, 3, 3, 1, 9, lightColor);
  fillRect(c, 3, 12, 10, 1, spec.accent ? spec.accent : base);
  fillRect(c, 3, 13, 10, 1, darkColor);

  setPixel(c, 2, 1, INK);
  fillRect(c, 3, 1, 8, 1, INK);
  setPixel(c, 2, 2, INK);
  setPixel(c, 11, 2, INK);
  setPixel(c, 2, 3, INK);
  setPixel(c, 11, 3, foldColor);
  setPixel(c, 12, 3, INK);
  setPixel(c, 2, 4, INK);
  setPixel(c, 11, 4, foldColor);
  setPixel(c, 12, 4, foldColor);
  setPixel(c, 13, 4, INK);
  for (let y = 5; y <= 13; y++) {
    setPixel(c, 2, y, INK);
    setPixel(c, 13, y, INK);
  }
  fillRect(c, 3, 14, 10, 1, INK);
  setPixel(c, 2, 14, INK);
  setPixel(c, 13, 14, INK);

  if (spec.label) {
    const width = textWidth(spec.label);
    const x = 4 + Math.floor((9 - width) / 2);
    drawText(c, spec.label, x, 6, body, shadow);
  } else if (spec.glyph) {
    const rows = GLYPHS[spec.glyph];
    if (!rows) throw new Error(`Glifo desconocido: ${spec.glyph}`);
    const width = rows[0].length;
    const x = 4 + Math.floor((9 - width) / 2);
    const y = 5 + Math.floor((8 - rows.length) / 2);
    if (shadow) drawBitmap(c, rows, x + 1, y + 1, shadow);
    drawBitmap(c, rows, x, y, body);
  }

  return svgFromCanvas(c);
}

/** Archivo genérico: página crema con líneas de texto. */
function fileSvg() {
  return pageSvg({ color: '#e8ddc8', glyph: 'lines', text: '#6e7385' });
}

const SPRITE_DEFS = {
  leaf: {
    base: '#5da85d',
    accent: '#8b5e3c',
    rows: [
      '..........kk....',
      '.........kllk...',
      '........klllck..',
      '.......klllcck..',
      '......klllccck..',
      '.....klllccck...',
      '....klllccck....',
      '...klllccck.....',
      '...kllccck......',
      '..kllccck.......',
      '..klccck........',
      '..kccck.........',
      '...kkk..........',
      '....ak..........',
      '....aa..........',
      '................',
    ],
  },
  coffee: {
    base: '#e8ddc8',
    accent: '#8b5e3c',
    rows: [
      '................',
      '.....s...s......',
      '......s...s.....',
      '.....s...s......',
      '................',
      '..kkkkkkkkk.....',
      '..kaaaaaaak.....',
      '..klwwwwwkkk....',
      '..klwwwwwk.k....',
      '..klwwwwwk.k....',
      '..klwwwwwkkk....',
      '..klwwwwwk......',
      '..kkkkkkkkk.....',
      '...kdddddk......',
      '................',
      '................',
    ],
  },
  note: {
    base: '#e07a4f',
    accent: '#f2c14e',
    rows: [
      '................',
      '....kkkkkkkk....',
      '....kwwwwwwk....',
      '....kwk..kwk....',
      '....kwk..kwk....',
      '....kwk..kwk....',
      '...kkkk.kkkk....',
      '..kcccck.kcccck.',
      '..kcdcck.kcdcck.',
      '..kcccck.kcccck.',
      '...kkkk...kkkk..',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  image: {
    base: '#45a8a0',
    accent: '#f2c14e',
    rows: [
      '................',
      '................',
      '..kkkkkkkkkkkk..',
      '..kwwwwwwwwwwk..',
      '..kwwaaawwwwwk..',
      '..kwwaaawwwwwk..',
      '..kwwwwwwkkwwk..',
      '..kwwwwwkkkkwk..',
      '..kwwwwkkkkkkk..',
      '..kwwwkkkkkkkk..',
      '..kwwkkkkkkkkk..',
      '..kwwwwwwwwwwk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
      '................',
    ],
  },
  video: {
    base: '#8a5aa8',
    accent: '#f5efdc',
    rows: [
      '................',
      '..kkkkkkkkkkkk..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kccccwwcccck..',
      '..kccccwwwccck..',
      '..kccccwwwwcck..',
      '..kccccwwwwcck..',
      '..kccccwwwccck..',
      '..kccccwwcccck..',
      '..kcccccccccck..',
      '..kddddddddddk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
      '................',
    ],
  },
  archive: {
    base: '#8b5e3c',
    accent: '#e8b33c',
    rows: [
      '................',
      '..kkkkkkkkkkkk..',
      '..kllllllllllk..',
      '..kkkkkkkkkkkk..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kcccckkcccck..',
      '..kcccckkcccck..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kcccaaaaccck..',
      '..kcccccccccck..',
      '..kddddddddddk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
    ],
  },
  lock: {
    base: '#6e7385',
    accent: '#f5efdc',
    rows: [
      '................',
      '.....kkkkkk.....',
      '....kwwwwwwk....',
      '....kw....wk....',
      '....kw....wk....',
      '..kkkkkkkkkkkk..',
      '..kcccccccccck..',
      '..kcccwwccccck..',
      '..kcccwwccccck..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kddddddddddk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
      '................',
    ],
  },
  git: {
    base: '#e07a4f',
    accent: '#f5efdc',
    rows: [
      '................',
      '.......kk.......',
      '......kwwk......',
      '......kwwk......',
      '.......kk.......',
      '.......kk.......',
      '.......kk.......',
      '.......kkkk.....',
      '.......kk.kk....',
      '.......kk..kk...',
      '.......kk..kwwk.',
      '.......kk...kk..',
      '......kwwk......',
      '.......kk.......',
      '................',
      '................',
    ],
  },
  folder: {
    base: '#e07a4f',
    accent: '#8b5e3c',
    rows: [
      '................',
      '................',
      '..kkkk..........',
      '..klllk.........',
      '..kllllkkkkkk...',
      '..kllllllllllk..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kddddddddddk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
      '................',
    ],
  },
  folder_open: {
    base: '#e07a4f',
    accent: '#8b5e3c',
    rows: [
      '................',
      '..kkkk..........',
      '..klllk.........',
      '..kllllkkkkkk...',
      '..kllllllllllk..',
      '..kkkkkkkkkkkk..',
      '..kbbbbbbbbbbk..',
      '..kbkkkkkkkkbk..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kcccccccccck..',
      '..kddddddddddk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
      '................',
    ],
  },
};

const LOGO_ROWS = [
  '................',
  '..kkkkkkkkkkkk..',
  '..kcccccccccck..',
  '..kccsssssccck..',
  '..kccsssssccck..',
  '..kcccccccccck..',
  '..kcccccccccck..',
  '..kcccccccccck..',
  '..kwwwwwwwwwwk..',
  '..kwwwwwwwwwwk..',
  '..kwwwwwwwwwwk..',
  '..kwwwwwwwwwwk..',
  '..kwwwwwwwwwwk..',
  '..kkkkkkkkkkkk..',
  '................',
  '................',
];

function spriteSvg(name) {
  const def = SPRITE_DEFS[name];
  if (!def) throw new Error(`Sprite desconocido: ${name}`);
  const colors = {
    k: INK,
    w: CREAM,
    s: STEAM,
    c: def.base,
    l: light(def.base, 0.3),
    d: dark(def.base, 0.32),
    b: dark(def.base, 0.46),
    a: def.accent || dark(def.base, 0.46),
  };
  const c = createCanvas();
  def.rows.forEach((row, y) => {
    if (row.length !== 16) {
      throw new Error(`La fila ${y} de ${name} mide ${row.length}, se esperaban 16`);
    }
    row.split('').forEach((cell, x) => {
      if (colors[cell]) setPixel(c, x, y, colors[cell]);
    });
  });
  return svgFromCanvas(c);
}

function logoSvg() {
  const c = createCanvas();
  const colors = {
    k: INK,
    w: CREAM,
    s: '#a8aebb',
    c: '#45a8a0',
    l: light('#45a8a0', 0.3),
    d: dark('#45a8a0', 0.32),
  };
  LOGO_ROWS.forEach((row, y) => {
    if (row.length !== 16) throw new Error(`La fila ${y} del logo mide ${row.length}`);
    row.split('').forEach((cell, x) => {
      if (colors[cell]) setPixel(c, x, y, colors[cell]);
    });
  });
  drawText(c, '8B', 4, 8, INK);
  return svgFromCanvas(c);
}

module.exports = {
  INK,
  CREAM,
  pageSvg,
  spriteSvg,
  fileSvg,
  logoSvg,
  svgFromCanvas,
};
