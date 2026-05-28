const express = require('express');
const router = express.Router();
const { 
  createSurat, 
  verifySurat, 
  getAllSurat, 
  updateSurat, 
  deleteSurat 
} = require('../controllers/suratController');

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 Loading suratRoutes...');
console.log('📦 createSurat:', typeof createSurat === 'function' ? '✅ OK' : '❌ ERROR');
console.log('🔍 verifySurat:', typeof verifySurat === 'function' ? '✅ OK' : '❌ ERROR');
console.log('📦 getAllSurat:', typeof getAllSurat === 'function' ? '✅ OK' : '❌ ERROR');
console.log('📦 updateSurat:', typeof updateSurat === 'function' ? '✅ OK' : '❌ ERROR');
console.log('📦 deleteSurat:', typeof deleteSurat === 'function' ? '✅ OK' : '❌ ERROR');
console.log('═══════════════════════════════════════════════════════════');

// Endpoints
router.post('/surat/create', createSurat);
router.get('/surat/verify', verifySurat);
router.get('/surat/all', getAllSurat);
router.put('/surat/update/:id', updateSurat);
router.delete('/surat/delete/:id', deleteSurat);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      create: 'POST /api/surat/create',
      verify: 'GET /api/surat/verify?id=...',
      all: 'GET /api/surat/all',
      update: 'PUT /api/surat/update/:id',
      delete: 'DELETE /api/surat/delete/:id'
    }
  });
});

module.exports = router;