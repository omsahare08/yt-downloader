/**
 * YT Downloader - Local Node.js Server
 * Runs on http://localhost:3456
 * Receives download requests from the Chrome extension and calls yt-dlp
 */

const http = require('http');
const { exec, execFile } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const PORT = 3456;
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads');

// ── Helper: send JSON response ───────────────────────────────────────────────
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(data));
}

// ── Helper: read request body ────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

// ── yt-dlp executable path ───────────────────────────────────────────────────
const YTDLP = 'C:\\Users\\Om Sahare\\AppData\\Roaming\\Python\\Python313\\Scripts\\yt-dlp.exe';

// ── Check yt-dlp is installed ────────────────────────────────────────────────
function checkYtDlp() {
  return new Promise((resolve) => {
    exec(`"${YTDLP}" --version`, (err, stdout) => {
      if (err) resolve(null);
      else resolve(stdout.trim());
    });
  });
}

// ── Build yt-dlp format string ───────────────────────────────────────────────
function buildFormatArg(format, audioOnly) {
  if (audioOnly || format === 'audio') {
    return '-x --audio-format mp3 --audio-quality 0';
  }

  const resMap = {
    '2160p': 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best',
    '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best',
    '720p':  'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best',
    '480p':  'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best',
    '360p':  'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=360]+bestaudio/best',
  };

  const fmt = resMap[format] || resMap['1080p'];
  return `-f "${fmt}" --merge-output-format mp4`;
}

// ── Perform download ─────────────────────────────────────────────────────────
function downloadVideo({ url, format, audioOnly }) {
  return new Promise((resolve, reject) => {
    const formatArg = buildFormatArg(format, audioOnly);
    const outputTemplate = path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s');

    const cmd = `"${YTDLP}" ${formatArg} --no-playlist --output "${outputTemplate}" "${url}"`;

    console.log(`\n▶ Starting download:`);
    console.log(`  URL: ${url}`);
    console.log(`  Format: ${format} | AudioOnly: ${audioOnly}`);
    console.log(`  CMD: ${cmd}\n`);

    const proc = exec(cmd, { timeout: 10 * 60 * 1000 }); // 10 min timeout

    proc.stdout.on('data', data => process.stdout.write(data));
    proc.stderr.on('data', data => process.stderr.write(data));

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, message: 'Download complete!' });
      } else {
        reject(new Error(`yt-dlp exited with code ${code}. Check the terminal for details.`));
      }
    });

    proc.on('error', reject);
  });
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    return res.end();
  }

  // GET /ping — health check
  if (req.method === 'GET' && req.url === '/ping') {
    return sendJSON(res, 200, { status: 'ok', version: '1.0.0' });
  }

  // POST /download — trigger a download
  if (req.method === 'POST' && req.url === '/download') {
    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Bad request body' });
    }

    const { url, format = '1080p', audioOnly = false } = body;

    if (!url || !url.includes('youtube.com')) {
      return sendJSON(res, 400, { success: false, error: 'Invalid YouTube URL' });
    }

    // Fire download in background so we can respond immediately
    sendJSON(res, 200, { success: true, message: 'Download queued! Check your terminal.' });

    downloadVideo({ url, format, audioOnly }).catch(err => {
      console.error('Download error:', err.message);
    });

    return;
  }

  // 404
  sendJSON(res, 404, { success: false, error: 'Not found' });
});

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  console.log('\n YT Downloader Server\n' + '─'.repeat(40));

  // Check yt-dlp
  const ytDlpVersion = await checkYtDlp();
  if (!ytDlpVersion) {
    console.error(' yt-dlp not found!\n');
    console.error('Install it first:');
    console.error('  macOS:   brew install yt-dlp');
    console.error('  Linux:   sudo apt install yt-dlp  OR  pip install yt-dlp');
    console.error('  Windows: winget install yt-dlp   OR  pip install yt-dlp\n');
    process.exit(1);
  }

  console.log(` yt-dlp ${ytDlpVersion} found`);
  console.log(` Downloads → ${DOWNLOAD_DIR}`);

  server.listen(PORT, '127.0.0.1', () => {
    console.log(` Server running at http://localhost:${PORT}`);
    console.log(`   Load the Chrome extension and visit a YouTube video!\n`);
  });
}

start();
