import { cp, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
if (manifest.display !== 'standalone') throw new Error('Build de produção ausente.');
await readFile('dist-demo/demo.html');
await cp('dist-demo', 'dist', { recursive: true });
await writeFile('dist/.nojekyll', '');
process.stdout.write('dist contém a PWA e a demonstração em memória.\n');
