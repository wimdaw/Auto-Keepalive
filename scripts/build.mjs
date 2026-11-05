import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(root, 'cloud-functions');
const distDir = join(root, 'dist');

// 1. 生成静态资源 dist/index.html (EdgeOne 优先静态分发，秒级直出且防止 404)
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

const workerCode = readFileSync(join(root, 'worker v1.3.0.js'), 'utf8');
const match = workerCode.match(/const UI_HTML = `([\s\S]*?)`;\n\n\/\/ --- Web Crypto API/);

if (match && match[1]) {
  writeFileSync(join(distDir, 'index.html'), match[1].trim(), 'utf8');
  console.log('✓ 生成静态主页: dist/index.html');
} else {
  console.warn('⚠️ 未正则匹配到 UI_HTML，尝试通过 worker fetch 提取...');
}

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
