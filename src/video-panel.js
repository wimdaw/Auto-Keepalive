/**
 * 视频任务监控面板（挂在 status.own.cloudns.nz/video）
 *
 * 纯前端页面：直接用 URL 上的 token 调用 EdgeRelay 的免凭据巡检接口
 * （https://relay.own.cloudns.nz/api/monitor/video），每 20 秒自动刷新，
 * 展示每个视频任务的状态/进度，完成后给出播放与下载链接。
 */
const RELAY_MONITOR_BASE = 'https://relay.own.cloudns.nz/api/monitor/video';

export function renderVideoPanel() {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>视频任务 · EdgeRelay</title>
<style>
  :root{color-scheme:dark}
  *{box-sizing:border-box}
  body{margin:0;background:#0a0a0d;color:#e8e8ee;font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif}
  .wrap{max-width:880px;margin:0 auto;padding:28px 18px 60px}
  header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  h1{font-size:17px;margin:0;letter-spacing:.2px}
  .sub{color:#8b8b96;font-size:12px;margin-top:3px}
  .btn{cursor:pointer;border:1px solid #2a2a34;background:#15151c;color:#c9c9d4;border-radius:9px;padding:7px 12px;font-size:12px}
  .btn:hover{background:#1d1d26}
  .stats{display:flex;gap:10px;margin:18px 0 8px;flex-wrap:wrap}
  .stat{background:#121218;border:1px solid #212129;border-radius:11px;padding:10px 14px;min-width:104px}
  .stat b{display:block;font-size:19px;line-height:1.2}
  .stat span{color:#8b8b96;font-size:11px}
  .list{display:flex;flex-direction:column;gap:10px;margin-top:14px}
  .card{background:#121218;border:1px solid #212129;border-radius:13px;padding:13px 15px}
  .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .pill{padding:1px 8px;border-radius:999px;font-size:11px;background:#242430;color:#b6b6c2}
  .pill.ok{background:rgba(16,185,129,.14);color:#34d399}
  .pill.err{background:rgba(239,68,68,.14);color:#f87171}
  .pill.run{background:rgba(99,102,241,.16);color:#a5b4fc}
  .muted{color:#8b8b96;font-size:11px}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#9ca3af;word-break:break-all}
  .bar{height:5px;background:#242430;border-radius:999px;overflow:hidden;margin-top:10px}
  .bar>i{display:block;height:100%;background:#6366f1;width:0;transition:width .4s}
  a.link{color:#a5b4fc;text-decoration:none;font-size:12px;border:1px solid #2e2e52;padding:4px 9px;border-radius:8px}
  a.link:hover{background:#1a1a2e}
  .empty{text-align:center;color:#8b8b96;padding:40px 0;font-size:13px}
  .err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:#fca5a5;border-radius:11px;padding:12px 14px;margin-top:16px;font-size:12px}
  .top{display:flex;justify-content:space-between;align-items:center;margin-top:26px;color:#66667a;font-size:11px}
</style></head>
<body><div class="wrap">
  <header>
    <div>
      <h1>EdgeRelay · 视频任务</h1>
      <div class="sub" id="sub">加载中…</div>
    </div>
    <div class="row">
      <button class="btn" id="refresh">立即刷新</button>
      <a class="btn" href="https://relay.own.cloudns.nz" target="_blank" rel="noopener" style="text-decoration:none">打开网关</a>
    </div>
  </header>

  <div class="stats">
    <div class="stat"><b id="statRun">–</b><span>进行中</span></div>
    <div class="stat"><b id="statDone">–</b><span>已完成</span></div>
    <div class="stat"><b id="statFail">–</b><span>失败/取消</span></div>
    <div class="stat"><b id="statPending">–</b><span>队列中</span></div>
  </div>

  <div id="err" class="err" style="display:none"></div>
  <div class="list" id="list"><div class="empty">正在读取任务…</div></div>
  <div class="top"><span id="checkedAt"></span><span>每 20 秒自动刷新</span></div>
</div>
<script>
const TOKEN = new URLSearchParams(location.search).get('token') || '';
const MONITOR = ${JSON.stringify(RELAY_MONITOR_BASE)};
const $ = (id) => document.getElementById(id);
const STATUS_TEXT = { queued:'队列中', in_progress:'生成中', completed:'已完成', failed:'失败', cancelled:'已取消' };
const STATUS_CLASS = { completed:'ok', failed:'err', cancelled:'err', in_progress:'run', queued:'' };

function fmtTime(sec){
  if(!sec) return '—';
  const d = new Date(sec*1000);
  const p = (n)=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
}

function render(data){
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const run = tasks.filter(t=>t.status==='in_progress').length;
  const done = tasks.filter(t=>t.status==='completed').length;
  const fail = tasks.filter(t=>t.status==='failed'||t.status==='cancelled').length;
  const queued = tasks.filter(t=>t.status==='queued').length;
  $('statRun').textContent = run;
  $('statDone').textContent = done;
  $('statFail').textContent = fail;
  $('statPending').textContent = queued;
  $('checkedAt').textContent = '检查时间 ' + fmtTime(data.checked_at);
  $('sub').textContent = '共 ' + tasks.length + ' 个任务 · 本轮新完成 ' + ((data.newly_completed||[]).length);

  if(!tasks.length){
    $('list').innerHTML = '<div class="empty">暂无视频任务<br><span class="muted">在 EdgeRelay 调用 /v1/videos 创建任务后会出现在这里</span></div>';
    return;
  }
  $('list').innerHTML = tasks.map(function(t){
    const st = t.status || 'queued';
    const p = Math.max(0, Math.min(100, Number(t.progress)||0));
    const links = [];
    if(t.url){
      links.push('<a class="link" href="'+t.url+'" target="_blank" rel="noopener">播放 / 下载</a>');
      links.push('<a class="link" href="https://relay.own.cloudns.nz/v1/videos/'+encodeURIComponent(t.id)+'/content" target="_blank" rel="noopener">直链</a>');
    }
    return '<div class="card">'
      + '<div class="row">'
      +   '<span class="pill '+(STATUS_CLASS[st]||'')+'">'+(STATUS_TEXT[st]||st)+'</span>'
      +   '<b style="font-size:13px">'+(t.model||'视频模型')+'</b>'
      +   '<span class="muted">'+fmtTime(t.created_at)+'</span>'
      +   '<span style="margin-left:auto;display:flex;gap:8px">'+links.join('')+'</span>'
      + '</div>'
      + '<div class="bar"><i style="width:'+p+'%"></i></div>'
      + '<div class="row" style="margin-top:6px"><code>'+t.id+'</code><span class="muted">'+(p)+'%</span></div>'
      + (t.error ? '<div class="muted" style="margin-top:6px;color:#fca5a5">'+String(t.error).slice(0,160)+'</div>' : '')
      + '</div>';
  }).join('');
}

async function tick(){
  if(!TOKEN){
    $('err').style.display='block';
    $('err').textContent='链接缺少 token，请使用后台生成的完整监控地址（含 ?token=…）。';
    return;
  }
  try{
    const r = await fetch(MONITOR+'?token='+encodeURIComponent(TOKEN), { cache:'no-store' });
    const text = await r.text();
    if(!r.ok){
      let msg = text.slice(0,200);
      try{ msg = JSON.parse(text).error?.message || msg; }catch(e){}
      $('err').style.display='block';
      $('err').textContent='接口返回 '+r.status+'：'+msg;
      return;
    }
    $('err').style.display='none';
    render(JSON.parse(text));
    $('sub').textContent = $('sub').textContent.replace(' · 更新于.*$','');
  }catch(e){
    $('err').style.display='block';
    $('err').textContent='请求失败：'+(e && e.message ? e.message : e);
  }
}

$('refresh').addEventListener('click', tick);
tick();
setInterval(tick, 20000);
</script>
</body></html>`;
}
