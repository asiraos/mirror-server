const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const UPLOAD_DIR = 'uploads';

// Increase timeouts and limits for large files
app.use((req, res, next) => {
  req.setTimeout(0);
  res.setTimeout(0);
  req.connection.setTimeout(0);
  next();
});

// Handle large payloads
app.use(express.raw({ limit: '50gb' }));
app.use(express.json({ limit: '50gb' }));
app.use(express.urlencoded({ limit: '50gb', extended: true }));

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder || '';
    const uploadPath = path.join(UPLOAD_DIR, folder);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB
});

app.use(express.static('public'));

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const iconMap = {
    'zip': 'archive', 'rar': 'archive', '7z': 'archive',
    'pdf': 'file-text', 'doc': 'file-text', 'docx': 'file-text', 'txt': 'file-text',
    'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'svg': 'image',
    'mp4': 'video', 'avi': 'video', 'mkv': 'video', 'mov': 'video',
    'mp3': 'music', 'wav': 'music', 'flac': 'music',
    'js': 'code', 'html': 'code', 'css': 'code', 'py': 'code', 'java': 'code',
    'exe': 'cpu', 'msi': 'cpu', 'deb': 'cpu', 'rpm': 'cpu'
  };
  return iconMap[ext] || 'file';
}

app.get('/', (req, res) => {
  const folder = req.query.folder || '';
  const currentPath = path.join(UPLOAD_DIR, folder);
  
  let files = [];
  if (fs.existsSync(currentPath)) {
    files = fs.readdirSync(currentPath).map(item => {
      const itemPath = path.join(currentPath, item);
      const relativePath = path.join(folder, item);
      const stats = fs.statSync(itemPath);
      
      let size = '';
      if (stats.isFile()) {
        const bytes = stats.size;
        if (bytes < 1024) size = bytes + ' B';
        else if (bytes < 1024 * 1024) size = (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1024 * 1024 * 1024) size = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        else size = (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
      }
      
      return {
        name: item,
        type: stats.isDirectory() ? 'folder' : 'file',
        path: relativePath,
        size: size,
        modified: stats.mtime.toLocaleDateString(),
        icon: stats.isDirectory() ? 'folder' : getFileIcon(item)
      };
    });
  }

  const parentFolder = path.dirname(folder);
  
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>🔥 FlameOS Mirror</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/feather-icons"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%);
      color: #fff; 
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      padding: 20px;
      background: rgba(255, 107, 53, 0.1);
      border-radius: 15px;
      border: 1px solid rgba(255, 107, 53, 0.3);
    }
    .header h1 { 
      font-size: 2.5em; 
      color: #ff6b35; 
      text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
      margin-bottom: 10px;
    }
    .path { 
      color: #ccc; 
      font-size: 1.1em;
      background: rgba(0,0,0,0.3);
      padding: 10px 20px;
      border-radius: 25px;
      display: inline-block;
    }
    .file-grid { 
      display: grid; 
      gap: 15px; 
      margin: 20px 0; 
    }
    .file-item { 
      background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
      border: 1px solid rgba(255, 107, 53, 0.2);
      border-radius: 12px; 
      padding: 20px; 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .file-item:hover { 
      background: linear-gradient(145deg, #3a3a3a, #2f2f2f);
      border-color: #ff6b35;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
    }
    .file-info { display: flex; align-items: center; flex: 1; }
    .file-icon { 
      margin-right: 15px; 
      color: #ff6b35;
      filter: drop-shadow(0 0 5px rgba(255, 107, 53, 0.3));
    }
    .file-details h3 { 
      color: #fff; 
      margin-bottom: 5px; 
      font-size: 1.1em;
    }
    .file-meta { 
      color: #888; 
      font-size: 0.9em; 
      display: flex; 
      gap: 15px;
      align-items: center;
    }
    .download-btn { 
      background: linear-gradient(45deg, #ff6b35, #ff8c42);
      color: white; 
      padding: 12px 24px; 
      border: none; 
      border-radius: 25px; 
      cursor: pointer; 
      font-weight: bold;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
    }
    .download-btn:hover { 
      background: linear-gradient(45deg, #ff8c42, #ff6b35);
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
    }
    .back-btn { 
      background: linear-gradient(45deg, #666, #888);
      color: white; 
      padding: 12px 24px; 
      border-radius: 25px; 
      text-decoration: none; 
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 20px 0;
      transition: all 0.3s ease;
    }
    .back-btn:hover { 
      background: linear-gradient(45deg, #888, #aaa);
      transform: scale(1.05);
    }
    .folder-link { 
      color: #ff6b35; 
      text-decoration: none; 
      font-weight: bold;
    }
    .folder-link:hover { 
      color: #ff8c42; 
      text-decoration: underline; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><i data-feather="zap"></i> FlameOS Mirror</h1>
      <div class="path"><i data-feather="folder"></i> /${folder || 'root'}</div>
    </div>
    
    <div class="file-grid">
      ${files.map(item => `
        <div class="file-item">
          <div class="file-info">
            <div class="file-icon">
              <i data-feather="${item.icon}" size="32"></i>
            </div>
            <div class="file-details">
              <h3>
                ${item.type === 'folder' ? 
                  `<a href="/?folder=${encodeURIComponent(item.path)}" class="folder-link">${item.name}</a>` :
                  item.name
                }
              </h3>
              <div class="file-meta">
                ${item.size ? `<span><i data-feather="hard-drive" size="14"></i> ${item.size}</span>` : ''}
                <span><i data-feather="calendar" size="14"></i> ${item.modified}</span>
              </div>
            </div>
          </div>
          ${item.type === 'file' ? 
            `<a href="/download/${encodeURIComponent(item.path)}" class="download-btn">
              <i data-feather="download" size="16"></i> Download
            </a>` : 
            ''
          }
        </div>
      `).join('')}
    </div>
    
    ${folder ? `<a href="/?folder=${encodeURIComponent(parentFolder)}" class="back-btn">
      <i data-feather="arrow-left" size="16"></i> Back
    </a>` : ''}
  </div>
  
  <script>
    feather.replace();
  </script>
</body>
</html>
  `);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ status: 'success', file: req.file.filename });
  } else {
    res.status(400).json({ status: 'error' });
  }
});

app.post('/api/upload/:folder(*)', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ status: 'success', file: req.file.filename, folder: req.params.folder });
  } else {
    res.status(400).json({ status: 'error' });
  }
});

app.get('/download/:path(*)', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.path);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.delete('/api/delete/:path(*)', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.path);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ status: 'error', message: 'File not found' });
  }
  
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
    res.json({ status: 'success', message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
});

const server = app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// Remove ALL timeouts
server.timeout = 0;
server.keepAliveTimeout = 0;
server.headersTimeout = 0;
server.requestTimeout = 0;
