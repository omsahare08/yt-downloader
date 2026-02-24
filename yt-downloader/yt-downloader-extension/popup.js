const SERVER = 'http://localhost:3456';

let selectedFormat = '1080p';
let audioOnly = false;
let videoInfo = null;
let isYouTube = false;

const formats = [
  { label: '4K', ext: 'mp4', value: '2160p' },
  { label: '1080p', ext: 'mp4', value: '1080p' },
  { label: '720p', ext: 'mp4', value: '720p' },
  { label: '480p', ext: 'mp4', value: '480p' },
  { label: '360p', ext: 'mp4', value: '360p' },
  { label: 'MP3', ext: 'audio', value: 'audio' },
];

async function checkServer() {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  try {
    const res = await fetch(`${SERVER}/ping`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      dot.className = 'status-dot online';
      txt.textContent = 'server on';
      return true;
    }
  } catch {}
  dot.className = 'status-dot offline';
  txt.textContent = 'server off';
  return false;
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function parseYouTubeUrl(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('youtube.com')) return null;
    const v = u.searchParams.get('v');
    return v || null;
  } catch { return null; }
}

function renderNotYouTube() {
  document.getElementById('mainContent').innerHTML = `
    <div class="not-youtube">
      <div class="icon">📺</div>
      <h2>Open a YouTube video</h2>
      <p>Navigate to a YouTube video page, then click this extension to download it.</p>
    </div>
  `;
}

function renderVideoUI(info) {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="video-info">
      <div class="thumbnail-wrap">
        <img id="thumb" src="${info.thumbnail}" alt="thumbnail" onerror="this.style.display='none'">
        <div class="thumbnail-overlay"></div>
        <div class="duration-badge" id="durBadge">${info.duration || ''}</div>
      </div>
      <div class="video-meta">
        <div class="video-title">${escHtml(info.title)}</div>
        <div class="video-channel">${escHtml(info.channel || '')}</div>
      </div>
    </div>

    <div class="section-label">Select Format</div>
    <div class="format-grid" id="formatGrid">
      ${formats.filter(f => f.value !== 'audio').map(f => `
        <button class="format-btn ${f.value === selectedFormat ? 'active' : ''}" data-value="${f.value}">
          <span class="res">${f.label}</span>
          <span class="ext">${f.ext}</span>
        </button>
      `).join('')}
    </div>

    <div class="audio-option ${audioOnly ? 'active' : ''}" id="audioOption">
      <div class="audio-left">
        <span class="icon">🎵</span>
        <div>
          <div class="label">Audio Only</div>
          <div class="sub">MP3 · best quality</div>
        </div>
      </div>
      <div class="check">${audioOnly ? '✓' : ''}</div>
    </div>

    <button class="download-btn" id="downloadBtn">
      <span>⬇</span> Download
    </button>

    <div class="progress-wrap" id="progressWrap">
      <div class="progress-bar"><div class="progress-fill indeterminate" id="progressFill"></div></div>
      <div class="progress-text" id="progressText">Starting download...</div>
    </div>

    <div class="message" id="messageBox"></div>

    <div class="server-hint" id="serverHint"></div>
  `;

  // Format selection
  document.getElementById('formatGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.format-btn');
    if (!btn) return;
    selectedFormat = btn.dataset.value;
    audioOnly = false;
    document.querySelectorAll('.format-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('audioOption').classList.remove('active');
    document.getElementById('audioOption').querySelector('.check').textContent = '';
  });

  // Audio toggle
  document.getElementById('audioOption').addEventListener('click', () => {
    audioOnly = !audioOnly;
    const el = document.getElementById('audioOption');
    el.classList.toggle('active', audioOnly);
    el.querySelector('.check').textContent = audioOnly ? '✓' : '';
    if (audioOnly) {
      document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
      selectedFormat = null;
    } else {
      selectedFormat = '1080p';
      document.querySelector('.format-btn[data-value="1080p"]')?.classList.add('active');
    }
  });

  document.getElementById('downloadBtn').addEventListener('click', startDownload);
}

async function startDownload() {
  const btn = document.getElementById('downloadBtn');
  const progressWrap = document.getElementById('progressWrap');
  const progressText = document.getElementById('progressText');
  const msgBox = document.getElementById('messageBox');
  const serverHint = document.getElementById('serverHint');

  btn.disabled = true;
  progressWrap.classList.add('visible');
  msgBox.className = 'message';
  serverHint.className = 'server-hint';

  const tab = await getCurrentTab();
  const serverOnline = await checkServer();

  if (!serverOnline) {
    btn.disabled = false;
    progressWrap.classList.remove('visible');
    serverHint.innerHTML = `<strong>⚠ Local server not running</strong>Run this in your terminal:<br><code>cd yt-downloader-server && node server.js</code>`;
    serverHint.classList.add('visible');
    return;
  }

  progressText.textContent = 'Sending to server...';

  try {
    const body = {
      url: tab.url,
      format: audioOnly ? 'audio' : selectedFormat,
      audioOnly
    };

    const res = await fetch(`${SERVER}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      progressWrap.classList.remove('visible');
      showMessage('success', `✓ Download started! Check your Downloads folder.`);
    } else {
      throw new Error(data.error || 'Download failed');
    }
  } catch (err) {
    progressWrap.classList.remove('visible');
    showMessage('error', `✗ ${err.message}`);
  }

  btn.disabled = false;
}

function showMessage(type, text) {
  const el = document.getElementById('messageBox');
  el.className = `message ${type} visible`;
  el.textContent = text;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function init() {
  checkServer();

  const tab = await getCurrentTab();
  const videoId = parseYouTubeUrl(tab?.url || '');

  if (!videoId) {
    renderNotYouTube();
    return;
  }

  // Try to get video info from content script or fallback to basic info
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title')?.textContent?.trim()
          || document.title.replace(' - YouTube', '');
        const channel = document.querySelector('#channel-name a, ytd-channel-name a')?.textContent?.trim() || '';
        const thumbnail = `https://img.youtube.com/vi/${new URL(location.href).searchParams.get('v')}/maxresdefault.jpg`;
        return { title, channel, thumbnail };
      }
    });

    videoInfo = result.result;
    videoInfo.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    renderVideoUI(videoInfo);
  } catch {
    videoInfo = {
      title: 'YouTube Video',
      channel: '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
    renderVideoUI(videoInfo);
  }
}

init();
