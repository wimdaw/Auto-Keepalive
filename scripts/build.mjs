import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(root, 'cloud-functions');
const distDir = join(root, 'dist');

// 1. 提取 worker 中的 UI_HTML 写入 dist/index.html，确保静态面板秒开且完全满足 EdgeOne Pages 静态输出目录规范
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });

const workerFile = readFileSync(join(root, 'worker v1.3.0.js'), 'utf8');
const match = workerFile.match(/const UI_HTML = `([\s\S]*?)`;\n\n\/\/ --- Web Crypto API/);
if (match && match[1]) {
  writeFileSync(join(distDir, 'index.html'), match[1].trim(), 'utf8');
  console.log('✓ 成功生成静态面板 dist/index.html');
} else {
  writeFileSync(join(distDir, 'index.html'), '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Auto-Keepalive</title></head><body><script>location.href="/"</script></body></html>', 'utf8');
  console.log('! 兜底生成 dist/index.html');
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

// 3. 写入标准桥接 index.js (保持与 epay-pages 架构完全对齐)
writeFileSync(join(outdir, 'index.js'), "export { onRequest, default } from './[[default]].js';\n", 'utf8');

const apiDir = join(outdir, 'api');
if (existsSync(apiDir)) {
  rmSync(apiDir, { recursive: true, force: true });
}

console.log('✓ 函数全自包含打包完成: cloud-functions/[[default]].js 与 index.js');
