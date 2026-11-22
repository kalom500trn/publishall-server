const 【entity-express¦canonical_name=express】 = require('【entity-express¦canonical_name=express】');
const cors = require('cors');
require('dotenv').config();

const app = 【entity-express¦canonical_name=express】();
app.use(cors());
app.use(【entity-express¦canonical_name=express】.json());
app.use(【entity-express¦canonical_name=express】.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('PublishAll server is LIVE');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const YT_ID = process.env.YOUTUBE_CLIENT_ID;
const YT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const TK_KEY = process.env.TIKTOK_CLIENT_KEY;
const TK_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT = process.env.REDIRECT_URI || 'https://publishall-server-npan.vercel.app/auth/callback';

app.get('/debug', (req, res) => {
  res.json({
    youtube_id_set: !!YT_ID,
    youtube_secret_set: !!YT_SECRET,
    tiktok_key_set: !!TK_KEY,
    tiktok_secret_set: !!TK_SECRET,
    redirect: REDIRECT
  });
});

app.get('/auth/youtube', (req, res) => {
  if (!YT_ID) return res.status(500).json({ ok: false, error: 'YOUTUBE_CLIENT_ID missing in Vercel env vars' });
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + YT_ID +
    '&redirect_uri=' + encodeURIComponent(REDIRECT) +
    '&response_type=code' +
    '&scope=' + encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly') +
    '&access_type=offline&prompt=consent&state=youtube';
  res.redirect(url);
});

app.get('/auth/tiktok', (req, res) => {
  if (!TK_KEY) return res.status(500).json({ ok: false, error: 'TIKTOK_CLIENT_KEY missing in Vercel env vars' });
  const url = 'https://www.tiktok.com/v2/auth/authorize/?client_key=' + TK_KEY +
    '&redirect_uri=' + encodeURIComponent(REDIRECT) +
    '&response_type=code' +
    '&scope=' + encodeURIComponent('user.info.basic,video.publish,video.upload') +
    '&state=tiktok';
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ ok: false, error: 'No code returned' });

  if (state === 'youtube') {
    try {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code,
          client_id: YT_ID,
          client_secret: YT_SECRET,
          redirect_uri: REDIRECT,
          grant_type: 'authorization_code'
        })
      });
      const data = await r.json();
      if (data.access_token) {
        return res.json({ ok: true, platform: 'youtube', token_saved: true, has_refresh_token: !!data.refresh_token });
      }
      return res.json({ ok: false, platform: 'youtube', error: data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  if (state === 'tiktok') {
    try {
      const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: TK_KEY,
          client_secret: TK_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT
        })
      });
      const data = await r.json();
      if (data.access_token) {
        return res.json({ ok: true, platform: 'tiktok', token_saved: true, has_refresh_token: !!data.refresh_token });
      }
      return res.json({ ok: false, platform: 'tiktok', error: data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  return res.status(400).json({ ok: false, error: 'Unknown state: ' + state });
});

app.post('/publish', (req, res) => {
  res.json({ todo: 'upload to YouTube + TikTok - Phase 3' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log('Listening on ' + PORT));
}

module.exports = app;
