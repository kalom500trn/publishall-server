const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('PublishAll server is LIVE'));
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('/auth/youtube', (req, res) => res.json({ todo: 'exchange code for YouTube token - Phase 2' }));
app.get('/auth/tiktok', (req, res) => res.json({ todo: 'exchange code for TikTok token - Phase 2' }));
app.post('/publish', (req, res) => res.json({ todo: 'upload to YouTube + TikTok - Phase 3' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening on ' + PORT));
