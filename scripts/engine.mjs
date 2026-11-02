// 从 src/game.html 里取出规则引擎，供离线脚本使用，保证脚本和游戏跑的是同一份代码
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const GAME = join(ROOT, 'src', 'game.html');

export function loadEngine() {
  const code = readFileSync(GAME, 'utf8').split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
  const names = ['CAP', 'rngOf', 'cpS', 'canPour', 'pourAmt', 'applyPour', 'isSolved', 'isDone', 'isMono', 'legalMoves', 'usefulMoves',
    'onlyMerges', 'keyOf', 'solve', 'levelParams', 'generateSeed', 'generate', 'deadStats', 'scoreLevel', 'LEVEL_SEEDS', 'CASUAL_SEEDS'];
  return new Function(`${code};return{${names.join(',')}};`)();
}
