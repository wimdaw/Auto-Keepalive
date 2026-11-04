import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(root, 'cloud-functions');

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
  minify: false, // 保持代码可读排查
  logLevel: 'info',
});

// 生成 index.js 映射
writeFileSync(
  join(outdir, 'index.js'),
  "export { onRequest, default } from './[[default]].js';\n",
  'utf8'
);

console.log('✓ 函数打包完成: cloud-functions/[[default]].js 和 cloud-functions/index.js');
