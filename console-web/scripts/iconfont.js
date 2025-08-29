#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple copy of ipms-font outputs into src/styles/iconfont
const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'ipms-font');
const outFontDir = path.join(projectRoot, 'src/styles/iconfont');
const outStyleDir = path.join(projectRoot, 'src/styles');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(outFontDir);
ensureDir(outStyleDir);

// If custom-icon.less exists in src/styles, keep it; otherwise create a minimal one
const customIconLess = path.join(outStyleDir, 'custom-icon.less');
if (!fs.existsSync(customIconLess)) {
  const tpl = `@font-face {\n  font-family: "Ionicons";\n  src: url('./iconfont/Ionicons.eot');\n  src: url('./iconfont/Ionicons.eot#iefix') format('embedded-opentype'),\n       url('./iconfont/Ionicons.ttf') format('truetype'),\n       url('./iconfont/Ionicons.woff') format('woff'),\n       url('./iconfont/Ionicons.woff2') format('woff2'),\n       url('./iconfont/Ionicons.svg') format('svg');\n}\n`;
  fs.writeFileSync(customIconLess, tpl);
}

// Copy known iconfont assets from ipms-font to src/styles/iconfont if present
const assets = ['Ionicons.eot', 'Ionicons.ttf', 'Ionicons.woff', 'Ionicons.woff2', 'Ionicons.svg'];
assets.forEach(name => {
  const from = path.join(projectRoot, 'src/styles/iconfont', name);
  if (fs.existsSync(from)) return; // already generated
  const candidates = [
    path.join(srcDir, name),
    path.join(srcDir, 'dist', name),
  ];
  const src = candidates.find(p => fs.existsSync(p));
  if (src) {
    fs.copyFileSync(src, path.join(outFontDir, name));
  }
});

console.log('iconfont assets ensured.');

