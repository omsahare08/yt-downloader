# YT Downloader — Chrome Extension + Node.js Server

A YouTube video downloader that works as a Chrome extension with a local Node.js backend powered by `yt-dlp`.

---

##  Project Structure

```
yt-downloader/
├── yt-downloader-extension/   ← Load this into Chrome
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   └── icons/
├── yt-downloader-server/      ← Run this with Node.js
│   ├── server.js
│   └── package.json
└── README.md
```

---

##  Setup

### Step 1 — Install yt-dlp

```powershell
pip install yt-dlp[default]  ✅
```

> `yt-dlp[default]` includes all extras like the JS runtime, crypto, and audio support.

You also need **ffmpeg** to merge video + audio into a single MP4:

```powershell
winget install ffmpeg  ✅
```

After installing ffmpeg, **restart PowerShell** so it's recognized.

---

### Step 2 — Update server.js with your yt-dlp path

Find where yt-dlp.exe is installed:

```powershell
Get-ChildItem -Path "$env:APPDATA\Python" -Recurse -Filter "yt-dlp.exe"
```

Open `server.js` and update the `YTDLP` path at the top to match your system.

---

### Step 3 — Start the local server

```powershell
cd yt-downloader-server ✅  
eg. cd "C:\Users\Om Sahare\Downloads\yt-downloader\yt-downloader-server"
node server.js ✅
```

You should see:
```
 yt-dlp 2026.x.x found
 Downloads → C:\Users\YourName\Downloads
 Server running at http://localhost:3456
```

Keep this terminal open while downloading.

---

### Step 4 — Load the Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Toggle **Developer mode** ON (top-right)
3. Click **Load unpacked**
4. Select the `yt-downloader-extension` folder

The extension icon will appear in your toolbar.

---

##  Usage

1. Go to any YouTube video: `https://www.youtube.com/watch?v=...`
2. Click the **YT Downloader** extension icon
3. Select your format (4K / 1080p / 720p / 480p / 360p / Audio only)
4. Hit **Download**
5. Check your **Downloads** folder!

---

## How Video Downloads Work

When downloading video (not audio-only), yt-dlp downloads **two separate files** — video-only and audio-only — then merges them into a single MP4 using ffmpeg. The temp files are deleted automatically. This is normal behavior because YouTube serves video and audio as separate streams.

```
f399.mp4  (video only)  ┐
f140.m4a  (audio only)  ┘ → merged → Final video.mp4 
```

---

## Customizing the Download Folder

Edit `server.js` line ~20:
```js
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads');
// Change to any path, e.g.:
// const DOWNLOAD_DIR = 'D:\\Videos\\YouTube';
```

---

##  Legal Note

Downloading YouTube videos may violate YouTube's Terms of Service (Section 5.1.J). Only download content you have rights to, for personal offline use. Do not redistribute downloaded content.

---

##  Troubleshooting

| Issue | Fix |
|-------|-----|
| "server off" in extension | Make sure `node server.js` is running in terminal |
| yt-dlp not found | Run `pip install yt-dlp[default]` and update the path in `server.js` |
| Video downloads two files then merges | This is normal! You get one final MP4 |
| Merge step missing / no MP4 | Install ffmpeg: `winget install ffmpeg` |
| Warning about JS runtime | Run `pip install yt-dlp[default]` — already includes the fix |
| Extension not showing | Reload it at `chrome://extensions` |
| Download stuck | Check the terminal for yt-dlp progress output |