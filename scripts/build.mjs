import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(root, 'cloud-functions');
const distDir = join(root, 'dist');

// 1. 准备静态输出目录 dist
// ⚠️ 严禁在 dist 下生成 index.html！
// EdgeOne 边缘 CDN 会把带有 index.html 的项目判定为 SPA 站点，将包括 /api/* 在内的所有动态请求全部重写回退到 index.html，
// 从而导致云函数完全无法接收到 /api/cron/tick 等接口请求。
// 我们在 dist 放置标准的 robots.txt 保证 Pages 静态输出目录合法且非空，全站路由与动态 API 由云函数完全统一接管。
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'robots.txt'), 'User-agent: *\nDisallow:\n', 'utf8');
console.log('✓ 成功准备静态目录 dist/robots.txt (无 index.html SPA 拦截)');

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

// 3. 写入标准桥接 index.js (保证根路径 / 导向 [[default]].js，与 epay-pages 完全一致)
writeFileSync(join(outdir, 'index.js'), "export { onRequest, default } from './[[default]].js';\n", 'utf8');

const apiDir = join(outdir, 'api');
if (existsSync(apiDir)) {
  rmSync(apiDir, { recursive: true, force: true });
}

console.log('✓ 函数全自包含打包完成: cloud-functions/[[default]].js 与 index.js');
