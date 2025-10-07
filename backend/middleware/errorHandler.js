// backend/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log lengkap ke konsol/server log
  console.error('=== ERROR LOG ===');
  console.error('Waktu:', new Date().toISOString());
  console.error('Pesan:', err.message);
  console.error('Stack:', err.stack);
  console.error('Path:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('IP:', req.ip);
  console.error('=================');

  // Klasifikasi jenis error
  let jenisError = 'Sistem';
  if (err.message?.includes('ECONNREFUSED') || err.message?.includes('database')) {
    jenisError = 'Database';
  } else if (err.stack?.includes('SyntaxError') || err.stack?.includes('ReferenceError')) {
    jenisError = 'Koding';
  }

  // Kirim respons ke frontend
  res.status(err.status || 500).json({
    success: false,
    error: {
      jenis: jenisError,
      pesan: err.message || 'Terjadi kesalahan internal',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      waktu: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  });
};

module.exports = errorHandler;