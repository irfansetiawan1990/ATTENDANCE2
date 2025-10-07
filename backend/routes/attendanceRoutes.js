// backend/routes/attendanceRoutes.js
const express = require('express');
const { scanQR, getAttendanceHistory } = require('../controllers/attendanceController');
const auth = require('../middleware/auth'); // Middleware untuk verifikasi JWT

const router = express.Router();

/**
 * @route   POST /api/attendance/scan
 * @desc    Mencatat kehadiran siswa berdasarkan QR code
 * @access  Public (opsional: bisa dilindungi auth jika diinginkan)
 */
router.post('/scan', scanQR);

/**
 * @route   GET /api/attendance/history
 * @desc    Mengambil riwayat absensi siswa yang sedang login
 * @access  Private (harus login)
 */
router.get('/history', auth, getAttendanceHistory);

module.exports = router;