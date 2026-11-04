var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@edgeone/pages-blob/dist/index.js
var require_dist = __commonJS({
  "node_modules/@edgeone/pages-blob/dist/index.js"(exports, module) {
    "use strict";
    var L = Object.defineProperty;
    var le = Object.getOwnPropertyDescriptor;
    var ue = Object.getOwnPropertyNames;
    var ge = Object.prototype.hasOwnProperty;
    var fe = (t, e) => {
      for (var r in e) L(t, r, { get: e[r], enumerable: true });
    };
    var he = (t, e, r, n) => {
      if (e && typeof e == "object" || typeof e == "function") for (let s of ue(e)) !ge.call(t, s) && s !== r && L(t, s, { get: () => e[s], enumerable: !(n = le(e, s)) || n.enumerable });
      return t;
    };
    var me = (t) => he(L({}, "__esModule", { value: true }), t);
    var je = {};
    fe(je, { InvalidKeyError: () => w, InvalidStoreNameError: () => y, MissingProjectIdError: () => T, PagesBlobError: () => h, PreconditionFailedError: () => x, QuotaExceededError: () => O, RateLimitedError: () => j, Store: () => E, getStore: () => De, listStores: () => Oe });
    module.exports = me(je);
    var h = class extends Error {
      code;
      constructor(e, r) {
        super(`PagesBlob: ${r}`), this.name = "PagesBlobError", this.code = e;
      }
    };
    var w = class extends h {
      constructor(e) {
        super("INVALID_KEY", e);
      }
    };
    var y = class extends h {
      constructor(e) {
        super("INVALID_STORE_NAME", e);
      }
    };
    var b = class extends h {
      constructor(e) {
        super("MISSING_ENVIRONMENT", `Environment not configured for Pages Blob. Missing: ${e.join(", ")}. Supply these properties when creating a store, or ensure the function is running in a Pages environment.`);
      }
    };
    var O = class extends h {
      constructor() {
        super("QUOTA_EXCEEDED", "storage quota exceeded");
      }
    };
    var j = class extends h {
      constructor() {
        super("RATE_LIMITED", "request rate limited, please retry later");
      }
    };
    var T = class extends h {
      constructor() {
        super("MISSING_PROJECT_ID", "projectId is required when using API token mode. Please supply { name, projectId, token } to getStore() / listStores().");
      }
    };
    var m = class extends h {
      constructor(e) {
        super("CREDENTIAL_ERROR", e);
      }
    };
    var f = class extends h {
      constructor(e, r) {
        super("COS_ERROR", `COS returned ${e}: ${r}`);
      }
    };
    var x = class extends h {
      constructor() {
        super("PRECONDITION_FAILED", "conditional write failed (key already exists)");
      }
    };
    function C(t) {
      if (t === "") throw new w("Blob key must not be empty.");
      if (t.startsWith("/") || t.startsWith("%2F")) throw new w("Blob key must not start with forward slash (/).");
      if (new TextEncoder().encode(t).length > 600) throw new w("Blob key must be a sequence of Unicode characters whose UTF-8 encoding is at most 600 bytes long.");
    }
    function z(t) {
      if (t === "") throw new y("Store name must not be empty.");
      if (t.includes("/") || t.includes(":")) throw new y("Store name must not contain forward slashes (/) or colons (:).");
      if (!/^[a-zA-Z0-9_-]+$/.test(t)) throw new y("Store name must only contain letters, digits, underscores, and hyphens.");
      if (new TextEncoder().encode(t).length > 64) throw new y("Store name must be a sequence of Unicode characters whose UTF-8 encoding is at most 64 bytes long.");
    }
    var E = class {
      cosClient;
      storeName;
      defaultConsistency;
      constructor(e, r, n = "eventual") {
        this.cosClient = e, this.storeName = r, this.defaultConsistency = n;
      }
      resolveConsistency(e) {
        return e ?? this.defaultConsistency;
      }
      async set(e, r, n) {
        C(e);
        let s = await this.cosClient.putObject(this.storeName, e, r, { onlyIfNew: n?.onlyIfNew, cacheControl: n?.cacheControl });
        if (n?.onlyIfNew && s.statusCode === 412) throw new x();
      }
      async setJSON(e, r, n) {
        C(e);
        let s = JSON.stringify(r), i = await this.cosClient.putObject(this.storeName, e, s, { onlyIfNew: n?.onlyIfNew, contentType: "application/json", cacheControl: n?.cacheControl });
        if (n?.onlyIfNew && i.statusCode === 412) throw new x();
      }
      async createUploadUrl(e, r) {
        C(e);
        let { url: n, expiresAt: s } = await this.cosClient.createPresignedPutUrl(this.storeName, e, { expireSeconds: r?.expireSeconds, contentType: r?.contentType });
        return { url: n, key: e, expiresAt: s };
      }
      async get(e, r) {
        C(e);
        let n = this.resolveConsistency(r?.consistency), s = await this.cosClient.getObject(this.storeName, e, n);
        if (s === null) return null;
        let { body: i } = s, a = r?.type ?? "text", o = new TextDecoder("utf-8");
        switch (a) {
          case "text":
            return o.decode(i);
          case "json":
            return JSON.parse(o.decode(i));
          case "arrayBuffer":
            return i.buffer.slice(i.byteOffset, i.byteOffset + i.byteLength);
          case "blob":
            return new Blob([i]);
          case "stream":
            return new ReadableStream({ start(c) {
              c.enqueue(i), c.close();
            } });
          default:
            return o.decode(i);
        }
      }
      async getMetadata(e, r) {
        C(e);
        let n = this.resolveConsistency(r?.consistency);
        return this.cosClient.headObject(this.storeName, e, n);
      }
      async getWithHeaders(e, r) {
        C(e);
        let n = this.resolveConsistency(r?.consistency), s = await this.cosClient.getObject(this.storeName, e, n);
        return s ? { body: new TextDecoder("utf-8").decode(s.body), headers: s.headers || {} } : null;
      }
      async delete(e) {
        C(e), await this.cosClient.deleteObject(this.storeName, e);
      }
      async list(e) {
        let r = e?.paginate !== false, n = e?.limit, s = [], i = [], a = this.resolveConsistency(e?.consistency), o = e?.cursor || "", c = true, d;
        for (; c; ) {
          let u = n !== void 0 ? n - s.length : 1e3, l = Math.min(u, 1e3);
          if (l <= 0) break;
          let g = await this.cosClient.listObjects(this.storeName, { prefix: e?.prefix, delimiter: e?.directories ? "/" : void 0, marker: o || void 0, maxKeys: l, consistency: a });
          for (let p of g.contents) s.push({ key: p.key, etag: p.etag });
          i.push(...g.commonPrefixes), n !== void 0 && s.length >= n ? (s.length = n, (g.isTruncated || g.contents.length === l) && (d = g.nextMarker), c = false) : g.isTruncated ? !r && n === void 0 ? (d = g.nextMarker, c = false) : o = g.nextMarker : c = false;
        }
        return { blobs: s, directories: i, ...d ? { cursor: d } : {} };
      }
    };
    var ye = new TextEncoder();
    function U(t) {
      let e = ye.encode(t), r = new ArrayBuffer(e.byteLength), n = new Uint8Array(r);
      return n.set(e), n;
    }
    function G(t) {
      let e = t instanceof Uint8Array ? t : new Uint8Array(t), r = "";
      for (let n = 0; n < e.length; n++) r += e[n].toString(16).padStart(2, "0");
      return r;
    }
    async function H(t, e) {
      let r = await crypto.subtle.importKey("raw", U(t), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]), n = await crypto.subtle.sign("HMAC", r, U(e));
      return G(n);
    }
    async function pe(t) {
      let e = await crypto.subtle.digest("SHA-1", U(t));
      return G(e);
    }
    function B(t) {
      return encodeURIComponent(t).replace(/[!'()*]/g, (e) => "%" + e.charCodeAt(0).toString(16).toUpperCase());
    }
    function P(t) {
      try {
        return decodeURIComponent(t);
      } catch {
        return t;
      }
    }
    function we(t) {
      return t.split("/").map((e) => P(e)).join("/");
    }
    function I(t) {
      return we(P(t));
    }
    function W(t) {
      return t.split("/").map((e) => B(P(e))).join("/");
    }
    var Ce = /* @__PURE__ */ new Set(["cache-control", "content-disposition", "content-encoding", "content-length", "content-md5", "content-type", "expect", "expires", "if-match", "if-modified-since", "if-none-match", "if-unmodified-since", "origin", "range", "transfer-encoding"]);
    function xe(t) {
      return t === "host" || t === "x-cos-security-token" ? false : !!(Ce.has(t) || t.startsWith("x-cos-"));
    }
    function X(t) {
      if (!t) return [];
      let e = [];
      for (let [r, n] of Object.entries(t)) n != null && e.push([r.toLowerCase(), String(n)]);
      return e.sort(([r], [n]) => r < n ? -1 : r > n ? 1 : 0), e;
    }
    function Y(t) {
      return t.map(([e, r]) => `${B(e)}=${B(r)}`).join("&");
    }
    function F(t) {
      return t.map(([e]) => B(e)).join(";");
    }
    async function V(t) {
      let e = t.method.toLowerCase(), r = t.pathname.startsWith("/") ? t.pathname : `/${t.pathname}`, n = Math.floor(Date.now() / 1e3), s = n + (t.expireSeconds ?? 3600), i = `${n};${s}`, o = X(t.headers).filter(([N]) => xe(N)), c = F(o), d = Y(o), u = X(t.query), l = F(u), g = Y(u), p = `${e}
${r}
${g}
${d}
`, oe = `sha1
${i}
${await pe(p)}
`, ie = await H(t.secretKey, i), ae = await H(ie, oe), ce = ["q-sign-algorithm=sha1", `q-ak=${t.secretId}`, `q-sign-time=${i}`, `q-key-time=${i}`, `q-header-list=${c}`, `q-url-param-list=${l}`, `q-signature=${ae}`].join("&"), q = {};
      for (let [N, de] of o) q[N] = de;
      return { authorization: ce, signedHeaders: q };
    }
    async function J(t) {
      let e = new URL(t.domain), r = P(t.key), n = `/${I(t.key)}`, s = `/${W(r)}`;
      e.pathname = s;
      let { authorization: i } = await V({ method: t.method, pathname: n, query: t.query, headers: t.headers, secretId: t.credential.secretId, secretKey: t.credential.secretKey, expireSeconds: t.expireSeconds });
      if (t.query) for (let [a, o] of Object.entries(t.query)) o != null && e.searchParams.set(a, String(o));
      for (let a of i.split("&")) {
        let o = a.indexOf("=");
        if (o === -1) continue;
        let c = a.slice(0, o), d = a.slice(o + 1);
        e.searchParams.set(c, d);
      }
      return t.credential.sessionToken && e.searchParams.set("x-cos-security-token", t.credential.sessionToken), e.toString();
    }
    async function S(t) {
      let e = new URL(t.domain), r = t.key ? P(t.key) : "", n = t.key ? `/${I(t.key)}` : "/", s = r ? `/${W(r)}` : "/";
      if (e.pathname = s, t.query) for (let [l, g] of Object.entries(t.query)) g != null && e.searchParams.set(l, String(g));
      let { authorization: i } = await V({ method: t.method, pathname: n, query: t.query, headers: t.headers, secretId: t.credential.secretId, secretKey: t.credential.secretKey }), a = new Headers();
      if (t.headers) for (let [l, g] of Object.entries(t.headers)) g != null && a.set(l, String(g));
      a.set("Authorization", i), t.credential.sessionToken && a.set("x-cos-security-token", t.credential.sessionToken);
      let o = e.toString(), c = { method: t.method, headers: a, body: t.body ?? void 0, signal: t.signal }, d = 2, u;
      for (let l = 0; l <= d; l++) try {
        return await fetch(o, c);
      } catch (g) {
        if (u = g, g instanceof DOMException && g.name === "AbortError") throw g;
        l < d && await new Promise((p) => setTimeout(p, 1e3 * (l + 1)));
      }
      throw u;
    }
    var be = "blob.edgeone.site";
    var Te = "blob-nocache.edgeone.site";
    var Ee = "max-age=0, stale-while-revalidate=60";
    var M = class t {
      credentialManager;
      bucket = "";
      region = "";
      keyPrefix = "";
      cachedDomain = "";
      uncachedDomain = "";
      initialized = false;
      static buildErrorDetail(e, r, n, s, i) {
        let a = n ? `${r}/${n}` : r, o = i ? ` [request-id: ${i}]` : "";
        return `${e} ${a} - ${Se(s)}${o}`;
      }
      constructor(e) {
        this.credentialManager = e;
      }
      computeSubdomain(e) {
        let r = [];
        if (e.appId && r.push(e.appId), e.zoneId && r.push(e.zoneId), e.projectId && r.push(e.projectId), r.length >= 2) return r.join("-");
        if (e.resourcePrefix) {
          let s = e.resourcePrefix.replace(/\/?\*$/, "").split("/").filter(Boolean);
          if (s.length >= 2) return s.slice(0, Math.min(s.length, 3)).join("-");
        }
        return "";
      }
      async ensureInitialized() {
        if (this.initialized) return;
        let e = await this.credentialManager.getCredential();
        !this.keyPrefix && e.resourcePrefix && (this.keyPrefix = e.resourcePrefix.replace(/\/?\*$/, ""));
        let r = e.edgeRegion === "CN", n = e.cosMainland, s = e.cosOverseas, i = r ? n || s : s || n;
        !this.bucket && i && (this.bucket = i.bucket, this.region = i.region);
        let a = this.computeSubdomain(e);
        if (!a) throw new f(0, "unable to derive tenant subdomain from credential; missing appId/zoneId/projectId or resourcePrefix");
        this.cachedDomain = `https://${a}.${be}`, this.uncachedDomain = `https://${a}.${Te}`, this.initialized = true;
      }
      async resolveDomain(e) {
        return await this.ensureInitialized(), e === "strong" ? this.uncachedDomain : this.cachedDomain;
      }
      async resolveCredential() {
        let e = await this.credentialManager.getCredential();
        return { secretId: e.tmpSecretId, secretKey: e.tmpSecretKey, sessionToken: e.sessionToken };
      }
      buildCosKey(e, r) {
        return `${this.keyPrefix}/${e}/${r}`;
      }
      async getDomains() {
        return await this.ensureInitialized(), { cached: this.cachedDomain, uncached: this.uncachedDomain };
      }
      async putObject(e, r, n, s) {
        let i = await this.resolveDomain("strong"), a = await this.resolveCredential(), o = this.buildCosKey(e, r), { defaultCacheControl: c = Ee } = await this.credentialManager.getCredential(), d = s?.cacheControl === null ? void 0 : s?.cacheControl ?? c, u = {};
        s?.onlyIfNew && (u["If-None-Match"] = "*"), d && (u["Cache-Control"] = d), s?.contentType && (u["Content-Type"] = s.contentType);
        try {
          let l = await S({ domain: i, method: "PUT", key: o, headers: u, body: n, credential: a });
          if (l.status === 412) return await l.arrayBuffer().catch(() => {
          }), { etag: "", statusCode: 412 };
          if (!l.ok) {
            let p = await k(l);
            throw new f(l.status, t.buildErrorDetail("PUT", i, o, p || `status ${l.status}`, R(l)));
          }
          let g = l.headers.get("etag") || "";
          return await l.arrayBuffer().catch(() => {
          }), { etag: g, statusCode: l.status };
        } catch (l) {
          throw l instanceof f ? l : new f(0, t.buildErrorDetail("PUT", i, o, A(l)));
        }
      }
      async createPresignedPutUrl(e, r, n) {
        let s = await this.resolveDomain("strong"), i = await this.resolveCredential(), a = this.buildCosKey(e, r), o = {};
        n?.contentType && (o["Content-Type"] = n.contentType);
        let c = n?.expireSeconds ?? 3600, d = await J({ domain: s, method: "PUT", key: a, headers: o, credential: i, expireSeconds: c }), u = Math.floor(Date.now() / 1e3) + c;
        return { url: d, expiresAt: u };
      }
      async getObject(e, r, n) {
        let s = await this.resolveDomain(n), i = await this.resolveCredential(), a = this.buildCosKey(e, r);
        try {
          let o = await S({ domain: s, method: "GET", key: a, credential: i });
          if (o.status === 404) return await o.arrayBuffer().catch(() => {
          }), null;
          if (!o.ok) {
            let u = await k(o);
            throw new f(o.status, t.buildErrorDetail("GET", s, a, u || `status ${o.status}`, R(o)));
          }
          let c = new Uint8Array(await o.arrayBuffer()), d = Z(o.headers);
          return { body: c, contentType: d["content-type"], headers: d };
        } catch (o) {
          throw o instanceof f ? o : new f(0, t.buildErrorDetail("GET", s, a, A(o)));
        }
      }
      async headObject(e, r, n) {
        let s = await this.resolveDomain(n), i = await this.resolveCredential(), a = this.buildCosKey(e, r);
        try {
          let o = await S({ domain: s, method: "HEAD", key: a, credential: i });
          if (o.status === 404) return null;
          if (!o.ok) {
            let d = await k(o);
            throw new f(o.status, t.buildErrorDetail("HEAD", s, a, d || `status ${o.status}`, R(o)));
          }
          let c = Z(o.headers);
          return { cacheControl: c["cache-control"], contentType: c["content-type"], etag: c.etag, headers: c };
        } catch (o) {
          throw o instanceof f ? o : new f(0, t.buildErrorDetail("HEAD", s, a, A(o)));
        }
      }
      async deleteObject(e, r) {
        let n = await this.resolveDomain("strong"), s = await this.resolveCredential(), i = this.buildCosKey(e, r);
        try {
          let a = await S({ domain: n, method: "DELETE", key: i, credential: s });
          if (a.status === 204 || a.status === 404 || a.ok) {
            await a.arrayBuffer().catch(() => {
            });
            return;
          }
          let o = await k(a);
          throw new f(a.status, t.buildErrorDetail("DELETE", n, i, o || `status ${a.status}`, R(a)));
        } catch (a) {
          throw a instanceof f ? a : new f(0, t.buildErrorDetail("DELETE", n, i, A(a)));
        }
      }
      async listObjects(e, r) {
        await this.ensureInitialized();
        let n = `${this.keyPrefix}/${e}/`, s = r?.prefix ? n + r.prefix : n, i = await this.getBucketRaw({ prefix: s, delimiter: r?.delimiter, marker: r?.marker, maxKeys: r?.maxKeys, consistency: r?.consistency }), a = i.contents.map((c) => {
          let d = c.key, u = d.startsWith(n) ? d.slice(n.length) : d;
          return u ? { key: u, etag: c.etag } : null;
        }).filter((c) => c !== null), o = i.commonPrefixes.map((c) => c.startsWith(n) ? c.slice(n.length) : c).filter((c) => !!c);
        return { contents: a, commonPrefixes: o, isTruncated: i.isTruncated, nextMarker: i.nextMarker };
      }
      async listStores(e) {
        let r = [], n = "", s = true;
        for (; s; ) {
          await this.ensureInitialized();
          let i = `${this.keyPrefix}/`, a = await this.getBucketRaw({ prefix: i, delimiter: "/", maxKeys: 1e3, marker: n || void 0, consistency: e });
          for (let o of a.commonPrefixes) {
            let c = o.startsWith(i) ? o.slice(i.length, -1) : o.slice(0, -1);
            c && r.push(c);
          }
          if (s = a.isTruncated, n = a.nextMarker, !s || !n) break;
        }
        return r;
      }
      async getBucketRaw(e) {
        let r = await this.resolveDomain(e.consistency), n = await this.resolveCredential(), s = { prefix: I(e.prefix) };
        e.delimiter && (s.delimiter = e.delimiter), e.marker && (s.marker = I(e.marker)), e.maxKeys && (s["max-keys"] = e.maxKeys);
        try {
          let i = await S({ domain: r, method: "GET", query: s, credential: n });
          if (!i.ok) {
            let o = await k(i);
            throw new f(i.status, t.buildErrorDetail("LIST", r, e.prefix, o || `status ${i.status}`, R(i)));
          }
          let a = await i.text();
          return Pe(a);
        } catch (i) {
          throw i instanceof f ? i : new f(0, t.buildErrorDetail("LIST", r, e.prefix, A(i)));
        }
      }
    };
    function Se(t) {
      return t.replace(/[a-zA-Z0-9\-]+\.cos\.[a-zA-Z0-9\-.]+\.myqcloud\.com/gi, "[cos-origin]").replace(/[a-zA-Z0-9\-]+\.cos\.[a-zA-Z0-9\-.]+\.tencentcos\.cn/gi, "[cos-origin]");
    }
    async function k(t) {
      try {
        return await t.text();
      } catch {
        return "";
      }
    }
    function R(t) {
      return t.headers.get("x-cos-request-id") || t.headers.get("x-eo-log-id") || void 0;
    }
    function A(t) {
      let e = t, r = e.message || String(t), n = e.cause;
      if (n) {
        let s = n.message || n.code || "";
        return s ? `${r} (${s})` : r;
      }
      return r;
    }
    function Z(t) {
      let e = {};
      return t.forEach((r, n) => {
        e[n.toLowerCase()] = r;
      }), e;
    }
    function Pe(t) {
      let e = [], r = /<Contents>([\s\S]*?)<\/Contents>/g, n;
      for (; (n = r.exec(t)) !== null; ) {
        let d = n[1], u = v(d, "Key"), l = v(d, "ETag");
        u !== null && e.push({ key: _(u), etag: l || "" });
      }
      let s = [], i = /<CommonPrefixes>([\s\S]*?)<\/CommonPrefixes>/g;
      for (; (n = i.exec(t)) !== null; ) {
        let d = n[1], u = v(d, "Prefix");
        u !== null && s.push(_(u));
      }
      let o = v(t, "IsTruncated") === "true", c = v(t, "NextMarker") || "";
      return { contents: e, commonPrefixes: s, isTruncated: o, nextMarker: _(c) };
    }
    function v(t, e) {
      let n = new RegExp(`<${e}>([\\s\\S]*?)<\\/${e}>`).exec(t);
      return n ? n[1] : null;
    }
    function _(t) {
      return t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
    }
    var Ie = "X-RateLimit-Reset";
    async function $(t, e, r = 2) {
      e.signal?.throwIfAborted?.();
      try {
        let n = await fetch(t, e);
        if (r > 0 && (n.status === 429 || n.status >= 500)) {
          let s = Q(n.headers.get(Ie));
          return await ee(s, e.signal), $(t, e, r - 1);
        }
        return n;
      } catch (n) {
        if (r === 0 || n instanceof DOMException && n.name === "AbortError") throw n;
        let s = Q();
        return await ee(s, e.signal), $(t, e, r - 1);
      }
    }
    function Q(t) {
      return t ? Math.max(Number(t) * 1e3 - Date.now(), 500) : 1500;
    }
    function ee(t, e) {
      return new Promise((r, n) => {
        if (e?.aborted) return n(e.reason);
        let s = setTimeout(() => {
          e?.removeEventListener("abort", i), r();
        }, t), i = () => {
          clearTimeout(s), n(e.reason);
        };
        e?.addEventListener("abort", i, { once: true });
      });
    }
    var ke = "prod";
    function te() {
      let t = typeof process < "u" ? process.env.PAGES_BLOB_STS_ENV : void 0;
      return t === "test" || t === "prod" ? t : ke;
    }
    var Re = 300;
    var Ae = "https://blob-sts.edgeone.site/";
    var D = class {
      authToken;
      projectId;
      cached = null;
      constructor(e, r) {
        this.authToken = e, this.projectId = r;
      }
      async getCredential() {
        if (this.cached && !this.isExpired(this.cached)) return this.cached;
        let e = await this.fetchCredential();
        return this.cached = e, e;
      }
      clearCache() {
        this.cached = null;
      }
      isExpired(e) {
        let r = Math.floor(Date.now() / 1e3);
        return e.expiredTime - r < Re;
      }
      async fetchCredential() {
        for (let n = 1; n <= 3; n++) {
          let s = new AbortController(), i = setTimeout(() => s.abort(), 1e4), a;
          try {
            a = await $(Ae, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.authToken}`, "X-Env": te() }, body: JSON.stringify(this.projectId ? { ProjectId: this.projectId } : {}), signal: s.signal });
          } catch (d) {
            if (n < 3) {
              await K(500 * n);
              continue;
            }
            throw new m(`failed to obtain STS credential: ${d.message || "timeout"}`);
          } finally {
            clearTimeout(i);
          }
          if (a.status === 413) throw new m("storage quota exceeded");
          if (a.status === 429) throw new m("rate limited, please retry later");
          if (!a.ok) {
            if (a.status >= 500 && n < 3) {
              await K(500 * n);
              continue;
            }
            let d = await a.text().catch(() => "unknown error");
            throw new m(`failed to obtain STS credential: ${a.status} ${d}`);
          }
          let o = await a.json(), c = o.data && typeof o.data == "object" ? o.data : o;
          if (c.tmpSecretId && c.tmpSecretKey && c.sessionToken && c.expiredTime) {
            let d = c.cosMainland, u = c.cosOverseas, l = a.headers.get("X-Edge-Region") || void 0;
            return { tmpSecretId: c.tmpSecretId, tmpSecretKey: c.tmpSecretKey, sessionToken: c.sessionToken, expiredTime: c.expiredTime, appId: c.appId || void 0, zoneId: c.zoneId || void 0, projectId: c.projectId || void 0, resourcePrefix: c.resourcePrefix || void 0, cosMainland: d || void 0, cosOverseas: u || void 0, edgeRegion: l, defaultCacheControl: typeof c.defaultCacheControl == "string" && c.defaultCacheControl ? c.defaultCacheControl : void 0 };
          }
          if (c.code !== void 0 && c.code !== 0) {
            let d = c.msg || c.message || "unknown error";
            throw new m(`credential exchange failed (code=${c.code}): ${d}`);
          }
          if (o.code !== void 0 && o.code !== 0) {
            let d = o.msg || o.message || "unknown error";
            throw new m(`credential exchange failed (code=${o.code}): ${d}`);
          }
          if (n < 3) {
            await K(500 * n);
            continue;
          }
          throw new m("invalid STS credential response");
        }
        throw new m("invalid STS credential response");
      }
    };
    function K(t) {
      return new Promise((e) => setTimeout(e, t));
    }
    var ve = "{{PAGES_BLOB_DEPLOY_CREDENTIAL}}";
    function re() {
      let t = {}, e = Me();
      if (e) t.deployCredential = e;
      else {
        let n = ne("PAGES_BLOB_DEPLOY_CREDENTIAL");
        n && (t.deployCredential = n);
      }
      let r = ne("PAGES_PROJECT_ID");
      return r && (t.projectId = r), t;
    }
    function Me() {
      let t = ve;
      if (!(t.startsWith("{{") && t.endsWith("}}"))) return t || void 0;
    }
    function ne(t) {
      if (typeof process < "u" && process.env) return process.env[t];
    }
    function De(t) {
      let e = typeof t == "string" ? t : t.name;
      z(e);
      let r = se(typeof t == "string" ? void 0 : t), n = new D(r.authToken, r.projectId), s = new M(n);
      return new E(s, e, r.consistency ?? "eventual");
    }
    async function Oe(t) {
      let e = se(t ? { name: "__list__", projectId: t.projectId, token: t.token, consistency: t.consistency } : void 0), r = new D(e.authToken, e.projectId);
      return { stores: (await new M(r).listStores(e.consistency)).map((i) => ({ name: i })) };
    }
    function se(t) {
      let e = re(), r = t?.token || e.deployCredential, n = t?.projectId || e.projectId;
      if (t?.token || e.projectId) {
        if (!n) throw new T();
        if (!r) throw new b(["token"]);
        return { authToken: r, projectId: n, consistency: t?.consistency };
      }
      if (t?.projectId && !r) throw new b(["token"]);
      if (!e.deployCredential) throw new b(["deployCredential"]);
      return { authToken: e.deployCredential, consistency: t?.consistency };
    }
  }
});

// worker v1.3.0.js
var UI_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\u7AD9\u70B9\u4FDD\u6D3B\u7BA1\u7406\u7CFB\u7EDF - Pro v1.3.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script>
        tailwind.config = { darkMode: 'class' }
    </script>
    <style>
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.7); }
        input[type="checkbox"] { accent-color: #4f46e5; cursor: pointer; }
    </style>
</head>
<body class="transition-colors duration-300 min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-200 p-6 font-sans">
    <div id="app" class="max-w-6xl mx-auto">
        
        <div v-if="!isLoggedIn" class="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
            <div class="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 max-w-md w-full text-center relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
                
                <div class="text-5xl mb-4 inline-block p-4 rounded-2xl bg-indigo-50 dark:bg-slate-700/50 border border-indigo-100 dark:border-slate-600 shadow-inner">\u{1F510}</div>
                <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-1">\u7CFB\u7EDF\u63A7\u5236\u9762\u677F\u767B\u5F55</h2>
                <p class="text-xs text-gray-400 dark:text-slate-400 mb-8">Auto-Keepalive Pro v1.3.0</p>

                <div class="space-y-4 text-left">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 ml-1">\u767B\u5F55\u8D26\u53F7</label>
                        <input v-model="loginForm.user" @keyup.enter="doLogin" type="text" placeholder="\u8F93\u5165\u8D26\u53F7" class="w-full p-3.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 ml-1">\u5B89\u5168\u5BC6\u7801</label>
                        <input v-model="loginForm.pass" @keyup.enter="doLogin" type="password" placeholder="\u8F93\u5165\u5BC6\u7801" class="w-full p-3.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition">
                    </div>
                    <button @click="doLogin" :disabled="isLoggingIn" class="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl font-bold text-sm shadow-lg transition transform active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2">
                        <span v-if="isLoggingIn" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{{ isLoggingIn ? '\u9A8C\u8BC1\u5B89\u5168\u4EE4\u724C\u4E2D...' : '\u7ACB\u5373\u767B\u5F55\u9762\u677F' }}</span>
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="animate-fade-in">
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700/80">
                <div>
                    <h1 class="text-2xl font-extrabold flex items-center gap-2.5 text-gray-900 dark:text-white">
                        <span>\u{1F310}</span> Auto-Keepalive <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">Pro v1.3.0</span>
                    </h1>
                    <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">\u5F53\u524D\u767B\u5F55\uFF1A<span class="font-bold text-indigo-500">{{ loggedInUser }}</span> &nbsp;|&nbsp; Serverless \u591A\u7528\u6237\u8109\u640F\u76D1\u63A7\u4E2D\u67A2</p>
                </div>
                
                <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                    <span class="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium animate-pulse mr-1" v-if="hasUnsavedChanges">\u26A0\uFE0F \u66F4\u6539\u5F85\u4FDD\u5B58</span>
                    
                    <button @click="saveConfig" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl shadow-sm transition font-bold text-xs flex items-center gap-1">
                        <span>\u{1F4BE}</span> \u4FDD\u5B58\u914D\u7F6E\u81F3\u670D\u52A1\u5668
                    </button>
                    
                    <button @click="toggleTheme" 
                            class="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all border shadow-sm select-none"
                            :class="isDark ? 'bg-slate-950 text-amber-300 border-slate-700' : 'bg-gray-50 text-slate-700 border-gray-200'">
                        <span>{{ isDark ? '\u{1F319}' : '\u2600\uFE0F' }}</span>
                        <span class="hidden sm:inline">{{ isDark ? '\u6DF1\u8272' : '\u6D45\u8272' }}</span>
                    </button>

                    <button @click="doLogout" class="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 border border-red-200 dark:border-red-800/80 px-3 py-2 rounded-xl transition font-bold text-xs flex items-center gap-1 ml-1" title="\u9500\u6BC1\u5F53\u524D\u4F1A\u8BDD\u4EE4\u724C">
                        <span>\u{1F6AA}</span> <span class="hidden sm:inline">\u9000\u51FA</span>
                    </button>
                </div>
            </div>

            <div class="flex border-b border-gray-200 dark:border-slate-700 mb-6 gap-2 overflow-x-auto pb-1">
                <button @click="currentTab = 'dashboard'" :class="currentTab === 'dashboard' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                    \u{1F4CA} \u8FD0\u884C\u6982\u89C8
                </button>
                <button @click="currentTab = 'tasks'" :class="currentTab === 'tasks' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                    \u{1F517} \u4FDD\u6D3B\u4EFB\u52A1 ({{ config.tasks.length }})
                </button>
                <button @click="currentTab = 'channels'" :class="currentTab === 'channels' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                    \u{1F4E2} \u901A\u77E5\u6E20\u9053 ({{ config.channels.length }})
                </button>
                <button @click="currentTab = 'logs'" :class="currentTab === 'logs' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                    \u{1F4DC} \u8FD0\u884C\u65E5\u5FD7
                </button>
                <button @click="currentTab = 'users'" :class="currentTab === 'users' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                    \u{1F465} \u7CFB\u7EDF\u8D26\u53F7
                </button>
            </div>

            <div class="min-h-[500px]">
                
                <div v-if="currentTab === 'dashboard'" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center">
                            <div class="text-xs text-gray-400 dark:text-slate-400 mb-1 font-medium">\u603B\u4FDD\u6D3B\u4EFB\u52A1\u6570</div>
                            <div class="text-4xl font-black text-gray-800 dark:text-white">{{ config.tasks.length }}</div>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center">
                            <div class="text-xs text-gray-400 dark:text-slate-400 mb-1 font-medium">\u5F53\u524D\u72B6\u6001\u6B63\u5E38</div>
                            <div class="text-4xl font-black text-green-500 dark:text-green-400">{{ config.tasks.filter(t => t.status === 'ok').length }}</div>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center">
                            <div class="text-xs text-gray-400 dark:text-slate-400 mb-1 font-medium">\u5F53\u524D\u72B6\u6001\u5F02\u5E38</div>
                            <div class="text-4xl font-black text-red-500 dark:text-red-400">{{ config.tasks.filter(t => t.status === 'down').length }}</div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                        <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                            <h2 class="text-sm font-bold text-gray-800 dark:text-slate-200">\u5B9E\u65F6\u4EFB\u52A1\u8109\u640F\u6E05\u5355</h2>
                            <button @click="loadConfig" class="text-xs bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-slate-600 transition flex items-center gap-1">
                                <span>\u{1F504}</span> \u5237\u65B0\u72B6\u6001
                            </button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr class="border-b border-gray-200 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-400 bg-gray-50/20 dark:bg-slate-900/20">
                                        <th class="p-4 font-semibold w-1/4">\u4EFB\u52A1\u540D\u79F0</th>
                                        <th class="p-4 font-semibold w-1/3">\u76EE\u6807 URL</th>
                                        <th class="p-4 font-semibold w-1/6">\u5F53\u524D\u72B6\u6001</th>
                                        <th class="p-4 font-semibold">\u6700\u8FD1\u8BBF\u95EE\u65F6\u95F4</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-slate-700/60">
                                    <tr v-for="(task, idx) in config.tasks" :key="idx" class="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                                        <td class="p-4 font-bold text-gray-800 dark:text-slate-200">{{ task.name }}</td>
                                        <td class="p-4"><a :href="task.url" target="_blank" class="text-indigo-500 dark:text-indigo-400 hover:underline text-xs font-mono break-all">{{ task.url }}</a></td>
                                        <td class="p-4">
                                            <span v-if="task.status === 'ok'" class="px-2.5 py-1 bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/80 rounded-md text-xs font-medium">\u2705 \u6B63\u5E38\u8BBF\u95EE</span>
                                            <span v-else-if="task.status === 'down'" class="px-2.5 py-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/80 rounded-md text-xs font-medium">\u{1F6A8} \u8BBF\u95EE\u5F02\u5E38</span>
                                            <span v-else class="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-md text-xs font-medium">\u23F3 \u7B49\u5F85\u8F6E\u8BE2</span>
                                        </td>
                                        <td class="p-4 text-xs text-gray-400 dark:text-slate-400 font-mono">{{ formatTime(task.lastCheck) }}</td>
                                    </tr>
                                    <tr v-if="config.tasks.length === 0">
                                        <td colspan="4" class="p-12 text-center text-gray-400 dark:text-slate-500">\u6682\u65E0\u4FDD\u6D3B\u4EFB\u52A1\uFF0C\u8BF7\u524D\u5F80\u201C\u4FDD\u6D3B\u4EFB\u52A1\u7BA1\u7406\u201D\u6DFB\u52A0\u3002</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div v-if="currentTab === 'tasks'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
                    <div class="p-5 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                        <h3 class="font-extrabold text-sm text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                            <span>\u2795</span> \u65B0\u589E\u4FDD\u6D3B\u4EFB\u52A1
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input v-model="newTask.name" placeholder="\u4EFB\u52A1\u540D\u79F0 (\u5982: Koyeb\u8282\u70B91)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm font-medium">
                            <input v-model.number="newTask.interval" type="number" placeholder="\u8F6E\u8BE2\u95F4\u9694 (\u5206\u949F\uFF0C\u5982: 5)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm font-medium">
                            <input v-model="newTask.url" placeholder="\u5B8C\u6574 URL \u5730\u5740 (http(s)://...)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm md:col-span-2 font-mono">
                        </div>
                        
                        <div class="mb-2 text-xs font-bold text-gray-500 dark:text-slate-400">\u5206\u914D\u901A\u77E5\u6E20\u9053 (\u53EF\u591A\u9009):</div>
                        <div class="max-h-32 overflow-y-auto border border-gray-200 dark:border-slate-700 p-3 rounded-xl mb-4 bg-white dark:bg-slate-800">
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                <label v-for="(ch, idx) in config.channels" :key="idx" class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition text-xs font-medium">
                                    <input type="checkbox" :value="ch.name" v-model="newTask.notifyChannels" class="rounded border-gray-300">
                                    <span class="truncate">{{ ch.name }}</span>
                                </label>
                            </div>
                            <div v-if="config.channels.length === 0" class="text-gray-400 dark:text-slate-500 text-xs py-2 text-center">\u5C1A\u672A\u914D\u7F6E\u901A\u77E5\u6E20\u9053\uFF0C\u8BF7\u5148\u524D\u5F80\u201C\u6E20\u9053\u7BA1\u7406\u201D\u6DFB\u52A0\u3002</div>
                        </div>
                        <button @click="addTask" class="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white p-3 rounded-xl transition font-bold text-sm shadow-sm">
                            \u786E\u8BA4\u6DFB\u52A0\u65B0\u4EFB\u52A1
                        </button>
                    </div>

                    <div class="space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700/80">
                            <label class="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                                <input type="checkbox" v-model="selectAllTasks" class="w-4 h-4 rounded border-gray-300">
                                <span>\u5168\u9009\u4EFB\u52A1\u5217\u8868 (\u5DF2\u9009 {{ selectedTaskIndices.length }}/{{ config.tasks.length }} \u9879)</span>
                            </label>
                            <div class="flex items-center gap-2 self-end sm:self-auto" v-if="selectedTaskIndices.length > 0">
                                <button @click="openBatchChannelModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1">
                                    <span>\u{1F4E6}</span> \u6279\u91CF\u5206\u914D\u6E20\u9053
                                </button>
                                <button @click="batchRemoveTasks" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition">
                                    \u6279\u91CF\u5220\u9664
                                </button>
                            </div>
                        </div>

                        <div v-for="(task, idx) in config.tasks" :key="idx" 
                             class="p-4 border rounded-2xl flex justify-between items-center hover:shadow-md transition bg-white dark:bg-slate-800"
                             :class="selectedTaskIndices.includes(idx) ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm' : 'border-gray-200 dark:border-slate-700'">
                            <div class="flex items-start sm:items-center gap-3.5 pr-4 overflow-hidden">
                                <input type="checkbox" :value="idx" v-model="selectedTaskIndices" class="w-4 h-4 mt-1 sm:mt-0 rounded border-gray-300 flex-shrink-0">
                                <div class="overflow-hidden">
                                    <div class="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                                        {{ task.name }} 
                                        <span class="text-xs font-normal bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{{ task.interval }} \u5206\u949F/\u6B21</span>
                                    </div>
                                    <div class="text-xs text-gray-400 dark:text-slate-400 mt-1 font-mono truncate max-w-lg">{{ task.url }}</div>
                                    <div class="text-xs mt-2 text-indigo-600 dark:text-indigo-400 font-medium truncate">\u901A\u77E5\u5206\u53D1\u81F3: {{ task.notifyChannels.join(', ') || '\u9759\u9ED8\u4E0D\u901A\u77E5' }}</div>
                                </div>
                            </div>
                            <div class="flex gap-1.5 flex-shrink-0">
                                <button @click="openEditTaskModal(idx)" class="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">\u7F16\u8F91</button>
                                <button @click="removeTask(idx)" class="text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">\u5220\u9664</button>
                            </div>
                        </div>
                        <div v-if="config.tasks.length === 0" class="text-center text-gray-400 dark:text-slate-500 py-8 text-sm">\u4EFB\u52A1\u5217\u8868\u4E3A\u7A7A</div>
                    </div>
                </div>

                <div v-if="currentTab === 'channels'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
                    <div class="p-5 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                        <h3 class="font-extrabold text-sm text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                            <span>\u2795</span> \u65B0\u589E\u63A8\u9001\u6E20\u9053
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <select v-model="newChannel.type" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm font-medium">
                                <option value="telegram">Telegram \u673A\u5668\u4EBA</option>
                                <option value="bark">Bark (iOS \u539F\u751F\u63A8\u9001)</option>
                                <option value="pushplus">PushPlus \u63A8\u9001\u52A0</option>
                                <option value="notifyx">NotifyX \u7801\u8FBE\u63A8\u9001 (\u5B98\u65B9\u5185\u7F6E)</option>
                                <option value="dingtalk">\u9489\u9489 (DingTalk)</option>
                                <option value="lark">\u98DE\u4E66 (Lark)</option>
                                <option value="resend">Resend \u90AE\u4EF6\u63A8\u9001</option>
                                <option value="gotify">Gotify</option>
                                <option value="ntfy">Ntfy</option>
                                <option value="webhook">\u81EA\u5B9A\u4E49\u901A\u7528 Webhook</option>
                            </select>
                            <input v-model="newChannel.name" placeholder="\u8BBE\u7F6E\u4E00\u4E2A\u6E20\u9053\u522B\u540D (\u5982: \u4E3B\u529B\u7FA4)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm font-medium">
                        </div>
                        
                        <div class="space-y-3 mb-4">
                            <template v-if="newChannel.type === 'telegram'">
                                <input v-model="newChannel.token" placeholder="Bot Token" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <input v-model="newChannel.chatId" placeholder="Chat ID" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            </template>
                            
                            <template v-if="newChannel.type === 'bark'">
                                <input v-model="newChannel.token" placeholder="Bark Device Key (\u8BBE\u5907\u6807\u8BC6)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <input v-model="newChannel.url" placeholder="\u81EA\u5B9A\u4E49 Bark \u670D\u52A1\u5668 URL (\u9009\u586B\uFF0C\u9ED8\u8BA4 https://api.day.app)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            </template>

                            <template v-if="newChannel.type === 'pushplus'">
                                <input v-model="newChannel.token" placeholder="PushPlus Token" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            </template>

                            <template v-if="newChannel.type === 'notifyx'">
                                <input v-model="newChannel.token" placeholder="API \u5BC6\u94A5 (Key)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <div class="text-xs text-gray-400 dark:text-slate-500 px-1">\u{1F4A1} \u5DF2\u5185\u7F6E\u7F51\u5173\uFF0C\u4EC5\u9700\u586B\u5165 Key\u3002</div>
                            </template>

                            <template v-if="['dingtalk', 'lark'].includes(newChannel.type)">
                                <input v-model="newChannel.url" placeholder="\u5B8C\u6574 Webhook URL \u5730\u5740" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <input v-model="newChannel.secret" placeholder="\u52A0\u7B7E\u5BC6\u94A5 Secret (\u9009\u586B\uFF0C\u7559\u7A7A\u5219\u4E0D\u6821\u9A8C\u7B7E\u540D)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            </template>

                            <template v-if="newChannel.type === 'webhook'">
                                <input v-model="newChannel.url" placeholder="\u5B8C\u6574 Webhook URL \u5730\u5740" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <textarea v-model="newChannel.headers" placeholder='\u81EA\u5B9A\u4E49 Headers (JSON\u683C\u5F0F\uFF0C\u9009\u586B)' class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono" rows="2"></textarea>
                            </template>

                            <template v-if="newChannel.type === 'resend'">
                                <input v-model="newChannel.token" placeholder="Resend API Key" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <input v-model="newChannel.fromEmail" placeholder="\u53D1\u4EF6\u90AE\u7BB1 (From)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <input v-model="newChannel.toEmail" placeholder="\u6536\u4EF6\u90AE\u7BB1 (To)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            </template>

                            <template v-if="newChannel.type === 'gotify'">
                                <input v-model="newChannel.url" placeholder="Server URL (\u4E0D\u5E26\u7ED3\u5C3E/)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <input v-model="newChannel.token" placeholder="App Token" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            </template>

                            <template v-if="newChannel.type === 'ntfy'">
                                <input v-model="newChannel.url" placeholder="Server URL (\u9ED8\u8BA4 https://ntfy.sh)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                                <input v-model="newChannel.topic" placeholder="\u8BA2\u9605\u4E3B\u9898 (Topic)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            </template>
                        </div>

                        <div class="flex gap-3 mt-2">
                            <button @click="testChannel" class="w-1/3 bg-slate-700 hover:bg-slate-800 text-white p-3 rounded-xl transition font-bold text-xs shadow-sm flex justify-center items-center gap-1.5">
                                <span>\u{1F514}</span> \u6D4B\u8BD5\u53D1\u9001
                            </button>
                            <button @click="addChannel" class="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition font-bold text-sm shadow-sm">
                                \u786E\u8BA4\u6DFB\u52A0\u6E20\u9053
                            </button>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h3 class="font-bold text-sm text-gray-700 dark:text-slate-300 px-1">\u{1F4CB} \u5DF2\u914D\u7F6E\u6E20\u9053\u5217\u8868</h3>
                        <div v-for="(ch, idx) in config.channels" :key="idx" class="p-4 border border-gray-200 dark:border-slate-700 rounded-2xl flex justify-between items-center hover:shadow-md transition bg-white dark:bg-slate-800">
                            <div>
                                <div class="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2.5">
                                    {{ ch.name }} 
                                    <span class="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md uppercase font-bold">{{ ch.type }}</span>
                                </div>
                            </div>
                            <div class="flex gap-1.5">
                                <button @click="openEditChannelModal(idx)" class="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">\u7F16\u8F91</button>
                                <button @click="removeChannel(idx)" class="text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">\u5220\u9664</button>
                            </div>
                        </div>
                        <div v-if="config.channels.length === 0" class="text-center text-gray-400 dark:text-slate-500 py-8 text-sm">\u6E20\u9053\u5217\u8868\u4E3A\u7A7A</div>
                    </div>
                </div>

                <div v-if="currentTab === 'logs'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 max-w-5xl mx-auto space-y-4">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-slate-700 pb-4 gap-2">
                        <div>
                            <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>\u{1F4DC}</span> \u540E\u53F0\u8F6E\u8BE2\u76D1\u63A7\u7ED3\u679C\u65E5\u5FD7
                            </h2>
                            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">\u81EA\u52A8\u622A\u53D6\u5E76\u4FDD\u7559\u6700\u8FD1 100 \u6B21\u5B9A\u65F6\u8109\u640F\u63A2\u6D4B\u7684\u539F\u59CB\u8BB0\u5F55</p>
                        </div>
                        <div class="flex gap-2 self-end sm:self-auto">
                            <button @click="clearLogs" class="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-red-200 dark:border-slate-600 transition font-medium">\u{1F5D1}\uFE0F \u6E05\u7A7A\u65E5\u5FD7</button>
                            <button @click="fetchLogs" class="text-xs bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-600 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-slate-600 transition font-bold flex items-center gap-1">\u{1F504} \u5237\u65B0\u6570\u636E</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs font-mono">
                            <thead>
                                <tr class="border-b border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 bg-gray-50/40 dark:bg-slate-900/40">
                                    <th class="p-3 w-40 font-semibold">\u63A2\u6D4B\u65F6\u95F4</th>
                                    <th class="p-3 w-48 font-semibold">\u4EFB\u52A1\u540D\u79F0</th>
                                    <th class="p-3 w-28 font-semibold">\u63A2\u6D4B\u7ED3\u679C</th>
                                    <th class="p-3 font-semibold">\u8FD4\u56DE\u8BE6\u60C5 / HTTP \u8017\u65F6</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-slate-700/60 font-sans">
                                <tr v-for="(item, idx) in logs" :key="idx" class="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                                    <td class="p-3 text-gray-400 dark:text-slate-400 font-mono whitespace-nowrap">{{ formatLogTime(item.time) }}</td>
                                    <td class="p-3 font-bold text-gray-800 dark:text-slate-200">{{ item.taskName }}</td>
                                    <td class="p-3">
                                        <span v-if="item.status === 'ok'" class="px-2 py-0.5 bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-400 rounded text-xs font-semibold">\u6B63\u5E38 (OK)</span>
                                        <span v-else class="px-2 py-0.5 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 rounded text-xs font-semibold">\u5F02\u5E38 (Down)</span>
                                    </td>
                                    <td class="p-3 text-gray-600 dark:text-slate-300 font-mono truncate max-w-md" :title="item.detail">{{ item.detail }}</td>
                                </tr>
                                <tr v-if="logs.length === 0">
                                    <td colspan="4" class="p-12 text-center text-gray-400 dark:text-slate-500 font-sans text-sm">\u6682\u65E0\u8F6E\u8BE2\u65E5\u5FD7\u8BB0\u5F55</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="currentTab === 'users'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
                    
                    <div class="border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl">
                        <h3 class="font-extrabold text-sm text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">\u{1F451} \u8D85\u7EA7\u7BA1\u7406\u5458 (Root)</h3>
                        <p class="text-xs text-gray-500 dark:text-slate-400 mb-4">\u62E5\u6709\u7CFB\u7EDF\u6700\u9AD8\u6743\u9650\u3002\u6B64\u8D26\u53F7\u7684\u5BC6\u7801\u53D7 Cloudflare \u73AF\u5883\u53D8\u91CF\u4E25\u683C\u4FDD\u62A4\uFF0C\u9762\u677F\u5185\u4E0D\u53EF\u5220\u9664\u4E0E\u4FEE\u6539\u3002</p>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <input :value="rootUsername" disabled class="w-full sm:w-1/2 p-3 border rounded-xl bg-gray-200/60 dark:bg-slate-900/60 dark:border-slate-700 text-sm font-bold text-gray-500 cursor-not-allowed">
                            <input value="********" disabled type="password" class="w-full sm:w-1/2 p-3 border rounded-xl bg-gray-200/60 dark:bg-slate-900/60 dark:border-slate-700 text-sm text-gray-500 cursor-not-allowed">
                        </div>
                    </div>

                    <div class="p-5 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h3 class="font-extrabold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><span>\u{1F465}</span> \u9762\u677F\u5B50\u8D26\u53F7\u7BA1\u7406</h3>
                                <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">\u60A8\u53EF\u968F\u65F6\u5728\u6B64\u6DFB\u52A0\u6216\u64A4\u9500\u56E2\u961F\u5B50\u8D26\u53F7\u3002\u4FEE\u6539\u540E\u9700\u70B9\u51FB\u4E0B\u65B9\u4FDD\u5B58\u6309\u94AE\u3002</p>
                            </div>
                            <button @click="addUser" class="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-800 px-4 py-2 rounded-xl transition font-bold border border-indigo-200 dark:border-indigo-700">\u2795 \u6DFB\u52A0\u8D26\u53F7</button>
                        </div>
                        
                        <div class="space-y-3 mb-6">
                            <div v-for="(user, idx) in sysUsers" :key="idx" class="flex flex-col sm:flex-row gap-3 items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                <input v-model="user.username" placeholder="\u8BBE\u7F6E\u5B50\u8D26\u53F7\u7528\u6237\u540D" class="w-full sm:w-5/12 p-2.5 border rounded-lg bg-gray-50 dark:bg-slate-900 dark:border-slate-600 text-sm font-bold">
                                <input v-model="user.password" placeholder="\u8BBE\u7F6E\u8BBF\u95EE\u5BC6\u7801" class="w-full sm:w-5/12 p-2.5 border rounded-lg bg-gray-50 dark:bg-slate-900 dark:border-slate-600 text-sm">
                                <button @click="removeUser(idx)" class="w-full sm:w-2/12 text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 p-2.5 rounded-lg transition text-xs font-bold border border-transparent hover:border-red-200">\u5220\u9664</button>
                            </div>
                            <div v-if="sysUsers.length === 0" class="text-center text-gray-400 dark:text-slate-500 py-6 text-sm">\u6682\u65E0\u9644\u52A0\u5B50\u8D26\u53F7\uFF0C\u70B9\u51FB\u53F3\u4E0A\u89D2\u6DFB\u52A0\u3002</div>
                        </div>

                        <button @click="saveUsers" class="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition font-bold text-sm shadow-sm flex justify-center items-center gap-2">
                            <span>\u{1F4BE}</span> \u786E\u8BA4\u5E94\u7528\u5E76\u4FDD\u5B58\u6240\u6709\u5B50\u8D26\u53F7\u914D\u7F6E
                        </button>
                    </div>
                </div>

            </div>

            <div v-if="showBatchModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="font-black text-base text-indigo-600 dark:text-indigo-400 flex items-center gap-2">\u{1F4E6} \u6279\u91CF\u5206\u914D\u901A\u77E5\u6E20\u9053</h3>
                        <button @click="showBatchModal = false" class="text-gray-400 hover:text-white text-xl">&times;</button>
                    </div>
                    <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div class="text-xs text-amber-700 font-bold bg-amber-50 p-3 rounded-xl border border-amber-200">
                            \u{1F4A1} \u5373\u5C06\u4E3A\u5DF2\u52FE\u9009\u7684 {{ selectedTaskIndices.length }} \u4E2A\u4FDD\u6D3B\u4EFB\u52A1\u6267\u884C\u6279\u91CF\u540C\u6B65
                        </div>
                        <div>
                            <label class="block text-xs font-extrabold text-gray-500 mb-2">\u9009\u62E9\u8986\u76D6\u903B\u8F91</label>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs" :class="batchMode === 'overwrite' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200'">
                                    <input type="radio" value="overwrite" v-model="batchMode" name="bmode" class="accent-indigo-600">
                                    <span>\u5B8C\u5168\u66FF\u6362 (\u62B9\u9664\u539F\u6709)</span>
                                </label>
                                <label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs" :class="batchMode === 'append' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200'">
                                    <input type="radio" value="append" v-model="batchMode" name="bmode" class="accent-indigo-600">
                                    <span>\u8FFD\u52A0\u5408\u5E76 (\u4FDD\u7559\u539F\u6709)</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-extrabold text-gray-500 mb-2">\u52FE\u9009\u76EE\u6807\u901A\u77E5\u6E20\u9053</label>
                            <div class="grid grid-cols-2 gap-2 p-3 border rounded-xl bg-gray-50 max-h-40 overflow-y-auto">
                                <label v-for="(ch, idx) in config.channels" :key="idx" class="flex items-center space-x-2 cursor-pointer text-xs font-medium p-1">
                                    <input type="checkbox" :value="ch.name" v-model="batchNotifyChannels" class="rounded border-gray-300">
                                    <span class="truncate">{{ ch.name }}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                        <button @click="showBatchModal = false" class="px-5 py-2.5 rounded-xl border font-bold text-xs">\u53D6\u6D88</button>
                        <button @click="confirmBatchAssign" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs">\u786E\u8BA4\u6279\u91CF\u751F\u6548</button>
                    </div>
                </div>
            </div>

            <div v-if="showTaskModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="font-black text-base text-indigo-600 dark:text-indigo-400">\u270F\uFE0F \u7F16\u8F91\u4FDD\u6D3B\u4EFB\u52A1</h3>
                        <button @click="showTaskModal = false" class="text-gray-400 hover:text-white text-xl">&times;</button>
                    </div>
                    <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <input v-model="editingTask.name" placeholder="\u4EFB\u52A1\u540D\u79F0" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 text-sm font-bold">
                        <input v-model="editingTask.url" placeholder="URL \u5730\u5740" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        <input v-model.number="editingTask.interval" type="number" placeholder="\u8BBF\u95EE\u95F4\u9694 (\u5206\u949F)" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 text-sm">
                        <div class="grid grid-cols-2 gap-2 p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 max-h-32 overflow-y-auto">
                            <label v-for="(ch, idx) in config.channels" :key="idx" class="flex items-center space-x-2 cursor-pointer text-xs font-medium">
                                <input type="checkbox" :value="ch.name" v-model="editingTask.notifyChannels" class="rounded border-gray-300">
                                <span class="truncate">{{ ch.name }}</span>
                            </label>
                        </div>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t flex justify-end gap-3">
                        <button @click="showTaskModal = false" class="px-5 py-2.5 rounded-xl border text-xs font-bold text-gray-700 dark:text-gray-300">\u53D6\u6D88</button>
                        <button @click="confirmEditTask" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">\u4FDD\u5B58\u4FEE\u6539</button>
                    </div>
                </div>
            </div>

            <div v-if="showChannelModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="font-black text-base text-purple-600 dark:text-purple-400">\u270F\uFE0F \u7F16\u8F91\u6E20\u9053</h3>
                        <button @click="showChannelModal = false" class="text-gray-400 hover:text-white text-xl">&times;</button>
                    </div>
                    <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <input v-model="editingChannel.name" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 text-sm font-bold">
                        
                        <template v-if="editingChannel.type === 'telegram'">
                            <input v-model="editingChannel.token" placeholder="Bot Token" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs">
                            <input v-model="editingChannel.chatId" placeholder="Chat ID" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs">
                        </template>

                        <template v-if="editingChannel.type === 'bark'">
                            <input v-model="editingChannel.token" placeholder="Bark Device Key" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs">
                            <input v-model="editingChannel.url" placeholder="Bark Server URL" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs">
                        </template>
                        
                        <template v-if="['pushplus', 'notifyx'].includes(editingChannel.type)">
                            <input v-model="editingChannel.token" placeholder="Token / API Key" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs">
                        </template>
                        <template v-if="['dingtalk', 'lark', 'webhook'].includes(editingChannel.type)">
                            <input v-model="editingChannel.url" placeholder="Webhook URL" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs">
                        </template>
                        <template v-if="['dingtalk', 'lark'].includes(editingChannel.type)">
                            <input v-model="editingChannel.secret" placeholder="Secret" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs">
                        </template>
                        <template v-if="editingChannel.type === 'webhook'">
                            <textarea v-model="editingChannel.headers" placeholder="Headers (JSON)" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 text-xs"></textarea>
                        </template>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900 flex justify-between">
                        <button @click="testEditingChannel" class="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold">\u{1F514} \u6D4B\u8BD5\u6B64\u914D\u7F6E</button>
                        <div class="flex gap-2">
                            <button @click="showChannelModal = false" class="px-4 py-2 rounded-xl border text-xs font-bold text-gray-700 dark:text-gray-300">\u53D6\u6D88</button>
                            <button @click="confirmEditChannel" class="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">\u4FDD\u5B58\u4FEE\u6539</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </div>

    <script>
        const { createApp, ref, computed, onMounted, watch } = Vue;

        createApp({
            setup() {
                const isDark = ref(false);
                const currentTab = ref('dashboard');
                const hasUnsavedChanges = ref(false);
                const config = ref({ tasks: [], channels: [] });
                const logs = ref([]); 
                
                // === Auth\u4E0E\u591A\u7528\u6237 ===
                const isLoggedIn = ref(false);
                const isLoggingIn = ref(false);
                const loginForm = ref({ user: '', pass: '' });
                const loggedInUser = ref('');
                
                const sysUsers = ref([]);
                const rootUsername = ref('');

                const defaultChannel = () => ({ type: 'telegram', name: '', token: '', url: '', chatId: '', fromEmail: '', toEmail: '', topic: '', secret: '', headers: '' });
                const newChannel = ref(defaultChannel());
                const newTask = ref({ name: '', url: '', interval: 5, notifyChannels: [], status: 'pending', lastCheck: 0 });

                // \u6279\u91CF\u64CD\u4F5C
                const selectedTaskIndices = ref([]);
                const showBatchModal = ref(false);
                const batchMode = ref('overwrite');
                const batchNotifyChannels = ref([]);

                // \u7F16\u8F91\u72B6\u6001
                const showTaskModal = ref(false);
                const editingTaskIndex = ref(null);
                const editingTask = ref({});

                const showChannelModal = ref(false);
                const editingChannelIndex = ref(null);
                const editingChannel = ref({});
                const oldChannelNameForCascade = ref('');

                watch(() => config.value, () => {
                    if (isLoggedIn.value) hasUnsavedChanges.value = true;
                }, { deep: true });

                const toggleTheme = () => {
                    isDark.value = !isDark.value;
                    if (isDark.value) {
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('theme', 'light');
                    }
                };

                const formatTime = (ts) => ts ? new Date(ts).toLocaleString('zh-CN', { hour12: false }) : '\u5C1A\u672A\u63A2\u6D4B';
                const formatLogTime = (ts) => new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

                // ===== \u4F1A\u8BDD\u4E0E\u7CFB\u7EDF\u7BA1\u7406 API =====
                const checkAuthSession = async () => {
                    try {
                        const res = await fetch('/api/check-session');
                        if (res.ok) {
                            const data = await res.json();
                            loggedInUser.value = data.user;
                            isLoggedIn.value = true;
                            loadAllData();
                        }
                    } catch(e){}
                };

                const doLogin = async () => {
                    if (!loginForm.value.user || !loginForm.value.pass) return alert('\u8D26\u53F7\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A');
                    isLoggingIn.value = true;
                    try {
                        const res = await fetch('/api/login', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(loginForm.value)
                        });
                        if (res.ok) {
                            loggedInUser.value = loginForm.value.user;
                            isLoggedIn.value = true;
                            loadAllData();
                        } else alert('\u274C \u767B\u5F55\u9A8C\u8BC1\u5931\u8D25\uFF1A\u8D26\u53F7\u6216\u5BC6\u7801\u4E0D\u6B63\u786E\uFF01');
                    } catch(e) { alert('\u7F51\u7EDC\u5F02\u5E38'); }
                    finally { isLoggingIn.value = false; }
                };

                const doLogout = async () => {
                    if (!confirm('\u786E\u5B9A\u8981\u9000\u51FA\u5F53\u524D\u9762\u677F\u7BA1\u7406\u5417\uFF1F')) return;
                    await fetch('/api/logout', { method: 'POST' });
                    isLoggedIn.value = false;
                    loginForm.value = { user: '', pass: '' };
                };

                const loadAllData = () => {
                    loadConfig();
                    fetchLogs();
                    fetchUsers();
                };

                const fetchUsers = async () => {
                    try {
                        const res = await fetch('/api/users');
                        if (res.ok) {
                            const data = await res.json();
                            rootUsername.value = data.rootUser;
                            sysUsers.value = data.users || [];
                        }
                    } catch(e){}
                };

                const saveUsers = async () => {
                    // \u6821\u9A8C\u8F93\u5165\u5408\u6CD5\u6027
                    for(let u of sysUsers.value) {
                        if(!u.username || !u.password) return alert('\u5B50\u8D26\u53F7\u7684\u7528\u6237\u540D\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A\uFF01');
                        if(u.username === rootUsername.value) return alert('\u5B50\u8D26\u53F7\u4E0D\u80FD\u4E0E\u8D85\u7EA7\u7BA1\u7406\u5458(Root)\u540C\u540D\uFF01');
                    }
                    try {
                        const res = await fetch('/api/users', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(sysUsers.value)
                        });
                        if(res.ok) alert('\u2705 \u5B50\u8D26\u53F7\u914D\u7F6E\u5DF2\u5B89\u5168\u4E0B\u53D1\u4FDD\u5B58\uFF01');
                        else alert('\u4FDD\u5B58\u5931\u8D25');
                    } catch(e){ alert('\u4FDD\u5B58\u5931\u8D25'); }
                };

                const addUser = () => sysUsers.value.push({username: '', password: ''});
                const removeUser = (idx) => sysUsers.value.splice(idx, 1);

                // ===== \u6838\u5FC3\u914D\u7F6E API =====
                const loadConfig = async () => {
                    try {
                        const res = await fetch('/api/config');
                        if (res.ok) {
                            const data = await res.json();
                            if (data.tasks) {
                                config.value = data;
                                setTimeout(() => hasUnsavedChanges.value = false, 50);
                            }
                        }
                    } catch (e) {}
                };

                const saveConfig = async () => {
                    try {
                        const res = await fetch('/api/config', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config.value)
                        });
                        if (res.ok) {
                            hasUnsavedChanges.value = false;
                            alert('\u2705 \u914D\u7F6E\u5DF2\u6210\u529F\u4FDD\u5B58\u5230 Cloudflare KV \u6570\u636E\u5E93\u5E76\u751F\u6548\uFF01');
                        } else alert('\u4FDD\u5B58\u5931\u8D25');
                    } catch (e) { alert('\u4FDD\u5B58\u5931\u8D25'); }
                };

                const fetchLogs = async () => {
                    try {
                        const res = await fetch('/api/logs');
                        if (res.ok) logs.value = await res.json();
                    } catch(e){}
                };

                const clearLogs = async () => {
                    if(!confirm('\u786E\u5B9A\u8981\u5F7B\u5E95\u6E05\u7A7A\u540E\u53F0\u8F6E\u8BE2\u76D1\u63A7\u65E5\u5FD7\u5417\uFF1F')) return;
                    await fetch('/api/logs', { method: 'DELETE' });
                    logs.value = [];
                };

                // ===== \u901A\u9053\u4E0E\u4EFB\u52A1\u6D4B\u8BD5\u4EA4\u4E92 =====
                const executeTest = async (payload) => {
                    try {
                        const res = await fetch('/api/test-channel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                        const data = await res.json();
                        if (data.status === 'ok') alert('\u2705 \u6D4B\u8BD5\u6D88\u606F\u53D1\u9001\u6210\u529F\uFF01\u8BF7\u524D\u5F80\u63A5\u6536\u7AEF\u6838\u5B9E\u3002');
                        else alert('\u274C \u6D4B\u8BD5\u53D1\u9001\u5931\u8D25:\\n' + (data.message || '\u672A\u77E5\u9519\u8BEF'));
                    } catch (e) { alert('\u274C \u7F51\u7EDC\u5F02\u5E38:\\n' + e.message); }
                };
                const testChannel = () => { if (!newChannel.value.type) return alert('\u8BF7\u9009\u62E9\u6E20\u9053\u7C7B\u578B'); executeTest(newChannel.value); };
                const testEditingChannel = () => executeTest(editingChannel.value);

                // \u6279\u91CF\u5206\u914D\u4EA4\u4E92
                const selectAllTasks = computed({
                    get: () => config.value.tasks.length > 0 && selectedTaskIndices.value.length === config.value.tasks.length,
                    set: (val) => { selectedTaskIndices.value = val ? config.value.tasks.map((_, i) => i) : []; }
                });
                const openBatchChannelModal = () => { batchNotifyChannels.value = []; batchMode.value = 'overwrite'; showBatchModal.value = true; };
                const confirmBatchAssign = () => {
                    selectedTaskIndices.value.forEach(idx => {
                        const t = config.value.tasks[idx];
                        if (batchMode.value === 'overwrite') t.notifyChannels = [...batchNotifyChannels.value];
                        else if (batchMode.value === 'append') t.notifyChannels = Array.from(new Set([...(t.notifyChannels || []), ...batchNotifyChannels.value]));
                    });
                    showBatchModal.value = false; selectedTaskIndices.value = []; 
                };
                const batchRemoveTasks = () => {
                    if (!confirm('\u26A0\uFE0F \u5371\u9669\u64CD\u4F5C\uFF1A\u786E\u5B9A\u8981\u6279\u91CF\u5F7B\u5E95\u5220\u9664\u52FE\u9009\u7684 ' + selectedTaskIndices.value.length + ' \u4E2A\u4EFB\u52A1\u5417\uFF1F')) return;
                    const sorted = [...selectedTaskIndices.value].sort((a, b) => b - a);
                    sorted.forEach(idx => config.value.tasks.splice(idx, 1));
                    selectedTaskIndices.value = [];
                };

                // \u5355\u9879\u4FEE\u6539\u4EA4\u4E92
                const addChannel = () => {
                    if (!newChannel.value.name) return alert('\u8BF7\u586B\u5199\u6E20\u9053\u522B\u540D');
                    config.value.channels.push({ ...newChannel.value });
                    newChannel.value = defaultChannel();
                };
                const openEditChannelModal = (idx) => {
                    editingChannelIndex.value = idx;
                    editingChannel.value = JSON.parse(JSON.stringify(config.value.channels[idx]));
                    oldChannelNameForCascade.value = editingChannel.value.name;
                    showChannelModal.value = true;
                };
                const confirmEditChannel = () => {
                    if (!editingChannel.value.name) return alert('\u6E20\u9053\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A');
                    const newName = editingChannel.value.name;
                    const oldName = oldChannelNameForCascade.value;
                    config.value.channels[editingChannelIndex.value] = { ...editingChannel.value };
                    if (oldName !== newName) {
                        config.value.tasks.forEach(t => {
                            const idx = t.notifyChannels.indexOf(oldName);
                            if (idx !== -1) t.notifyChannels.splice(idx, 1, newName);
                        });
                    }
                    showChannelModal.value = false;
                };
                const removeChannel = (idx) => {
                    const chName = config.value.channels[idx].name;
                    config.value.tasks.forEach(t => {
                        const i = t.notifyChannels.indexOf(chName);
                        if (i !== -1) t.notifyChannels.splice(i, 1);
                    });
                    config.value.channels.splice(idx, 1);
                };

                const addTask = () => {
                    if (!newTask.value.name || !newTask.value.url) return alert('\u8BF7\u5B8C\u6574\u586B\u5199\u4EFB\u52A1\u540D\u548CURL');
                    config.value.tasks.push({ ...newTask.value });
                    newTask.value = { name: '', url: '', interval: 5, notifyChannels: [], status: 'pending', lastCheck: 0 };
                    selectedTaskIndices.value = []; 
                };
                const openEditTaskModal = (idx) => {
                    editingTaskIndex.value = idx;
                    editingTask.value = JSON.parse(JSON.stringify(config.value.tasks[idx]));
                    if (!editingTask.value.notifyChannels) editingTask.value.notifyChannels = [];
                    showTaskModal.value = true;
                };
                const confirmEditTask = () => {
                    if (!editingTask.value.name || !editingTask.value.url) return alert('\u4EFB\u52A1\u540D\u548C URL \u4E0D\u80FD\u4E3A\u7A7A');
                    config.value.tasks[editingTaskIndex.value] = { ...editingTask.value };
                    showTaskModal.value = false;
                };
                const removeTask = (idx) => { config.value.tasks.splice(idx, 1); selectedTaskIndices.value = []; };

                onMounted(() => {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        isDark.value = true; document.documentElement.classList.add('dark');
                    }
                    checkAuthSession();
                });

                return { 
                    isDark, currentTab, hasUnsavedChanges, toggleTheme, formatTime, formatLogTime,
                    isLoggedIn, isLoggingIn, loginForm, loggedInUser, doLogin, doLogout,
                    sysUsers, rootUsername, fetchUsers, saveUsers, addUser, removeUser,
                    config, logs, loadConfig, fetchLogs, clearLogs, saveConfig,
                    newChannel, addChannel, removeChannel, testChannel,
                    showChannelModal, editingChannel, openEditChannelModal, confirmEditChannel, testEditingChannel,
                    newTask, addTask, removeTask,
                    showTaskModal, editingTask, openEditTaskModal, confirmEditTask,
                    selectedTaskIndices, selectAllTasks, showBatchModal, batchMode, batchNotifyChannels, openBatchChannelModal, confirmBatchAssign, batchRemoveTasks
                };
            }
        }).mount('#app');
    </script>
</body>
</html>
`;
async function createSessionToken(secret, text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sign = await crypto.subtle.sign("HMAC", key, enc.encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(sign)));
}
async function verifySessionToken(secret, token) {
  if (!token) return null;
  try {
    const parts = atob(decodeURIComponent(token)).split(":");
    if (parts.length !== 3) return null;
    const [user, ts, sign] = parts;
    if (Date.now() - parseInt(ts) > 6048e5) return null;
    const expectedSign = await createSessionToken(secret, user + ":" + ts);
    return sign === expectedSign ? user : null;
  } catch (e) {
    return null;
  }
}
function getCookie(request, name) {
  const cookieString = request.headers.get("Cookie");
  if (!cookieString) return null;
  const cookies = cookieString.split(";");
  for (let c of cookies) {
    const [k, v] = c.trim().split("=");
    if (k === name) return v;
  }
  return null;
}
async function generateDingTalkSignature(secret, timestamp) {
  const signStr = timestamp + "\n" + secret;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signStr));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
async function generateLarkSignature(secret, timestamp) {
  const signStr = timestamp + "\n" + secret;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(signStr), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new Uint8Array(0));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
var worker_v1_3_0_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const adminUser = env.ADMIN_USER || "admin";
    const adminPass = env.ADMIN_PASS || "admin";
    if (url.pathname === "/api/login" && request.method === "POST") {
      const { user, pass } = await request.json();
      let authSuccess = false;
      if (user === adminUser && pass === adminPass) {
        authSuccess = true;
      } else {
        const kvUsers = await env.DB.get("SYSTEM_USERS", "json") || [];
        if (kvUsers.some((u) => u.username === user && u.password === pass)) authSuccess = true;
      }
      if (authSuccess) {
        const ts = Date.now().toString();
        const sign = await createSessionToken(adminPass, user + ":" + ts);
        const fullToken = btoa(user + ":" + ts + ":" + sign);
        return new Response('{"status":"ok"}', {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": "KA_SESSION=" + encodeURIComponent(fullToken) + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
          }
        });
      }
      return new Response('{"status":"error"}', { status: 401, headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/api/logout" && request.method === "POST") {
      return new Response('{"status":"ok"}', { headers: { "Content-Type": "application/json", "Set-Cookie": "KA_SESSION=; Path=/; HttpOnly; Max-Age=0" } });
    }
    if (url.pathname.startsWith("/api/")) {
      const sessionCookie = getCookie(request, "KA_SESSION");
      const tokenUser = await verifySessionToken(adminPass, sessionCookie);
      let isAuthValid = false;
      if (tokenUser === adminUser) {
        isAuthValid = true;
      } else if (tokenUser) {
        const kvUsers = await env.DB.get("SYSTEM_USERS", "json") || [];
        if (kvUsers.some((u) => u.username === tokenUser)) isAuthValid = true;
      }
      if (url.pathname === "/api/check-session") {
        return isAuthValid ? new Response(JSON.stringify({ user: tokenUser }), { headers: { "Content-Type": "application/json" } }) : new Response("unauthorized", { status: 401 });
      }
      if (!isAuthValid) return new Response('{"error":"Session Expired"}', { status: 401, headers: { "Content-Type": "application/json" } });
      if (url.pathname === "/api/users") {
        if (request.method === "GET") {
          const kvUsers = await env.DB.get("SYSTEM_USERS", "json") || [];
          return new Response(JSON.stringify({ rootUser: adminUser, users: kvUsers }), { headers: { "Content-Type": "application/json" } });
        }
        if (request.method === "POST") {
          const usersPayload = await request.json();
          await env.DB.put("SYSTEM_USERS", JSON.stringify(usersPayload));
          return new Response('{"status":"ok"}', { headers: { "Content-Type": "application/json" } });
        }
      }
      if (url.pathname === "/api/test-channel" && request.method === "POST") {
        const ch = await request.json();
        const testTime = (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
        const results = await sendNotifications([ch], "\u{1F527} \u6E20\u9053\u914D\u7F6E\u8FDE\u901A\u6027\u6D4B\u8BD5", `\u8FD9\u662F\u4E00\u6761\u6D4B\u8BD5\u8109\u640F\u6D88\u606F\uFF0C\u5982\u679C\u60A8\u6536\u5230\u5B83\uFF0C\u8BF4\u660E\u8BE5\u901A\u77E5\u6E20\u9053\u5DF2\u6210\u529F\u63A5\u901A\uFF01

\u3010\u6D4B\u8BD5\u65F6\u95F4\u3011${testTime}`);
        const first = results[0];
        if (first && first.status === "fulfilled") return new Response('{"status":"ok"}', { headers: { "Content-Type": "application/json" } });
        else return new Response(JSON.stringify({ status: "error", message: first ? first.reason.message : "\u672A\u6267\u884C\u53D1\u9001" }), { headers: { "Content-Type": "application/json" } });
      }
      if (url.pathname === "/api/logs") {
        if (request.method === "GET") {
          const logs = await env.DB.get("SYSTEM_LOGS", "json") || [];
          return new Response(JSON.stringify(logs), { headers: { "Content-Type": "application/json" } });
        }
        if (request.method === "DELETE") {
          await env.DB.put("SYSTEM_LOGS", "[]");
          return new Response('{"status":"ok"}', { headers: { "Content-Type": "application/json" } });
        }
      }
      if (url.pathname === "/api/config") {
        if (request.method === "GET") {
          const data = await env.DB.get("SYSTEM_CONFIG", "json") || { tasks: [], channels: [] };
          return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.put("SYSTEM_CONFIG", JSON.stringify(body));
          return new Response('{"status":"ok"}', { headers: { "Content-Type": "application/json" } });
        }
      }
    }
    return new Response(UI_HTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  },
  async scheduled(event, env, ctx) {
    const config = await env.DB.get("SYSTEM_CONFIG", "json");
    if (!config || !config.tasks || config.tasks.length === 0) return;
    let logsQueue = await env.DB.get("SYSTEM_LOGS", "json") || [];
    const now = Date.now();
    let needsSaveConfig = false;
    let minuteLogs = [];
    for (let task of config.tasks) {
      const intervalMs = (task.interval || 5) * 60 * 1e3;
      if (now - (task.lastCheck || 0) >= intervalMs) {
        task.lastCheck = now;
        needsSaveConfig = true;
        let isSuccess = false;
        let detailMsg = "";
        const startTs = Date.now();
        try {
          const res = await fetch(task.url, { method: "GET", headers: { "User-Agent": "Cloudflare-KeepAlive-Pro/13.0" }, cf: { cacheTtl: 0 } });
          isSuccess = res.ok;
          const rtt = Date.now() - startTs;
          detailMsg = isSuccess ? `HTTP ${res.status} (${rtt}ms)` : `HTTP \u72B6\u6001\u5F02\u5E38: ${res.status}`;
        } catch (e) {
          isSuccess = false;
          detailMsg = `\u7F51\u7EDC\u6216DNS\u5F02\u5E38: ${e.message}`;
        }
        minuteLogs.push({ time: now, taskName: task.name, status: isSuccess ? "ok" : "down", detail: detailMsg });
        const linkedChannels = config.channels.filter((c) => task.notifyChannels.includes(c.name));
        const timeStr = new Date(now).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
        if (!isSuccess) {
          task.status = "down";
          await sendNotifications(linkedChannels, "\u{1F6A8} \u7AD9\u70B9\u4FDD\u6D3B\u5931\u8D25", `\u3010\u4EFB\u52A1\u540D\u79F0\u3011${task.name}
\u3010\u76D1\u63A7\u7F51\u5740\u3011${task.url}
\u3010\u53D1\u751F\u65F6\u95F4\u3011${timeStr}
\u3010\u5F02\u5E38\u8BE6\u60C5\u3011${detailMsg}`);
        } else {
          if (task.status === "down") {
            await sendNotifications(linkedChannels, "\u2705 \u7AD9\u70B9\u6062\u590D\u6B63\u5E38", `\u3010\u4EFB\u52A1\u540D\u79F0\u3011${task.name}
\u3010\u76D1\u63A7\u7F51\u5740\u3011${task.url}
\u3010\u53D1\u751F\u65F6\u95F4\u3011${timeStr}
\u3010\u5F53\u524D\u72B6\u6001\u3011\u5DF2\u6062\u590D\u6B63\u5E38\u8BBF\u95EE`);
          }
          task.status = "ok";
        }
      }
    }
    if (needsSaveConfig) await env.DB.put("SYSTEM_CONFIG", JSON.stringify(config));
    if (minuteLogs.length > 0) {
      logsQueue = [...minuteLogs, ...logsQueue].slice(0, 100);
      await env.DB.put("SYSTEM_LOGS", JSON.stringify(logsQueue));
    }
  }
};
async function sendNotifications(channels, title, message) {
  const promises = channels.map(async (ch) => {
    const combinedText = `${title}

${message}`;
    let res;
    switch (ch.type) {
      case "telegram":
        res = await fetch(`https://api.telegram.org/bot${ch.token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: ch.chatId, text: combinedText }) });
        break;
      // --- Bark 核心推送逻辑 (支持自建 URL) ---
      case "bark":
        let barkUrl = ch.url || "https://api.day.app";
        if (barkUrl.endsWith("/")) barkUrl = barkUrl.slice(0, -1);
        res = await fetch(`${barkUrl}/${ch.token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ title, body: message })
        });
        break;
      case "pushplus":
        res = await fetch("https://www.pushplus.plus/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: ch.token, title, content: message, template: "txt" }) });
        break;
      case "notifyx":
        res = await fetch(`https://www.notifyx.cn/api/v1/send/${ch.token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content: message }) });
        break;
      case "dingtalk":
        let dingUrl = ch.url;
        if (ch.secret) {
          const timestamp = Date.now().toString();
          const sign = await generateDingTalkSignature(ch.secret, timestamp);
          dingUrl += (dingUrl.includes("?") ? "&" : "?") + `timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
        }
        res = await fetch(dingUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ msgtype: "text", text: { content: combinedText } }) });
        break;
      case "lark":
        let larkBody = { msg_type: "text", content: { text: combinedText } };
        if (ch.secret) {
          const timestamp = Math.floor(Date.now() / 1e3).toString();
          const sign = await generateLarkSignature(ch.secret, timestamp);
          larkBody.timestamp = timestamp;
          larkBody.sign = sign;
        }
        res = await fetch(ch.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(larkBody) });
        break;
      case "webhook":
        const genericPayload = { text: combinedText, content: combinedText, msg_type: "text", title, message, desp: message };
        let customHeaders = { "Content-Type": "application/json" };
        if (ch.headers) {
          try {
            customHeaders = { ...customHeaders, ...JSON.parse(ch.headers) };
          } catch (e) {
          }
        }
        res = await fetch(ch.url, { method: "POST", headers: customHeaders, body: JSON.stringify(genericPayload) });
        break;
      case "resend":
        res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ch.token}` }, body: JSON.stringify({ from: ch.fromEmail, to: ch.toEmail, subject: title, text: message }) });
        break;
      case "gotify":
        const gotifyUrl = ch.url.endsWith("/") ? ch.url.slice(0, -1) : ch.url;
        res = await fetch(`${gotifyUrl}/message?token=${ch.token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, message, priority: 5 }) });
        break;
      case "ntfy":
        const ntfyUrl = ch.url.endsWith("/") ? ch.url.slice(0, -1) : ch.url;
        res = await fetch(`${ntfyUrl}/${ch.topic}`, { method: "POST", headers: { "Title": encodeURIComponent(title) }, body: message });
        break;
    }
    if (res && !res.ok) {
      const errText = await res.text().catch(() => "No Error Body");
      throw new Error(`HTTP ${res.status}: ${errText.substring(0, 150)}`);
    }
    return true;
  });
  return await Promise.allSettled(promises);
}

// src/blob-kv.js
var import_pages_blob = __toESM(require_dist(), 1);
var STORE_NAME = "autokeepalive";
function createMemoryKV() {
  const map = /* @__PURE__ */ new Map();
  return {
    async get(key, type) {
      const val = map.get(key);
      if (val === void 0 || val === null) return null;
      if (type === "json") {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return val;
    },
    async put(key, value) {
      map.set(key, typeof value === "string" ? value : JSON.stringify(value));
    },
    async delete(key) {
      map.delete(key);
    }
  };
}
function createBlobKV(env = {}) {
  if (env.USE_MEMORY_STORE === "1" || process.env.USE_MEMORY_STORE === "1") {
    return createMemoryKV();
  }
  const storeName = env.BLOB_STORE_NAME || process.env.BLOB_STORE_NAME || STORE_NAME;
  const projectId = env.EDGEONE_PROJECT_ID || env.PAGES_PROJECT_ID || process.env.EDGEONE_PROJECT_ID || process.env.PAGES_PROJECT_ID || "";
  const token = env.EDGEONE_TOKEN || env.EDGEONE_PAGES_API_TOKEN || process.env.EDGEONE_TOKEN || process.env.EDGEONE_PAGES_API_TOKEN || "";
  let store = null;
  const resolveStore = () => {
    if (store) return store;
    try {
      if (projectId && token) {
        store = (0, import_pages_blob.getStore)({ name: storeName, consistency: "strong", projectId, token });
      } else {
        store = (0, import_pages_blob.getStore)(storeName);
      }
      return store;
    } catch (e) {
      console.warn("[BlobKV] \u521D\u59CB\u5316 EdgeOne Blob \u5931\u8D25\uFF0C\u56DE\u9000\u5230\u5185\u5B58\u5B58\u50A8\uFF1A", e?.message);
      store = createMemoryKV();
      return store;
    }
  };
  return {
    async get(key, type) {
      const s = resolveStore();
      if (typeof s.get === "function" && !s.set) {
        return await s.get(key, type);
      }
      try {
        const item = await s.get(key, { consistency: "strong", type: type === "json" ? "json" : "text" });
        return item ?? null;
      } catch (err) {
        console.error(`[BlobKV] get ${key} error:`, err?.message);
        return null;
      }
    },
    async put(key, value) {
      const s = resolveStore();
      if (typeof s.put === "function" && !s.set) {
        return await s.put(key, value);
      }
      try {
        const payload = typeof value === "string" ? value : JSON.stringify(value);
        await s.set(key, payload);
      } catch (err) {
        console.error(`[BlobKV] put ${key} error:`, err?.message);
        throw err;
      }
    },
    async delete(key) {
      const s = resolveStore();
      if (typeof s.delete === "function") {
        await s.delete(key);
      }
    }
  };
}

// src/edgeone-entry.js
var cachedDB = null;
function getDB(env) {
  if (!cachedDB) {
    cachedDB = createBlobKV(env);
  }
  return cachedDB;
}
function resolveEnv(contextEnv = {}) {
  const merged = { ...process.env, ...contextEnv };
  if (!merged.DB) {
    merged.DB = getDB(merged);
  }
  return merged;
}
async function onRequest(context) {
  const req = context.request;
  const url = new URL(req.url);
  const env = resolveEnv(context.env);
  if (url.pathname === "/api/cron/tick" || url.pathname === "/api/cron") {
    const cronToken = env.CRON_TOKEN;
    const reqToken = url.searchParams.get("token");
    if (cronToken && reqToken !== cronToken) {
      return new Response(JSON.stringify({ status: "error", message: "Unauthorized cron token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const scheduledEvent = {
        cron: "*/5 * * * *",
        type: "scheduled",
        scheduledTime: Date.now()
      };
      const executionCtx2 = {
        waitUntil: (promise) => {
          Promise.resolve(promise).catch((err) => console.error("[Cron waitUntil Error]", err));
        },
        passThroughOnException: () => {
        }
      };
      await worker_v1_3_0_default.scheduled(scheduledEvent, env, executionCtx2);
      return new Response(JSON.stringify({ status: "ok", message: "Keepalive check executed successfully", timestamp: Date.now() }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.error("[Cron Execution Error]", err);
      return new Response(JSON.stringify({ status: "error", message: err?.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  const executionCtx = {
    waitUntil: (p) => Promise.resolve(p).catch(console.error),
    passThroughOnException: () => {
    }
  };
  return await worker_v1_3_0_default.fetch(req, env, executionCtx);
}
var edgeone_entry_default = {
  onRequest,
  fetch: (request, env, ctx) => onRequest({ request, env, ...ctx })
};
export {
  edgeone_entry_default as default,
  onRequest
};
