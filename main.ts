import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const source = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

mkdirSync(output, { recursive: true });
cpSync(join(source, 'app'), join(output, 'app'), { recursive: true });

const captures = join(source, 'screenshots');
if (existsSync(captures)) {
  cpSync(captures, join(output, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});

writeFileSync(join(output, 'dossier.json'), dossier);
console.log('Static app, captures, and dossier are ready in ' + output);
