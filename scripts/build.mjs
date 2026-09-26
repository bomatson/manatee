// Renders the page and copies the assets into dist/ for static hosting.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jade = require('jade');

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', jade.renderFile('views/root.jade', { title: 'Manatees!' }));
cpSync('public', 'dist', { recursive: true });
writeFileSync('dist/.nojekyll', '');
console.log('built dist/');
