const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const UPLOAD_DIR = 'uploads';

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

app.get('/', (req, res) => {
  const folder = req.query.folder || '';
  const currentPath = path.join(UPLOAD_DIR, folder);
  
  let files = [];
  if (fs.existsSync(currentPath)) {
    files = fs.readdirSync(currentPath).map(item => {
      const itemPath = path.join(currentPath, item);
      const relativePath = path.join(folder, item);
      const stats = fs.statSync(itemPath);
      return {
        name: item,
        type: stats.isDirectory() ? 'folder' : 'file',
        path: relativePath,
        size: stats.isFile() ? (stats.size / 1024 / 1024).toFixed(2) + ' MB' : ''
      };
    });
  }

  const parentFolder = path.dirname(folder);
  
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>FlameOS Mirror</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: #fff; }
    h1 { color: #ff6b35; }
    .file-list { margin: 20px 0; }
    .file-item { padding: 10px; margin: 5px 0; background: #2a2a2a; border-radius: 5px; display: flex; justify-content: space-between; }
    .file-item:hover { background: #3a3a3a; }
    a { color: #ff6b35; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .back-btn { background: #ff6b35; color: white; padding: 8px 16px; border-radius: 4px; margin: 10px 0; display: inline-block; }
    .size { color: #888; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>🔥 FlameOS Mirror</h1>
  <div class="file-list">
    ${files.map(item => `
      <div class="file-item">
        <div>
          ${item.type === 'folder' ? 
            `📁 <a href="/?folder=${encodeURIComponent(item.path)}">${item.name}</a>` :
            `📄 <a href="/download/${encodeURIComponent(item.path)}">${item.name}</a>`
          }
        </div>
        <div class="size">${item.size}</div>
      </div>
    `).join('')}
  </div>
  
  ${folder ? `<a href="/?folder=${encodeURIComponent(parentFolder)}" class="back-btn">← Back</a>` : ''}
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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
