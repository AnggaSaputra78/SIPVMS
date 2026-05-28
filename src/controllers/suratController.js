const Surat = require('../models/Surat');
const crypto = require('crypto');

// Fungsi generate hash
function generateHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// CREATE SURAT - FUNGSI UTAMA
exports.createSurat = async (req, res) => {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 [CREATE] Request received di backend');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { nama_pemohon, jenis_surat, tanggal_surat, isi_surat } = req.body;
    
    // Validasi input
    if (!nama_pemohon || !jenis_surat || !isi_surat) {
      console.log('❌ Validasi gagal - field kosong');
      return res.status(400).json({
        success: false,
        message: 'Semua field (nama_pemohon, jenis_surat, isi_surat) wajib diisi'
      });
    }
    
    // Generate unique ID
    const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 8);
    console.log('🆔 Generated ID:', uniqueId);
    
    // Generate nomor surat otomatis
    const kodeSurat = {
      'Surat Izin': 'SI',
      'Surat Keterangan': 'SK',
      'Surat Pengantar': 'SP',
      'Surat Undangan': 'SU'
    };
    const kode = kodeSurat[jenis_surat] || 'SRT';
    const bulan = String(new Date().getMonth() + 1).padStart(2, '0');
    const tahun = new Date().getFullYear();
    
    // Hitung nomor urut
    let nomorUrut = 1;
    try {
      const count = await Surat.countDocuments({ jenis_surat: jenis_surat });
      nomorUrut = count + 1;
      console.log(`📊 Count surat ${jenis_surat}: ${count}, nomor urut: ${nomorUrut}`);
    } catch (err) {
      console.log('⚠️ Error counting, menggunakan default 1');
    }
    
    const nomor_surat = `${kode}/${String(nomorUrut).padStart(3, '0')}/${bulan}/${tahun}`;
    console.log('📄 Nomor surat:', nomor_surat);
    
    // Data surat
    const suratData = {
      id: uniqueId,
      uniqueId: uniqueId,
      nomor_surat: nomor_surat,
      nama_pemohon: nama_pemohon,
      jenis_surat: jenis_surat,
      tanggal_surat: tanggal_surat || new Date().toISOString().split('T')[0],
      isi_surat: isi_surat,
      status_validasi: 'Pending',
      validator_name: '',
      tanggal_validasi: '',
      catatan_validasi: '',
      qrCode: '',
      hash: ''
    };
    
    // Generate hash
    suratData.hash = generateHash(suratData);
    
    // Simpan ke MongoDB
    console.log('💾 Menyimpan ke MongoDB...');
    const surat = new Surat(suratData);
    const savedSurat = await surat.save();
    
    console.log('✅ SURAT BERHASIL DISIMPAN!');
    console.log('   MongoDB _id:', savedSurat._id);
    console.log('   Nomor surat:', savedSurat.nomor_surat);
    console.log('   Pemohon:', savedSurat.nama_pemohon);
    console.log('   Status:', savedSurat.status_validasi);
    console.log('═══════════════════════════════════════════════════════════');
    
    res.status(201).json({
      success: true,
      message: 'Surat berhasil dibuat',
      data: {
        id: uniqueId,
        nomor_surat: nomor_surat,
        status: 'Pending',
        verifyUrl: `/verify?id=${uniqueId}`
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR CREATE SURAT:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat surat',
      error: error.message
    });
  }
};

// GET ALL SURAT
exports.getAllSurat = async (req, res) => {
  try {
    const surats = await Surat.find().sort({ createdAt: -1 });
    console.log(`📋 Mengambil ${surats.length} surat dari database`);
    res.json({
      success: true,
      data: surats
    });
  } catch (error) {
    console.error('❌ Error GET ALL:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// VERIFY SURAT
exports.verifySurat = async (req, res) => {
  try {
    const { id } = req.query;
    console.log('🔍 Verifikasi ID:', id);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID tidak ditemukan',
        valid: false
      });
    }
    
    const surat = await Surat.findOne({ 
      $or: [{ uniqueId: id }, { id: id }] 
    });
    
    if (!surat) {
      console.log('❌ Surat tidak ditemukan');
      return res.json({
        success: false,
        message: 'TIDAK VALID',
        valid: false,
        reason: 'Surat tidak ditemukan dalam database'
      });
    }
    
    console.log('📄 Surat ditemukan:', surat.nomor_surat, 'Status:', surat.status_validasi);
    
    if (surat.status_validasi === 'Pending') {
      return res.json({
        success: true,
        valid: false,
        message: 'BELUM DIVALIDASI',
        data: surat
      });
    }
    
    if (surat.status_validasi === 'Valid') {
      return res.json({
        success: true,
        message: 'VALID',
        valid: true,
        data: surat
      });
    }
    
    if (surat.status_validasi === 'Rejected') {
      return res.json({
        success: false,
        valid: false,
        message: 'DITOLAK',
        reason: 'Surat ini telah ditolak oleh petugas'
      });
    }
    
    res.json({
      success: false,
      message: 'TIDAK VALID',
      valid: false
    });
    
  } catch (error) {
    console.error('❌ Error VERIFY:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan verifikasi',
      error: error.message
    });
  }
};

// UPDATE SURAT (untuk validasi)
exports.updateSurat = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('📝 Update surat ID:', id);
    console.log('📦 Data update:', updateData);
    
    const surat = await Surat.findOneAndUpdate(
      { $or: [{ uniqueId: id }, { id: id }] },
      updateData,
      { new: true }
    );
    
    if (!surat) {
      console.log('❌ Surat tidak ditemukan');
      return res.status(404).json({
        success: false,
        message: 'Surat tidak ditemukan'
      });
    }
    
    console.log('✅ Surat berhasil diupdate, status baru:', surat.status_validasi);
    res.json({
      success: true,
      message: 'Surat berhasil diupdate',
      data: surat
    });
  } catch (error) {
    console.error('❌ Error UPDATE:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE SURAT
exports.deleteSurat = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Hapus surat ID:', id);
    
    const surat = await Surat.findOneAndDelete({ 
      $or: [{ uniqueId: id }, { id: id }] 
    });
    
    if (!surat) {
      console.log('❌ Surat tidak ditemukan');
      return res.status(404).json({
        success: false,
        message: 'Surat tidak ditemukan'
      });
    }
    
    console.log('✅ Surat berhasil dihapus');
    res.json({
      success: true,
      message: 'Surat berhasil dihapus'
    });
  } catch (error) {
    console.error('❌ Error DELETE:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};