const mongoose = require('mongoose');

const suratSchema = new mongoose.Schema({
  // Data surat
  nama: {
    type: String,
    required: true
  },
  nik: {
    type: String,
    required: true
  },
  jenisSurat: {
    type: String,
    required: true,
    enum: ['SKTM', 'SKCK', 'Surat Keterangan Domisili']
  },
  alamat: String,
  keperluan: String,
  
  // QR Code & Keamanan
  qrCode: String, // Path file QR
  hash: String,   // SHA256 hash
  uniqueId: {
    type: String,
    unique: true
  },
  
  // Status verifikasi
  verified: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Surat', suratSchema);