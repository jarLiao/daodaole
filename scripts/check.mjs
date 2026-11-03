// 回归检查：1) 每关标准解逐步回放，每一步都合法且最终倒完；2) 随机乱倒到任意局面后，
// 「退回到最近能解的那一步」一定存在（开局有解），加一个空瓶后求解器给出的解也逐步合法
// 3) 每日挑战未来 120 天都能生成、有解、同一天结果一致
// 用法：node scripts/check.mjs [最大关数=60]
import { loadEngine } from './engine.mjs';

const MAX = Number(process.argv[2] || 60);
const E = loadEngine();
let fail = 0, trials = 0, rescued = 0, slow = 0;
const replay = (s, path) => { for (const [i, j] of path) { if (!E.canPour(s, i, j)) return null; s = E.applyPour(s, i, j); } return s; };
for (const mode of ['challenge', 'casual'])
  for (let L = 1; L <= MAX; L++) {
    const g = E.generate(L, mode), tag = `${mode === 'casual' ? '爽玩' : '挑战'}第 ${L} 关`;
    if (!g) { console.log(`${tag}：生成失败`); fail++; continue; }
    const r = E.solve(g.s, 80000, 1.5);
    const end = r.ok && replay(g.s, r.path);
    if (!end || !E.isSolved(end)) { console.log(`${tag}：标准解回放失败`); fail++; }
    for (let k = 0; k < 3; k++) {
      const rng = E.rngOf(L * 131 + k);
      let s = g.s; const hist = [s];
      for (let n = 0; n < 12; n++) { const ms = E.legalMoves(s); if (!ms.length) break; const [i, j] = ms[Math.floor(rng() * ms.length)]; s = E.applyPour(s, i, j); hist.push(s); }
      trials++;
      const t0 = performance.now();
      let back = hist.length - 1;
      while (back > 0 && !E.solve(hist[back], 20000, 2).ok) back--;
      slow = Math.max(slow, performance.now() - t0);
      if (!E.solve(hist[back], 20000, 2).ok) { console.log(`${tag}：退回后仍无解`); fail++; }
      if (back < hist.length - 1) rescued++;
      const plus = { cap: s.cap, t: [...s.t.map(x => x.slice()), []] }, pr = E.solve(plus, 20000, 2);
      if (pr.ok && !E.isSolved(replay(plus, pr.path) || plus)) { console.log(`${tag}：加瓶后解不合法`); fail++; }
    }
  }
// 3) 每日挑战：从今天起 120 天，每天都生成得出、标准解回放合法，同一天两次生成完全一样
const d0 = Math.floor(Date.now() / 864e5); let dailyOk = 0;
for (let d = d0; d < d0 + 120; d++) {
  const g = E.generateDaily(d), tag = `每日挑战 ${new Date(d * 864e5).toISOString().slice(0, 10)}`;
  if (!g) { console.log(`${tag}：生成失败`); fail++; continue; }
  const r = E.solve(g.s, 80000, 1.5), end = r.ok && replay(g.s, r.path);
  if (!end || !E.isSolved(end)) { console.log(`${tag}：标准解回放失败`); fail++; continue; }
  if (E.keyOf(E.generateDaily(d).s) !== E.keyOf(g.s) || JSON.stringify(E.generateDaily(d).s) !== JSON.stringify(g.s)) { console.log(`${tag}：两次生成不一致`); fail++; continue; }
  dailyOk++;
}
console.log(`每日挑战 ${dailyOk}/120 天通过`);
console.log(`失败 ${fail}；乱倒 ${trials} 次，其中 ${rescued} 次走进死路并成功退回，最慢一次退回计算 ${slow.toFixed(0)} 毫秒`);
process.exit(fail ? 1 : 0);
