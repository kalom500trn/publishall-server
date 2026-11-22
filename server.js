const 【entity-express¦canonical_name=express】 = require('【entity-express¦canonical_name=express】');
const cors = require('cors');
require('dotenv').config();
const app = 【entity-express¦canonical_name=express】();
app.use(cors());
app.use(【entity-express¦canonical_name=express】.json());
app.use(【entity-express¦canonical_name=express】.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('PublishAll server is LIVE'));
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const YT_ID = process.env.YOUTUBE_CLIENT_ID;
const YT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const TK_KEY = process.env.TIKTOK_CLIENT_KEY;
const TK_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT = process.env.REDIRECT_URI || 'https://publishall-server-npan.vercel.app/auth/callback';

// STEP 1: Send user to Google to Allow
app.get('/auth/youtube', (req, res) => {
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + YT_ID +
    '&redirect_uri=' + encodeURIComponent(REDIRECT) +
    '&response_type=code&scope=' + encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly') +
    '&access_type=offline&prompt=consent&state=youtube';
  res.redirect(url);
});

// STEP 2: Google sends back ?code= -> exchange for token
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No code - go to /auth/youtube or /auth/tiktok first');
  try {
    if (state === 'youtube' || !state || state === 'publishall-tiktok' === false) {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: YT_ID, client_secret: YT_SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code' })
      });
      const data = await r.json();
      if (data.access_token) return res.json({ ok: true, platform: 'youtube', token_saved: true, refresh_token: !!data.refresh_token, expires_in: data.expires_in });
      return res.json({ ok: false, platform: 'youtube', error: data });
    }
    return res.json({ ok: true, code_received: true, state });
  } catch (e) { return res.status(500).json({ ok: false, error: String(e) }); }
});

// TikTok: send user to TikTok to Allow
app.get('/auth/tiktok', (req, res) => {
  const url = 'https://www.tiktok.com/v2/auth/authorize/?client_key=' + TK_KEY +
    '&redirect_uri=' + encodeURIComponent(REDIRECT) +
    '&response_type=code&scope=' + encodeURIComponent('user.info.basic,video.publish,video.upload') +
    '&state=publishall-tiktok';
  res.redirect(url);
});

app.get('/auth/tiktok/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No TikTok code');
  try {
    const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_key: TK_KEY, client_secret: TK_SECRET, code, grant_type: 'authorization_code', redirect_uri: REDIRECT })
    });
    const data = await r.json();
    return res.json({ ok: true, platform: 'tiktok', data });
  } catch (e) { return res.status(500).json({ ok: false, error: String(e) }); }
});

app.post('/publish', (req, res) => res.json({ todo: 'upload to YouTube + TikTok - Phase 3, coming next' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening on ' + PORT));
module.exports = app;
