/**
 * 功能自动化测试脚本：验证 EdgeOne + Blob 模式下的所有业务逻辑完整性
 */
import assert from 'node:assert';
import { onRequest } from '../src/edgeone-entry.js';

// 设置为内存测试模式
process.env.USE_MEMORY_STORE = '1';
process.env.ADMIN_USER = 'admin';
process.env.ADMIN_PASS = 'admin123';
process.env.CRON_TOKEN = 'test-cron-token';

async function runTests() {
  console.log('🧪 开始运行 Auto-Keepalive EdgeOne + Blob 功能全量回归测试...');

  const origin = 'https://keepalive.test';

  // 1. 测试访问主页 (未登录应展示 UI HTML)
  {
    const req = new Request(`${origin}/`);
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert(html.includes('站点保活管理系统'), '主页应返回 UI 界面');
    console.log('✓ 1. 主页展示正常');
  }

  // 2. 测试错误密码登录
  {
    const req = new Request(`${origin}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'admin', pass: 'wrongpass' })
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 401);
    console.log('✓ 2. 错误密码拦截正常');
  }

  // 3. 测试正确密码登录并获取 Cookie
  let sessionCookie = '';
  {
    const req = new Request(`${origin}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'admin', pass: 'admin123' })
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    const rawCookie = res.headers.get('Set-Cookie');
    assert(rawCookie && rawCookie.includes('KA_SESSION='), '应下发 KA_SESSION Cookie');
    sessionCookie = rawCookie.split(';')[0];
    console.log('✓ 3. 登录与会话 Cookie 下发正常');
  }

  // 4. 测试验证会话 /api/check-session
  {
    const req = new Request(`${origin}/api/check-session`, {
      headers: { Cookie: sessionCookie }
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user, 'admin');
    console.log('✓ 4. 会话校验正常 (/api/check-session)');
  }

  // 5. 测试写入配置 (保活任务与通知渠道) -> Blob 存储
  {
    const configPayload = {
      tasks: [
        {
          name: '测试保活任务1',
          url: 'https://example.com',
          interval: 1,
          notifyChannels: ['测试Telegram'],
          status: 'ok',
          lastCheck: 0
        }
      ],
      channels: [
        {
          type: 'webhook',
          name: '测试Webhook',
          url: 'https://httpbin.org/post'
        }
      ]
    };

    const req = new Request(`${origin}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie
      },
      body: JSON.stringify(configPayload)
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    console.log('✓ 5. 配置写入正常 (/api/config POST -> Blob)');
  }

  // 6. 测试读取配置
  {
    const req = new Request(`${origin}/api/config`, {
      headers: { Cookie: sessionCookie }
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.tasks.length, 1);
    assert.strictEqual(data.tasks[0].name, '测试保活任务1');
    console.log('✓ 6. 配置持久化读取正常 (/api/config GET <- Blob)');
  }

  // 7. 测试未授权访问 Cron
  {
    const req = new Request(`${origin}/api/cron/tick?token=wrong-token`);
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 403, '非授权 token 应当拦截');
    console.log('✓ 7. 定时任务鉴权拦截正常');
  }

  // 8. 测试执行定时保活调度
  {
    const req = new Request(`${origin}/api/cron/tick?token=test-cron-token`);
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    const cronData = await res.json();
    assert.strictEqual(cronData.status, 'ok');
    console.log('✓ 8. 定时任务触发保活探测成功 (/api/cron/tick)');
  }

  // 8.1 测试管理员 Cookie 触发面板一键全量保活 (/api/cron/tick?force=1)
  {
    const req = new Request(`${origin}/api/cron/tick?force=1`, {
      headers: { Cookie: sessionCookie, Accept: 'application/json' }
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    const cronData = await res.json();
    assert.strictEqual(cronData.status, 'ok', '管理员会话应当允许免 token 执行探测');
    console.log('✓ 8.1 控制台一键探测触发正常 (/api/cron/tick?force=1 带 Cookie)');
  }

  // 8.2 测试未知 /api/ 接口 404 JSON 保护（严禁滑落到 HTML）
  {
    const req = new Request(`${origin}/api/non_exist_route`, {
      headers: { Cookie: sessionCookie }
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.status, 'error');
    console.log('✓ 8.2 API 404 JSON 拦截兜底正常 (杜绝 HTML 滑落)');
  }

  // 9. 测试查看运行日志
  {
    const req = new Request(`${origin}/api/logs`, {
      headers: { Cookie: sessionCookie }
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200);
    const logs = await res.json();
    assert(Array.isArray(logs), 'logs 必须是数组');
    console.log(`✓ 9. 运行日志记录读取正常 (当前日志条数: ${logs.length})`);
  }

  // 10. 测试多用户管理系统 (v1.3.0 新特性)
  {
    // 获取用户列表
    const getReq = new Request(`${origin}/api/users`, {
      headers: { Cookie: sessionCookie }
    });
    const getRes = await onRequest({ request: getReq });
    assert.strictEqual(getRes.status, 200);
    const usersData = await getRes.json();
    assert.strictEqual(usersData.rootUser, 'admin');

    // 写入新用户
    const postReq = new Request(`${origin}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie
      },
      body: JSON.stringify([{ username: 'subuser1', password: 'password888' }])
    });
    const postRes = await onRequest({ request: postReq });
    assert.strictEqual(postRes.status, 200);
    console.log('✓ 10. 多用户系统增加用户正常');
  }

  // 11. 测试子账号登录
  {
    const req = new Request(`${origin}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'subuser1', pass: 'password888' })
    });
    const res = await onRequest({ request: req });
    assert.strictEqual(res.status, 200, '子账号应当能正常登录');
    console.log('✓ 11. 子账号独立登录验证正常');
  }

  console.log('\n🎉 所有功能测试全部通过！EdgeOne + Blob 适配逻辑完全稳定可靠！');
}

runTests().catch((err) => {
  console.error('\n❌ 测试失败：', err);
  process.exit(1);
});
