# YT Downloader — Chrome Extension + Node.js Server

A YouTube video downloader that works as a Chrome extension with a local Node.js backend powered by `yt-dlp`. Download videos in multiple formats (4K, 1080p, 720p, 480p, 360p) or audio-only, directly from your browser.

**Languages:** JavaScript (62%) | HTML (38%)

---

## Features

- **Chrome Extension** – Right-click download from YouTube videos
- **Local Backend** – Node.js server with yt-dlp integration
- **Multiple Formats** – 4K, 1080p, 720p, 480p, 360p, and audio-only
- **Fast Downloads** – Leverages ffmpeg for video/audio merging
- **Easy Setup** – Simple 4-step installation process
- **Customizable Output** – Change download folder path

---

## Project Structure

```
yt-downloader/
├── yt-downloader-extension/   ← Chrome extension files
│   ├── manifest.json          ← Extension configuration
│   ├── popup.html             ← UI interface
│   ├── popup.js               ← Popup logic
│   ├── content.js             ← Content script
│   ├── background.js          ← Background service worker
│   └── icons/                 ← Extension icons
│
├── yt-downloader-server/      ← Node.js backend
│   ├── server.js              ← Main server file
│   ├── package.json           ← Node.js dependencies
│   └── .env (optional)        ← Configuration
│
└── README.md                  ← This file
```

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) – [Download here](https://nodejs.org/)
- **Python 3.x** – [Download here](https://www.python.org/)
- **Chrome or Chromium browser**
- **Windows, macOS, or Linux**

---

## Setup Guide

### Step 1: Install yt-dlp

Install the yt-dlp package with all extras:

```powershell
pip install yt-dlp[default]
```

> `yt-dlp[default]` includes JS runtime, crypto support, and audio codecs.

### Step 2: Install FFmpeg

FFmpeg is required to merge video and audio streams into a single MP4:

```powershell
# Windows (using winget)
winget install ffmpeg

# macOS (using Homebrew)
brew install ffmpeg

# Linux (Debian/Ubuntu)
sudo apt-get install ffmpeg
```

**After installing ffmpeg, restart your terminal/PowerShell.**

### Step 3: Configure and Start the Server

1. **Locate yt-dlp path** (Windows):
   ```powershell
   Get-ChildItem -Path "$env:APPDATA\Python" -Recurse -Filter "yt-dlp.exe"
   ```

2. **Update server.js** with your yt-dlp path:
   ```javascript
   // Around line 10 in server.js
   const YTDLP = 'C:\\Users\\YourUsername\\AppData\\Roaming\\Python\\Scripts\\yt-dlp.exe';
   ```

3. **Start the Node.js server**:
   ```powershell
   cd yt-downloader-server
   node server.js
   ```

   You should see:
   ```
   ✓ yt-dlp 2026.x.x found
   ✓ Downloads → C:\Users\YourName\Downloads
   ✓ Server running at http://localhost:3456
   ```

   **Keep this terminal open while downloading.**

### Step 4: Load the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Toggle **Developer mode** ON (top-right corner)
3. Click **Load unpacked**
4. Select the `yt-downloader-extension` folder
5. The YT Downloader icon will appear in your toolbar

---

## How to Use

1. **Go to any YouTube video**: `https://www.youtube.com/watch?v=...`
2. **Click the YT Downloader extension icon** in your toolbar
3. **Select your preferred format**:
   - 4K (2160p)
   - 1080p (Full HD)
   - 720p (HD)
   - 480p
   - 360p
   - Audio only (MP3/M4A)
4. **Click Download**
5. **Find your file** in your Downloads folder (or custom folder)

---

## How Video Downloads Work

When you download a video, yt-dlp retrieves YouTube's separate video and audio streams:

```
Video Stream (f399.mp4) ┐
Audio Stream (f140.m4a) ┘ → [FFmpeg Merges] → Final_Video.mp4
```

The temporary files are automatically cleaned up after merging. This is normal behavior because YouTube streams video and audio separately.

---

## Customizing the Download Folder

By default, videos download to your `Downloads` folder. To change this:

**Edit `server.js` (around line 20):**

```javascript
// Default
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads');

// Custom path example:
const DOWNLOAD_DIR = 'D:\\Videos\\YouTube';
// or
const DOWNLOAD_DIR = '/home/username/Downloads/YouTube';
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Server off" in extension** | Ensure `node server.js` is running in your terminal |
| **yt-dlp not found** | Run `pip install yt-dlp[default]` and verify the path in `server.js` |
| **Video downloads two files** | This is normal! Temp files are merged and deleted automatically |
| **No MP4 file after download** | Install ffmpeg: `winget install ffmpeg` (then restart terminal) |
| **Extension not visible** | Reload the extension at `chrome://extensions` (refresh icon) |
| **Download stuck/slow** | Check terminal output for yt-dlp progress; may take time for large files |
| **CORS or connection errors** | Verify Node.js server is running and accessible at `http://localhost:3456` |
| **Permission denied errors** | Ensure the download folder has write permissions |

---

## Legal & Ethical Notice

 **Disclaimer**: Downloading YouTube videos may violate YouTube's Terms of Service (Section 5.1.J).

**Use this tool responsibly:**
- Download content you have rights to
- Use for personal, offline viewing only
- Respect copyright and creator rights
- Do NOT redistribute downloaded content
- Do NOT use for commercial purposes without permission

---

## Contributing

Found a bug? Have a feature request? Feel free to:
- Open an issue on GitHub
- Submit a pull request with improvements
- Share feedback and suggestions

---

## License

This project is open source. Please check the LICENSE file for details.

---

## Acknowledgments

- **yt-dlp** – Powerful YouTube downloader: https://github.com/yt-dlp/yt-dlp
- **FFmpeg** – Media processing: https://ffmpeg.org/
- **Node.js** – Server runtime: https://nodejs.org/

---

## Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review the terminal output for error messages
3. Verify all prerequisites are installed
4. Try restarting the Node.js server

**Happy downloading!**
