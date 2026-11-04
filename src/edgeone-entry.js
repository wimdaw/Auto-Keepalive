/**
 * EdgeOne Makers Node.js 云函数入口
 *
 * 职责：
 * 1. 拦截 EdgeOne Schedules 定时任务请求（例如 /api/cron/tick 或带有 CRON_TOKEN 的调用），
 *    自动桥接执行 Auto-Keepalive 原版的 scheduled(event, env, ctx) 保活探测逻辑；
 * 2. 初始化 EdgeOne Blob 并包装为标准的 env.DB (兼容 Cloudflare KV 读写)；
 * 3. 将其余 HTTP 请求分发给原版 worker 的 fetch(request, env, ctx)。
 */
import worker from '../worker v1.3.0.js';
import { createBlobKV } from './blob-kv.js';

let cachedDB = null;

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
  const req = await materializeRequest(context.request);
  const url = new URL(req.url);
  const env = resolveEnv(context.env);

  // 1. 定时任务触发点（EdgeOne schedules 默认打 /api/cron/tick）
  if (url.pathname === '/api/cron/tick' || url.pathname === '/api/cron') {
    const cronToken = env.CRON_TOKEN;
    const reqToken = url.searchParams.get('token');

    // 如果配置了 CRON_TOKEN 则校验口令
    if (cronToken && reqToken !== cronToken) {
      return new Response(JSON.stringify({ status: 'error', message: 'Unauthorized cron token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const scheduledEvent = {
        cron: '* * * * *',
        type: 'scheduled',
        scheduledTime: Date.now()
      };
      const executionCtx = {
        waitUntil: (promise) => {
          Promise.resolve(promise).catch((err) => console.error('[Cron waitUntil Error]', err));
        },
        passThroughOnException: () => {}
      };

      await worker.scheduled(scheduledEvent, env, executionCtx);

      return new Response(JSON.stringify({ status: 'ok', message: 'Keepalive check executed successfully', timestamp: Date.now() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('[Cron Execution Error]', err);
      return new Response(JSON.stringify({ status: 'error', message: err?.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 2. 正常 Web 界面与业务 API 分发
  const executionCtx = {
    waitUntil: (p) => Promise.resolve(p).catch(console.error),
    passThroughOnException: () => {}
  };

  return await worker.fetch(req, env, executionCtx);
}

export default {
  onRequest,
  fetch: (request, env, ctx) => onRequest({ request, env, ...ctx })
};
