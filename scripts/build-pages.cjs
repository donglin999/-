'use strict';
// Cloudflare Pages: deploy only browser runtime files, never local notes or credentials.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(out, 'index.html'));
fs.cpSync(path.join(root, 'js'), path.join(out, 'js'), { recursive: true });
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), {
  recursive: true,
  filter: source => !source.split(path.sep).some(part => part === 'review' || part === 'voice_pick') && path.basename(source) !== '.DS_Store',
});
console.log(`Cloudflare Pages output: ${out}`);
