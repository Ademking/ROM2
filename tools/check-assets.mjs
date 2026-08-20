// Reports which files `manifest.json` and `audio.json` ask for that are not in
// `public/`. Pass --list to print every missing path, one per line, so the list
// can be fed to a downloader or handed to whoever has the full asset set.
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const GAME_DIR = 'public/games/rage-of-magic-ii';
const AUDIO_DIR = 'public/audio/rage-of-magic';

const manifest = JSON.parse(readFileSync(`${GAME_DIR}/manifest.json`, 'utf8'));
const audio = JSON.parse(readFileSync(`${AUDIO_DIR}/audio.json`, 'utf8'));

const GROUPS = [
  {
    name: 'atlases',
    dir: `${GAME_DIR}/atlases`,
    urls: Object.values(manifest.atlases).map((a) => a.image),
  },
  {
    name: 'images',
    dir: `${GAME_DIR}/images`,
    urls: Object.values(manifest.images).map((i) => i.url),
  },
  {
    name: 'sounds',
    dir: `${AUDIO_DIR}/sounds`,
    urls: Object.values(audio.sounds).map((s) => s.url),
  },
];

const listOnly = process.argv.includes('--list');
const missing = [];

for (const group of GROUPS) {
  const present = existsSync(group.dir) ? new Set(readdirSync(group.dir)) : new Set();
  const wanted = [...new Set(group.urls)];
  const absent = wanted.filter((url) => !present.has(url.split('/').pop()));
  missing.push(...absent);
  if (!listOnly) {
    console.log(
      `${group.name.padEnd(8)} ${wanted.length - absent.length}/${wanted.length} present` +
        (absent.length ? `  (${absent.length} missing)` : ''),
    );
  }
}

if (listOnly) {
  console.log(missing.join('\n'));
} else if (missing.length) {
  console.log(`\n${missing.length} files missing. The game stops at the first one it needs.`);
  console.log('Run with --list to print them all.');
  process.exitCode = 1;
} else {
  console.log('\nAll assets present.');
}
