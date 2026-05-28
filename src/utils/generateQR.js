const QRCode = require('qrcode');
const path = require('path');
const crypto = require('crypto');

// Fungsi generate hash SHA256
function generateHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Fungsi generate QR Code
async function generateQRCode(uniqueId, baseUrl) {
  const verifyUrl = `${baseUrl}/verify?id=${uniqueId}`;
  const qrPath = path.join(__dirname, '../../public/uploads', `${uniqueId}.png`);
  
  await QRCode.toFile(qrPath, verifyUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  return {
    url: verifyUrl,
    filePath: qrPath,
    webPath: `/public/uploads/${uniqueId}.png`
  };
}

module.exports = { generateHash, generateQRCode };