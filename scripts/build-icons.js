'use strict';

/**
 * Genera los iconos 8-bit y el mapa del tema desde una sola tabla.
 *
 * Uso: node scripts/build-icons.js
 */

const fs = require('fs');
const path = require('path');
const { pageSvg, spriteSvg, fileSvg, logoSvg } = require('./pixel-art');

const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'icons');
const THEME_PATH = path.join(ROOT, 'themes', '8bit-icons-theme.json');

const PALETTE = {
  yellow: '#e8b33c',
  orange: '#e07a4f',
  red: '#c24e4e',
  magenta: '#c05c9e',
  purple: '#8a5aa8',
  blue: '#4e7fb8',
  sky: '#4e9ec7',
  teal: '#45a8a0',
  green: '#5da85d',
  lime: '#a8c256',
  brown: '#8b5e3c',
  slate: '#6e7385',
};

const SPECIAL_ICONS = {
  leaf: '../icons/8bit-leaf.svg',
  note: '../icons/8bit-note.svg',
  coffee: '../icons/8bit-coffee.svg',
  image: '../icons/8bit-image.svg',
  video: '../icons/8bit-video.svg',
  archive: '../icons/8bit-archive.svg',
  lock: '../icons/8bit-lock.svg',
  folder: '../icons/8bit-folder.svg',
  folder_open: '../icons/8bit-folder-open.svg',
  file: '../icons/8bit-file.svg',
};

/** Páginas de lenguaje: color de la familia, sigla (máx. 2) o glifo. */
const PAGES = {
  js: { label: 'JS', color: 'yellow' },
  ts: { label: 'TS', color: 'blue' },
  react: { label: 'RX', color: 'sky' },
  python: { label: 'PY', color: 'blue', accent: PALETTE.yellow },
  rust: { label: 'RS', color: 'orange' },
  go: { label: 'GO', color: 'teal' },
  c: { label: 'C', color: 'blue' },
  cpp: { label: 'C+', color: 'blue' },
  csharp: { label: 'C#', color: 'purple' },
  kotlin: { label: 'K', color: 'purple' },
  swift: { label: 'SW', color: 'orange' },
  ruby: { label: 'RB', color: 'red' },
  php: { label: 'PH', color: 'purple' },
  lua: { label: 'LU', color: 'blue' },
  r: { label: 'R', color: 'blue' },
  dart: { label: 'D', color: 'teal' },
  scala: { label: 'SC', color: 'red' },
  perl: { label: 'PL', color: 'blue' },
  elixir: { label: 'EX', color: 'purple' },
  erlang: { label: 'ER', color: 'red' },
  clojure: { label: 'CJ', color: 'green' },
  haskell: { label: 'HS', color: 'purple' },
  fsharp: { label: 'F#', color: 'blue' },
  vb: { label: 'VB', color: 'blue' },
  pascal: { label: 'PA', color: 'blue' },
  nim: { label: 'NI', color: 'yellow' },
  zig: { label: 'ZI', color: 'yellow' },
  solidity: { label: 'SO', color: 'slate' },
  verilog: { label: 'V', color: 'green' },
  vhdl: { label: 'VH', color: 'green' },
  julia: { label: 'JL', color: 'purple' },
  ocaml: { label: 'ML', color: 'yellow' },
  lisp: { label: 'LI', color: 'slate' },
  fortran: { label: 'FO', color: 'blue' },
  groovy: { label: 'GR', color: 'sky' },
  asm: { label: 'AS', color: 'slate' },
  shell: { label: 'SH', color: 'green' },
  powershell: { label: 'PS', color: 'blue' },
  bat: { label: 'BA', color: 'slate' },
  sql: { label: 'DB', color: 'slate' },
  html: { label: 'HT', color: 'orange' },
  css: { label: 'CS', color: 'blue' },
  scss: { label: 'SS', color: 'magenta' },
  less: { label: 'LS', color: 'sky' },
  vue: { label: 'VU', color: 'green' },
  svelte: { label: 'SV', color: 'orange' },
  astro: { label: 'AT', color: 'purple' },
  json: { label: 'JN', color: 'yellow' },
  yaml: { label: 'YA', color: 'red' },
  toml: { label: 'TM', color: 'slate' },
  config: { label: 'CF', color: 'slate' },
  xml: { label: 'XM', color: 'brown' },
  tex: { label: 'TX', color: 'green' },
  code: { label: '<>', color: 'slate' },
  git: { label: 'GT', color: 'orange' },
  pdf: { label: 'P', color: 'red' },
  word: { label: 'W', color: 'blue' },
  slides: { label: 'P', color: 'orange' },
  font: { label: 'A', color: 'slate' },
  table: { glyph: 'grid', color: 'green' },
  docker: { label: 'DK', color: 'sky' },
};

const EXTENSIONS = {
  leaf: ['md', 'mdx', 'markdown', 'mdown', 'mkd', 'rst', 'adoc', 'txt', 'log', 'org'],
  note: ['mp3', 'wav', 'flac', 'ogg', 'oga', 'm4a', 'm4b', 'aac', 'opus', 'aiff', 'aif', 'wma', 'mid', 'midi'],
  coffee: ['java', 'jar', 'class', 'jsp', 'coffee', 'litcoffee'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tif', 'tiff', 'psd', 'ai', 'svg', 'avif', 'heic'],
  video: ['mp4', 'm4v', 'mkv', 'mov', 'avi', 'webm', 'wmv', 'flv', 'mpg', 'mpeg', 'ogv'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'zst', 'lz4'],
  lock: ['lock'],
  js: ['js', 'mjs', 'cjs'],
  react: ['jsx', 'tsx'],
  ts: ['ts', 'mts', 'cts'],
  python: ['py', 'pyw', 'pyi', 'ipynb'],
  rust: ['rs'],
  go: ['go'],
  c: ['c', 'h'],
  cpp: ['cpp', 'cc', 'cxx', 'hpp', 'hxx', 'hh', 'ino', 'mm'],
  csharp: ['cs', 'csx'],
  kotlin: ['kt', 'kts'],
  swift: ['swift'],
  ruby: ['rb', 'erb', 'rake', 'gemspec'],
  php: ['php', 'phtml', 'php3', 'php4', 'php5', 'phps'],
  lua: ['lua'],
  r: ['r'],
  dart: ['dart'],
  scala: ['scala', 'sc'],
  perl: ['pl', 'pm'],
  elixir: ['ex', 'exs'],
  erlang: ['erl', 'hrl'],
  clojure: ['clj', 'cljs', 'cljc', 'edn'],
  haskell: ['hs', 'lhs'],
  fsharp: ['fs', 'fsx', 'fsi'],
  vb: ['vb', 'vbs'],
  pascal: ['pas', 'pp'],
  nim: ['nim'],
  zig: ['zig'],
  solidity: ['sol'],
  verilog: ['v', 'sv'],
  vhdl: ['vhd', 'vhdl'],
  julia: ['jl'],
  ocaml: ['ml', 'mli'],
  lisp: ['lisp', 'el', 'scm', 'rkt'],
  fortran: ['f', 'f90', 'f95', 'f03'],
  groovy: ['groovy', 'gradle'],
  asm: ['asm', 's', 'nasm', 'basm', 'spasm'],
  shell: ['sh', 'bash', 'zsh', 'fish', 'ksh', 'ash'],
  powershell: ['ps1', 'psm1', 'psd1'],
  bat: ['bat', 'cmd'],
  sql: ['sql', 'sqlite'],
  html: ['html', 'htm', 'xhtml'],
  css: ['css'],
  scss: ['scss', 'sass'],
  less: ['less'],
  vue: ['vue'],
  svelte: ['svelte'],
  astro: ['astro'],
  json: ['json', 'jsonc', 'json5', 'jsonl', 'ndjson', 'webmanifest'],
  yaml: ['yaml', 'yml'],
  toml: ['toml'],
  config: ['ini', 'cfg', 'conf', 'config', 'env', 'properties'],
  xml: ['xml', 'xsl', 'xslt', 'xsd', 'dtd', 'plist', 'csproj', 'vbproj', 'fsproj', 'props', 'targets', 'resx'],
  tex: ['tex', 'sty', 'cls', 'bib'],
  code: ['m'],
  font: ['ttf', 'otf', 'woff', 'woff2', 'eot'],
  table: ['csv', 'tsv', 'xls', 'xlsx', 'xlsm', 'ods'],
  pdf: ['pdf'],
  word: ['doc', 'docx', 'odt', 'rtf'],
  slides: ['ppt', 'pptx', 'odp', 'key'],
};

const FILE_NAMES = {
  leaf: ['readme', 'readme.md', 'readme.txt', 'license', 'license.md', 'license.txt', 'copying', 'notice', 'authors', 'contributors', 'changelog', 'changelog.md', 'history.md'],
  js: ['package.json'],
  ts: ['tsconfig.json', 'jsconfig.json'],
  lock: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'cargo.lock', 'composer.lock', 'gemfile.lock', 'poetry.lock', 'pipfile.lock', 'mix.lock', 'pubspec.lock'],
  rust: ['cargo.toml'],
  go: ['go.mod', 'go.sum'],
  python: ['requirements.txt', 'pyproject.toml', 'pipfile', 'setup.py', 'manage.py'],
  ruby: ['gemfile', 'rakefile'],
  php: ['composer.json'],
  dart: ['pubspec.yaml'],
  coffee: ['pom.xml'],
  docker: ['dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore', 'compose.yml', 'compose.yaml'],
  git: ['.gitignore', '.gitattributes', '.gitmodules', '.gitconfig', '.gitkeep'],
  groovy: ['build.gradle', 'settings.gradle', 'gradlew'],
  config: ['makefile', 'cmakelists.txt', 'justfile', '.editorconfig', '.npmrc', '.nvmrc', '.prettierrc', '.eslintrc', '.babelrc', 'vite.config.js', 'vite.config.ts', 'webpack.config.js', 'rollup.config.js', 'gradle.properties'],
  shell: ['mvnw'],
};

const LANGUAGE_IDS = {
  leaf: ['markdown', 'plaintext', 'restructuredtext', 'asciidoc'],
  coffee: ['java', 'coffeescript'],
  js: ['javascript'],
  react: ['javascriptreact', 'typescriptreact'],
  ts: ['typescript'],
  python: ['python'],
  rust: ['rust'],
  go: ['go'],
  c: ['c'],
  cpp: ['cpp', 'objective-cpp'],
  csharp: ['csharp'],
  kotlin: ['kotlin'],
  swift: ['swift'],
  ruby: ['ruby'],
  php: ['php'],
  lua: ['lua'],
  r: ['r'],
  dart: ['dart'],
  scala: ['scala'],
  perl: ['perl'],
  elixir: ['elixir'],
  erlang: ['erlang'],
  clojure: ['clojure'],
  haskell: ['haskell'],
  fsharp: ['fsharp'],
  vb: ['vb'],
  pascal: ['pascal'],
  nim: ['nim'],
  zig: ['zig'],
  solidity: ['solidity'],
  verilog: ['verilog', 'systemverilog'],
  vhdl: ['vhdl'],
  julia: ['julia'],
  ocaml: ['ocaml'],
  lisp: ['lisp'],
  fortran: ['fortran'],
  groovy: ['groovy'],
  asm: ['asm', 'assembly'],
  shell: ['shellscript', 'shell'],
  powershell: ['powershell'],
  bat: ['bat'],
  sql: ['sql'],
  html: ['html', 'razor'],
  css: ['css'],
  scss: ['scss'],
  less: ['less'],
  vue: ['vue'],
  svelte: ['svelte'],
  astro: ['astro'],
  json: ['json', 'jsonc'],
  yaml: ['yaml'],
  toml: ['toml'],
  config: ['ini', 'properties', 'dotenv'],
  xml: ['xml'],
  tex: ['latex', 'tex'],
  code: ['matlab'],
  docker: ['dockerfile'],
  git: ['git-commit', 'git-rebase'],
};

function buildMap(groups, kind) {
  const map = {};
  for (const [icon, values] of Object.entries(groups)) {
    if (!(icon in PAGES) && !(icon in SPECIAL_ICONS)) {
      throw new Error(`El icono "${icon}" no existe (${kind})`);
    }
    for (const value of values) {
      if (map[value] && map[value] !== '_' + icon) {
        throw new Error(`Conflicto en ${kind} "${value}": ${map[value]} y _${icon}`);
      }
      map[value] = '_' + icon;
    }
  }
  return Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
}

function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true });

  for (const [id, spec] of Object.entries(PAGES)) {
    const resolved = { ...spec, color: PALETTE[spec.color] };
    if (!resolved.color) throw new Error(`Color desconocido en ${id}: ${spec.color}`);
    fs.writeFileSync(path.join(ICONS_DIR, `8bit-${id}.svg`), pageSvg(resolved));
  }

  for (const id of ['leaf', 'note', 'coffee', 'image', 'video', 'archive', 'lock', 'folder', 'folder_open']) {
    const file = id === 'folder_open' ? '8bit-folder-open.svg' : `8bit-${id}.svg`;
    fs.writeFileSync(path.join(ICONS_DIR, file), spriteSvg(id));
  }

  fs.writeFileSync(path.join(ICONS_DIR, '8bit-file.svg'), fileSvg());
  fs.writeFileSync(path.join(ICONS_DIR, 'icon.svg'), logoSvg());

  const iconDefinitions = {};
  for (const [id, iconPath] of Object.entries(SPECIAL_ICONS)) {
    iconDefinitions['_' + id] = { iconPath };
  }
  for (const id of Object.keys(PAGES)) {
    iconDefinitions['_' + id] = { iconPath: `../icons/8bit-${id}.svg` };
  }

  const theme = {
    iconDefinitions,
    file: '_file',
    folder: '_folder',
    folderExpanded: '_folder_open',
    fileExtensions: buildMap(EXTENSIONS, 'extensión'),
    fileNames: buildMap(FILE_NAMES, 'nombre'),
    languageIds: buildMap(LANGUAGE_IDS, 'languageId'),
  };

  fs.writeFileSync(THEME_PATH, JSON.stringify(theme, null, 2) + '\n');

  console.log(`Páginas: ${Object.keys(PAGES).length}`);
  console.log(`Definiciones: ${Object.keys(iconDefinitions).length}`);
  console.log(`Extensiones: ${Object.keys(theme.fileExtensions).length}`);
  console.log(`Nombres: ${Object.keys(theme.fileNames).length}`);
  console.log(`languageIds: ${Object.keys(theme.languageIds).length}`);
}

main();
