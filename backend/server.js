const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const db = require('./firebaseConfig'); // جديد

const app = express();
const PORT = 4000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({ storage });


// ✅ API: Get products from Firebase
app.get('/api/products', (req, res) => {
  const ref = db.ref('all'); // assuming data is under "all"
  ref.once('value', snapshot => {
    const data = snapshot.val();
    const products = data ? Object.values(data) : [];
    res.json(products);
  }, err => {
    res.status(500).json({ error: 'Failed to fetch products' });
  });
});

// ✅ API: Save (overwrite) all products
app.post('/api/products', (req, res) => {
  const products = req.body;
  const ref = db.ref('all');
  ref.set(products, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save products' });
    }
    res.json({ success: true });
  });
});

// ✅ API: Upload photo
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoPath = `/uploads/${req.file.filename}`;
  res.json({ path: photoPath });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
