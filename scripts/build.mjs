// 把 src/game.html 包成可独立打开的 index.html（GitHub Pages 用）
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, GAME } from './engine.mjs';

const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23fbeedb'/%3E%3Cpath d='M22 10v34a10 10 0 0 0 20 0V10' fill='none' stroke='%239fb2c8' stroke-width='4'/%3E%3Cpath d='M24 34h16v10a8 8 0 0 1-16 0z' fill='%23e8463a'/%3E%3Cpath d='M24 24h16v10H24z' fill='%23f6d33c'/%3E%3C/svg%3E";
const head = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#f3d2a2">
<meta name="description" content="倒倒乐：倒水排序小游戏，每关都保证有解。">
<link rel="icon" href="${ICON}">
</head>
<body>
`;
writeFileSync(join(ROOT, 'index.html'), head + readFileSync(GAME, 'utf8') + '\n</body>\n</html>\n');
console.log('已生成 index.html');
