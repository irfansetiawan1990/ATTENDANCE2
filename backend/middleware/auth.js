// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Ambil token dari header Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan.'
    });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user ke req untuk digunakan di controller
    next(); // Lanjutkan ke route berikutnya
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau telah kadaluarsa.'
    });
  }
};

module.exports = auth;