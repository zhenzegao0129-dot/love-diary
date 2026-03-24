const APP_ID = '8e1e8e647e06b88bfde858650f8f3f44';
const API_KEY = '63ff0bf3f93f38edca2bc938ec25bd3e';
const headers = {
  'X-Bmob-Application-Id': APP_ID,
  'X-Bmob-REST-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function check() {
  const classes = ['LoveMemory', 'CourseSchedule'];
  for (const cls of classes) {
    try {
      const res = await fetch(`https://api.bmobcloud.com/1/classes/${cls}?count=1&limit=0`, { headers });
      const data = await res.json();
      console.log(`${cls} count:`, data.count);
    } catch (e) {
      console.log(`${cls} error:`, e.message);
    }
  }
}
check();
