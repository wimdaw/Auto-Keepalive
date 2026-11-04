/**
 * EdgeOne Blob -> Cloudflare KV 兼容层
 *
 * Auto-Keepalive 系统依赖 Cloudflare KV 的三个 API：
 *   - DB.get(key, 'json') -> Promise<object | null>
 *   - DB.get(key, 'text') / DB.get(key) -> Promise<string | null>
 *   - DB.put(key, valueString) -> Promise<void>
 *
 * 本模块基于 @edgeone/pages-blob 实现强一致性的 KV 接口，同时支持：
 *   1. 平台注入凭据（EdgeOne Pages 生产环境自动注入）
 *   2. 显式环境变量凭据（EDGEONE_PROJECT_ID / EDGEONE_TOKEN 或 PAGES_BLOB_PROJECT_ID 等）
 *   3. 内存兜底存储（开发测试或本地单测使用）
 */
import { getStore } from '@edgeone/pages-blob';

const STORE_NAME = 'autokeepalive';

function createMemoryKV() {
  const map = new Map();
  return {
    async get(key, type) {
      const val = map.get(key);
      if (val === undefined || val === null) return null;
      if (type === 'json') {
        try { return JSON.parse(val); } catch { return null; }
      }
      return val;
    },
    async put(key, value) {
      map.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    async delete(key) {
      map.delete(key);
    }
  };
}

export function createBlobKV(env = {}) {
  // 测试或显式指定内存模式
  if (env.USE_MEMORY_STORE === '1' || process.env.USE_MEMORY_STORE === '1') {
    return createMemoryKV();
  }

  const storeName = env.BLOB_STORE_NAME || process.env.BLOB_STORE_NAME || STORE_NAME;
  const projectId = env.EDGEONE_PROJECT_ID || env.PAGES_PROJECT_ID || process.env.EDGEONE_PROJECT_ID || process.env.PAGES_PROJECT_ID || '';
  const token = env.EDGEONE_TOKEN || env.EDGEONE_PAGES_API_TOKEN || process.env.EDGEONE_TOKEN || process.env.EDGEONE_PAGES_API_TOKEN || '';

  let store = null;
  const resolveStore = () => {
    if (store) return store;
    try {
      if (projectId && token) {
        store = getStore({ name: storeName, consistency: 'strong', projectId, token });
      } else {
        store = getStore(storeName);
      }
      return store;
    } catch (e) {
      console.warn('[BlobKV] 初始化 EdgeOne Blob 失败，回退到内存存储：', e?.message);
      store = createMemoryKV();
      return store;
    }
  };

  return {
    async get(key, type) {
      const s = resolveStore();
      // 如果已回退为内存 KV
      if (typeof s.get === 'function' && !s.set) {
        return await s.get(key, type);
      }
      try {
        const item = await s.get(key, { consistency: 'strong', type: type === 'json' ? 'json' : 'text' });
        return item ?? null;
      } catch (err) {
        console.error(`[BlobKV] get ${key} error:`, err?.message);
        return null;
      }
    },

    async put(key, value) {
      const s = resolveStore();
      if (typeof s.put === 'function' && !s.set) {
        return await s.put(key, value);
      }
      try {
        const payload = typeof value === 'string' ? value : JSON.stringify(value);
        await s.set(key, payload);
      } catch (err) {
        console.error(`[BlobKV] put ${key} error:`, err?.message);
        throw err;
      }
    },

    async delete(key) {
      const s = resolveStore();
      if (typeof s.delete === 'function') {
        await s.delete(key);
      }
    }
  };
}
