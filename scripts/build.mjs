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

// 3. 生成根映射 (保持 cloud-functions 结构极简扁平，与 epay-pages 架构完全对齐)
const bundlePath = join(outdir, '[[default]].js');
copyFileSync(bundlePath, join(outdir, 'index.js'));

const apiDir = join(outdir, 'api');
if (existsSync(apiDir)) {
  rmSync(apiDir, { recursive: true, force: true });
}

console.log('✓ 函数全自包含打包完成: cloud-functions/[[default]].js 与 index.js');
