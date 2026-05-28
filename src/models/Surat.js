const mongoose = require('mongoose');

const suratSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  uniqueId: { type: String, unique: true },
  nomor_surat: { type: String },
  nama_pemohon: { type: String, required: true },
  jenis_surat: { type: String, required: true },
  tanggal_surat: { type: String },
  isi_surat: { type: String, required: true },
  status_validasi: { 
    type: String, 
    enum: ['Pending', 'Valid', 'Rejected'],
    default: 'Pending'
  },
  validator_name: { type: String, default: '' },
  tanggal_validasi: { type: String, default: '' },
  catatan_validasi: { type: String, default: '' },
  qrCode: { type: String, default: '' },
  hash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Surat', suratSchema);