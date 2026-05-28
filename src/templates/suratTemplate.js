function generateSuratHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Surat Keterangan</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          padding: 40px;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #000;
          padding: 30px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .header h2 {
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .garis {
          border-top: 2px solid black;
          margin: 10px 0;
        }
        
        .sub-garis {
          border-top: 1px solid black;
          margin: 5px 0;
        }
        
        .content {
          margin: 30px 0;
        }
        
        .content p {
          margin: 15px 0;
          line-height: 1.5;
          font-size: 16px;
        }
        
        .data-table {
          width: 100%;
          margin: 20px 0;
        }
        
        .data-table td {
          padding: 8px 0;
          font-size: 16px;
        }
        
        .data-table td:first-child {
          width: 150px;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
        }
        
        .ttd {
          margin-top: 30px;
          text-align: right;
        }
        
        .ttd p {
          margin: 5px 0;
        }
        
        .qrcode {
          text-align: center;
          margin-top: 30px;
        }
        
        .hash {
          font-size: 10px;
          text-align: center;
          margin-top: 20px;
          color: #666;
          word-break: break-all;
        }
        
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PEMERINTAH KABUPATEN CONTOH</h1>
          <h2>KECAMATAN PILOT PROJECT</h2>
          <h3>DESA DIGITAL</h3>
          <div class="garis"></div>
          <div class="sub-garis"></div>
        </div>
        
        <div class="content">
          <h3 style="text-align: center; text-decoration: underline;">
            SURAT KETERANGAN
          </h3>
          <p style="text-align: center;">
            Nomor: 470/${data.uniqueId}/2024
          </p>
          
          <p>Yang bertanda tangan di bawah ini, Kepala Desa Digital, dengan ini menerangkan bahwa:</p>
          
          <table class="data-table">
            <tr>
              <td>Nama Lengkap</td>
              <td>: ${data.nama}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td>: ${data.nik}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td>: ${data.alamat || '-'}</td>
            </tr>
            <tr>
              <td>Jenis Surat</td>
              <td>: ${data.jenisSurat}</td>
            </tr>
            <tr>
              <td>Keperluan</td>
              <td>: ${data.keperluan || '-'}</td>
            </tr>
          </table>
          
          <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
        </div>
        
        <div class="footer">
          <div class="ttd">
            <p>Desa Digital, ${new Date().toLocaleDateString('id-ID')}</p>
            <p style="margin-top: 50px;">Kepala Desa Digital</p>
            <p style="margin-top: 50px; text-decoration: underline;"><strong>Budi Santoso</strong></p>
            <p>NIP. 196501011990011001</p>
          </div>
          
          <div class="qrcode">
            <img src="${data.qrCodePath}" width="150" height="150" alt="QR Code">
            <p>Scan QR Code untuk verifikasi keaslian surat</p>
          </div>
          
          <div class="hash">
            <strong>Hash SHA256:</strong><br>
            ${data.hash}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = generateSuratHTML;