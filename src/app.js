const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// ============ DEPENDENSI ============
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// =====================================

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000', 'http://sipvms.merak.web.id', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Static files
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ============ KONEKSI MONGODB ============
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://192.168.20.217:27017/suratDB';

console.log('═══════════════════════════════════════════════════════════');
console.log('🔄 Menghubungkan ke MongoDB...');
console.log(`📡 URL: ${MONGODB_URI}`);
console.log('═══════════════════════════════════════════════════════════');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
})
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📁 Database Name: ${mongoose.connection.name}`);
    console.log(`🔌 Host: ${mongoose.connection.host}`);
    console.log('═══════════════════════════════════════════════════════════');
    
    // Auto-seed default admin user saat server nyala
    await seedDefaultUser();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// ============ MODEL USER ============
const userSchema = new mongoose.Schema({
  username: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true },
  email:    { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  nama_lengkap: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'user', 'validator'], default: 'user' },
  created_at: { type: Date, default: Date.now }
});

userSchema.index({ username: 1, email: 1 });
const User = mongoose.model('User', userSchema);

// ============ MODEL SURAT ============
const suratSchema = new mongoose.Schema({
  nomor_surat: { type: String, required: true, index: true },
  jenis_surat: { type: String, required: true, index: true },
  nama_pemohon: { type: String, required: true, index: true },
  tanggal_surat: { type: Date, required: true },
  isi_surat: { type: String, required: true },
  status_validasi: { type: String, enum: ['Pending', 'Valid', 'Rejected'], default: 'Pending', index: true },
  catatan_validasi: { type: String, default: '' },
  tanggal_validasi: { type: Date },
  validator_name: { type: String, default: '' },
  metadata: { type: Map, of: String, default: {} },
  nik: { type: String, default: '', index: true },
  tempat_lahir: { type: String, default: '' },
  tgl_lahir: { type: Date },
  jenis_kelamin: { type: String, default: '' },
  pekerjaan: { type: String, default: '' },
  alamat: { type: String, default: '' },
  no_kk: { type: String, default: '' },
  keperluan: { type: String, default: '' },
  tempat_usaha: { type: String, default: '' },
  jenis_usaha: { type: String, default: '' },
  status_usaha: { type: String, default: '' },
  tahun_mulai_usaha: { type: String, default: '' },
  instansi_tujuan: { type: String, default: '' },
  perihal: { type: String, default: '' },
  sifat_surat: { type: String, default: '' },
  lampiran: { type: String, default: '' },
  isi_permohonan: { type: String, default: '' },
  lokasi_objek: { type: String, default: '' },
  alasan_dispensasi: { type: String, default: '' },
  tgl_mulai_dispensasi: { type: Date },
  tgl_selesai_dispensasi: { type: Date },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
});

suratSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});
const Surat = mongoose.model('Surat', suratSchema);

// ============ FUNGSI BUAT USER DEFAULT (PENTING!) ============
async function seedDefaultUser() {
  try {
    // Cek apakah user 'admin' sudah ada
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const adminUser = new User({
        username: 'admin',
        email: 'admin@sipvms.local',
        password: hashedPassword,
        nama_lengkap: 'Administrator',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ User default dibuat: Username: admin | Password: admin123');
    } else {
      console.log('ℹ️  User admin sudah ada.');
    }
  } catch (err) {
    console.error('❌ Error seed user:', err.message);
  }
}

// ============ MIDDLEWARE AUTH ============
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sipvms_super_secret_key_2024');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) throw new Error('User tidak ditemukan');
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
};

// ============ ROUTES AUTH ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, nama_lengkap } = req.body;
    if ((!username && !email) || !password) {
      return res.status(400).json({ success: false, message: 'Username/email dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    const existingUser = await User.findOne({ $or: [{ email: email?.toLowerCase() }, { username: username?.toLowerCase() }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username atau email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = { password: hashedPassword, nama_lengkap: nama_lengkap || '' };
    
    if (username) {
      userData.username = username.toLowerCase().trim();
      userData.email = email?.toLowerCase().trim() || `${username.toLowerCase().trim()}@sipvms.local`;
    } else if (email) {
      userData.email = email.toLowerCase().trim();
      userData.username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    }

    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json({ success: true, message: 'Registrasi berhasil' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!password || (!username && !email)) {
      return res.status(400).json({ success: false, message: 'Lengkapi data login' });
    }

    const searchValue = (username || email)?.toLowerCase().trim();
    const user = await User.findOne({ $or: [{ username: searchValue }, { email: searchValue }] });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Username/email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username/email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'sipvms_super_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: { id: user._id, username: user.username, email: user.email, nama_lengkap: user.nama_lengkap, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// ============ ROUTES SURAT ============
app.get('/api/surat/all', async (req, res) => {
  try {
    const surat = await Surat.find().sort({ created_at: -1 }).limit(1000);
    res.json({ success: true, data: surat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/surat/create', async (req, res) => {
  try {
    const { nomor_surat, jenis_surat, nama_pemohon, tanggal_surat, isi_surat, metadata, ...otherFields } = req.body;
    if (!nomor_surat || !jenis_surat || !nama_pemohon || !tanggal_surat) {
      return res.status(400).json({ success: false, message: 'Data wajib tidak lengkap' });
    }
    const newSurat = new Surat({ nomor_surat, jenis_surat, nama_pemohon, tanggal_surat, isi_surat, metadata, ...otherFields });
    await newSurat.save();
    res.json({ success: true, data: newSurat, message: 'Surat disimpan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/surat/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSurat = await Surat.findByIdAndUpdate(id, { ...req.body, updated_at: Date.now() }, { new: true });
    if (!updatedSurat) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    res.json({ success: true, data: updatedSurat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/surat/delete/:id', async (req, res) => {
  try {
    await Surat.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/surat/verify', async (req, res) => {
  try {
    const surat = await Surat.findById(req.query.id);
    if (!surat) return res.json({ success: false, valid: false, message: 'Tidak valid' });
    res.json({ success: true, valid: surat.status_validasi === 'Valid', data: surat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ SERVING FRONTEND ============
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'views', 'index.html');
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.send('File index.html tidak ditemukan di folder views/');
});

app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'verify.html')); // Pastikan file ini ada jika perlu
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 LOGIN DEFAULT: username=admin, password=admin123`);
});