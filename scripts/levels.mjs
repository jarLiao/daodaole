// 离线挑关卡种子：每关生成一批候选，用「模拟玩家要撤销几次」排难度，按关卡参数的 pick 百分位取一个，写回 src/game.html
// 用法：node scripts/levels.mjs [最大关数=60] [all|challenge|casual]
import { readFileSync, writeFileSync } from 'node:fs';
import { loadEngine, GAME } from './engine.mjs';

const MAX = Number(process.argv[2] || 60), which = process.argv[3] || 'all';
const E = loadEngine();
let html = readFileSync(GAME, 'utf8');
for (const mode of ['challenge', 'casual']) {
  if (which !== 'all' && which !== mode) continue;
  const out = [];
  for (let L = 1; L <= MAX; L++) {
    const P = E.levelParams(L, mode), cands = [];
    for (let seed = 1; seed <= (P.fixed ? 1 : 24); seed++) {
      const g = E.generateSeed(L, seed, mode), r = g && E.scoreLevel(g, 12);
      if (r && r.dead < 999) cands.push({ seed, ...r });
    }
    cands.sort((a, b) => a.dead - b.dead || b.zero - a.zero);
    const c = cands[Math.round(P.pick * (cands.length - 1))];
    out.push([c.seed, c.par]);
    console.log(`${mode === 'casual' ? '爽玩' : '挑战'} ${String(L).padStart(2)}  ${P.colors} 色${P.hidden ? ' 问号' : ''}  候选 ${cands.length}  选中撤销 ${c.dead} 次 · 不撤销就过 ${(c.zero * 100).toFixed(0)}% · 标准 ${c.par} 步`);
  }
  const tag = mode === 'casual' ? 'CASUAL-SEEDS' : 'SEEDS', name = mode === 'casual' ? 'CASUAL_SEEDS' : 'LEVEL_SEEDS';
  const re = new RegExp(String.raw`/\*${tag}-START\*/[\s\S]*?/\*${tag}-END\*/`);
  if (!re.test(html)) throw new Error(`没找到 ${tag} 标记，种子表没写回`);
  html = html.replace(re, `/*${tag}-START*/const ${name}=${JSON.stringify(out)};/*${tag}-END*/`);
}
writeFileSync(GAME, html);
console.log('已写回 src/game.html');
