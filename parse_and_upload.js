const fs = require('fs');

const APP_ID = '8e1e8e647e06b88bfde858650f8f3f44';
const API_KEY = '63ff0bf3f93f38edca2bc938ec25bd3e';
const URL_BASE = 'https://api.bmobcloud.com/1/classes/CourseSchedule';
const headers = {'X-Bmob-Application-Id':APP_ID,'X-Bmob-REST-API-Key':API_KEY,'Content-Type':'application/json'};

// 从DESCRIPTION提取节次 (处理 "第1 - 2节" 格式)
function getPeriodsFromDesc(desc) {
  const m = desc.match(/第(\d+)\s*-\s*(\d+)节/);
  if (m) return { start: parseInt(m[1]), end: parseInt(m[2]) };
  const m2 = desc.match(/第(\d+)节/);
  if (m2) return { start: parseInt(m2[1]), end: parseInt(m2[1]) };
  return null;
}

// 解析ICS
function parseICS(filepath) {
  const raw = fs.readFileSync(filepath, 'utf-8');
  const events = [];
  const blocks = raw.split('BEGIN:VEVENT');
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];
    const lines = block.split(/\r?\n/);
    
    let summary='', dtstartRaw='', rruleUntil='', location='', description='';
    
    for (const line of lines) {
      const l = line.trim();
      if (l.startsWith('SUMMARY:')) summary = l.substring(8);
      if (l.includes('DTSTART')) {
        const m = l.match(/(\d{8})T(\d{4,6})/);
        if (m) dtstartRaw = m[1] + 'T' + m[2];
      }
      if (l.startsWith('RRULE:')) {
        const um = l.match(/UNTIL=(\d{8})/);
        if (um) rruleUntil = um[1];
      }
      if (l.startsWith('LOCATION:')) location = l.substring(9);
      if (l.startsWith('DESCRIPTION:') && !description) description = l.substring(12);
    }
    
    if (!dtstartRaw || !summary) continue;
    
    // 解析日期: 20260309T083000
    const year = parseInt(dtstartRaw.substring(0,4));
    const month = parseInt(dtstartRaw.substring(4,6)) - 1;
    const dayOfMonth = parseInt(dtstartRaw.substring(6,8));
    const startDate = new Date(year, month, dayOfMonth);
    
    // RRULE结束日期
    let untilDate;
    if (rruleUntil) {
      untilDate = new Date(parseInt(rruleUntil.substring(0,4)), parseInt(rruleUntil.substring(4,6))-1, parseInt(rruleUntil.substring(6,8)));
    } else {
      untilDate = new Date(startDate);
    }
    
    // 从DESCRIPTION提取节次 (原始格式: "第1 - 2节\\n...")
    const descUnescaped = description.replace(/\\n/g, '\n');
    const periods = getPeriodsFromDesc(descUnescaped);
    if (!periods) {
      console.log('  跳过(无法解析节次):', summary, description);
      continue;
    }
    
    // 提取教室
    let room = location
      .replace(/东山校区\s*/g, '')
      .replace(/长清校区\s*/g, '')
      .trim();
    const parts = room.split(/\s+/);
    if (parts.length > 1) room = parts[0];
    if (room === '未排地点' || room === '') room = '';
    
    // 星期几: 0=Mon...6=Sun
    const jsDay = startDate.getDay(); // 0=Sun
    const day = jsDay === 0 ? 6 : jsDay - 1;
    
    // 该事件覆盖的所有具体日期
    const dates = [];
    let cur = new Date(startDate);
    while (cur <= untilDate) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 7);
    }
    
    events.push({
      name: summary.replace(/\*/g, ''),
      day, periodStart: periods.start, periodEnd: periods.end,
      room, dates
    });
  }
  return events;
}

// 颜色
const COLORS=['#ff6b81','#a29bfe','#74b9ff','#55efc4','#ffeaa7','#fd79a8','#00cec9','#e17055','#6c5ce7','#81ecec','#fab1a0','#ff9a9e'];
const cm = {}; let ci = 0;
function gc(n) { if(!cm[n]){cm[n]=COLORS[ci%COLORS.length];ci++;} return cm[n]; }

// 先删除所有旧课表数据
async function clearOldData() {
  console.log('正在清除旧课表数据...');
  try {
    const res = await fetch(URL_BASE + '?limit=500', { method: 'GET', headers });
    const data = await res.json();
    const items = data.results || [];
    console.log(`找到 ${items.length} 条旧数据，正在批量删除...`);
    for (const item of items) {
      await fetch(URL_BASE + '/' + item.objectId, { method: 'DELETE', headers });
    }
    console.log('旧数据清除完毕！');
  } catch(e) {
    console.log('清除失败:', e.message);
  }
}


async function upload(owner, events) {
  let ok = 0;
  for (const ev of events) {
    for (let p = ev.periodStart; p <= ev.periodEnd; p++) {
      const c = { owner, day:ev.day, period:p, name:ev.name, room:ev.room, color:gc(ev.name), dates:ev.dates };
      try {
        const r = await fetch(URL_BASE,{method:'POST',headers,body:JSON.stringify(c)});
        const d = await r.json();
        if (d.objectId) ok++;
        else console.log('  Bmob错误:', d);
      } catch(e) { console.log('[FAIL]',e.message); }
    }
    process.stdout.write(`\r  ${owner}: 已上传 ${ok} 条...`);
  }
  console.log(`\n  ${owner}: 完成 ${ok} 条`);
  return ok;
}

async function main() {
  console.log('=== 解析ICS文件 ===');
  const me = parseICS('./齐鲁工业大学.ics');
  console.log('你的课表:', me.length, '个事件段');
  me.slice(0,3).forEach(e => console.log(' ', e.name, '周'+(['一','二','三','四','五','六','日'][e.day]), '第'+e.periodStart+'-'+e.periodEnd+'节', e.room, e.dates.length+'周'));
  
  ci = 0; // 重置颜色
  const ta = parseICS('./大二下.ics');
  console.log('TA的课表:', ta.length, '个事件段');
  ta.slice(0,3).forEach(e => console.log(' ', e.name, '周'+(['一','二','三','四','五','六','日'][e.day]), '第'+e.periodStart+'-'+e.periodEnd+'节', e.room, e.dates.length+'周'));
  
  await clearOldData();

  console.log('\n=== 开始上传 ===');
  const mc = await upload('me', me);
  ci = 0; // 为TA重置颜色
  const tc = await upload('ta', ta);
  console.log(`\n=== 全部搞定! 你:${mc}条 TA:${tc}条 ===`);
}
main();
