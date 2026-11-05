/**
 * EdgeOne Makers Node.js 云函数入口
 *
 * 职责：
 * 1. 拦截 EdgeOne Schedules 定时任务请求（例如 /api/cron/tick 或带有 CRON_TOKEN 的调用），
 *    自动桥接执行 Auto-Keepalive 原版的 scheduled(event, env, ctx) 保活探测逻辑；
 * 2. 初始化 EdgeOne Blob 并包装为标准的 env.DB (兼容 Cloudflare KV 读写)；
 * 3. 首次部署时若 Blob 为空，自动预置迁移 Cloudflare 线上现有保活任务配置；
 * 4. 将其余 HTTP 请求分发给原版 worker 的 fetch(request, env, ctx)。
 */
import worker from '../worker v1.3.0.js';
import { createBlobKV } from './blob-kv.js';

let cachedDB = null;
let seedInitialized = false;

// 从 Cloudflare 线上实例 status.moe.cloudns.nz 导出的保活任务基线
const SEED_CONFIG = {
  tasks: [
    {
      name: "Koyeb — 163",
      url: "https://163-mail-relay-wimdaw-9b2e7582.koyeb.app/",
      interval: 1,
      notifyChannels: [],
      status: "ok",
      lastCheck: 0
    },
    {
      name: "Koyeb — Ai-Gateway",
      url: "https://api-hackerxiaow-830602d5.koyeb.app/",
      interval: 1,
      notifyChannels: [],
      status: "ok",
      lastCheck: 0
    },
    {
      name: "文章创作流水线",
      url: "https://article.seurl.eu.org/",
      interval: 1,
      notifyChannels: [],
      status: "ok",
      lastCheck: 0
    },
    {
      name: "牛牛阅卷",
      url: "https://niu.seurl.eu.org/api/cron?token=nn_3ee1bee328613f342ac000ce2392227b",
      interval: 1,
      notifyChannels: [],
      status: "ok",
      lastCheck: 0
    },
    {
      name: "instabox-keepalive",
      url: "https://3000-agqzwed6kzp5uiuaqqqme7mrjm.instabox.tech",
      interval: 5,
      notifyChannels: [],
      status: "ok",
      lastCheck: 0
    }
  ],
  channels: []
};

function getDB(env) {
  if (!cachedDB) {
    cachedDB = createBlobKV(env);
  }
  return cachedDB;
}

function resolveEnv(contextEnv = {}) {
  const merged = { ...process.env, ...contextEnv };
  if (!merged.ADMIN_USER) merged.ADMIN_USER = 'admin';
  if (!merged.ADMIN_PASS) merged.ADMIN_PASS = 'yxy.@990524gdg';
  if (!merged.DB) {
    merged.DB = getDB(merged);
  }
  return merged;
}

/**
 * 自动数据迁移种子检查：若库里尚未存有 SYSTEM_CONFIG，写入线上 5 个保活任务
 */
async function ensureSeedConfig(db) {
  if (seedInitialized) return;
  try {
    const existing = await db.get('SYSTEM_CONFIG', 'json');
    if (!existing || !Array.isArray(existing.tasks) || existing.tasks.length === 0) {
      console.log('[Seed] 检测到 Blob 尚未初始化配置，正在写入 Cloudflare 迁移的 5 个保活链接...');
      await db.put('SYSTEM_CONFIG', JSON.stringify(SEED_CONFIG));
    }
    seedInitialized = true;
  } catch (err) {
    console.warn('[Seed] 初始化配置检测异常：', err?.message);
  }
}

/**
 * 请求体物化处理：避免 Node 运行时流式 body 并发被消费
 */
async function materializeRequest(req) {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    return req;
  }
  try {
    const buf = await req.arrayBuffer();
    return new Request(req.url, {
      method,
      headers: req.headers,
      body: buf.byteLength ? buf : undefined
    });
  } catch {
    return req;
  }
}

/**
 * EdgeOne onRequest 入口函数
 * context: { request, env, clientIp, geo, params }
 */
export async function onRequest(context) {
  try {
    const req = await materializeRequest(context.request);
    const url = new URL(req.url);
    const env = resolveEnv(context.env);

    // 0. 健康检查探针 (验证云函数是否正常接管流量)
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        ok: true,
        service: 'Auto-Keepalive-Pro',
        store: 'edgeone-blob',
        region: context?.server?.region || 'ap-hongkong',
        timestamp: Date.now()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 保证种子数据已就绪
    try {
      await ensureSeedConfig(env.DB);
    } catch (seedErr) {
      console.warn('[Seed Warn]', seedErr?.message);
    }

    const executionCtx = {
      waitUntil: (p) => Promise.resolve(p).catch(console.error),
      passThroughOnException: () => {}
    };

    // 交由包含原生 cron/tick 分发与全量鉴权的 worker.fetch 处理
    return await worker.fetch(req, env, executionCtx);
  } catch (fatalErr) {
    console.error('[Fatal onRequest Error]', fatalErr);
    return new Response(JSON.stringify({
      status: 'error',
      message: fatalErr?.message || String(fatalErr),
      stack: fatalErr?.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export default {
  onRequest,
  fetch: (request, env, ctx) => onRequest({ request, env, ...ctx })
};
