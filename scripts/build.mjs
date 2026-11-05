import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(root, 'cloud-functions');
const distDir = join(root, 'dist');

// 1. 确保 dist 目录存在，但严禁生成 dist/index.html
// 警告：如果存在 dist/index.html，EdgeOne 边缘 CDN 会开启全局 SPA 重写，
// 将包括 /api/* 在内的所有动态请求全部当成静态页面重写到 index.html，导致云函数完全无法接收到 API 请求！
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, '.gitkeep'), '', 'utf8');
console.log('✓ 清理并准备输出目录 dist (保持纯净，由云函数全权托管全站路由与API)');

// 2. 打包 EdgeOne 云函数
if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true });
}

console.log('[Build] 开始打包 EdgeOne 云函数...');

await esbuild.build({
  entryPoints: [join(root, 'src/edgeone-entry.js')],
  outfile: join(outdir, '[[default]].js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  external: [],
  legalComments: 'none',
  minify: false,
  logLevel: 'info',
});

// 3. 生成全自包含的专属路由映射产物 (杜绝相对引用薄壳，确保平台边缘执行 100% 自包含)
const bundlePath = join(outdir, '[[default]].js');

// 根映射
copyFileSync(bundlePath, join(outdir, 'index.js'));

// /api/cron/tick 专属路由
const cronDir = join(outdir, 'api', 'cron');
if (!existsSync(cronDir)) {
  mkdirSync(cronDir, { recursive: true });
}
copyFileSync(bundlePath, join(cronDir, 'tick.js'));
copyFileSync(bundlePath, join(cronDir, 'index.js'));

// /api/* 通配路由
const apiDir = join(outdir, 'api');
copyFileSync(bundlePath, join(apiDir, '[[default]].js'));

console.log('✓ 函数全自包含打包完成: [[default]].js, index.js, api/cron/tick.js, api/[[default]].js');
