// backend/controllers/attendanceController.js
const db = require('../config/database');
const Student = require('../config/models/Student');

/**
 * POST /api/attendance/scan
 * 
 * Fungsi untuk mencatat kehadiran siswa berdasarkan QR code.
 * 
 * Request body:
 *   - qrCode: string (format: ABSEN-YYYY-MM-DD)
 *   - studentId: integer
 * 
 * Response:
 *   - 201: Absensi berhasil
 *   - 400: QR code tidak valid / sudah absen
 *   - 404: Siswa tidak ditemukan
 *   - 500: Error server
 */
const scanQR = async (req, res) => {
  const { qrCode, studentId } = req.body;

  // Validasi input
  if (!qrCode || !studentId) {
    return res.status(400).json({
      success: false,
      message: 'Data QR code dan ID siswa wajib diisi.'
    });
  }

  try {
    // Validasi format QR code: harus ABSEN-YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const expectedQR = `ABSEN-${today}`;
    if (qrCode !== expectedQR) {
      return res.status(400).json({
        success: false,
        message: `Kode QR tidak valid. Gunakan: ${expectedQR}`
      });
    }

    // Cek apakah siswa ada
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan.'
      });
    }

    // Cek apakah sudah absen hari ini
    const [existing] = await db.execute(
      'SELECT id FROM attendance_records WHERE student_id = ? AND DATE(date) = CURDATE()',
      [studentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah melakukan absensi hari ini.'
      });
    }

    // Simpan kehadiran
    await db.execute(
      'INSERT INTO attendance_records (student_id, date, status) VALUES (?, NOW(), ?)',
      [studentId, 'HADIR']
    );

    return res.status(201).json({
      success: true,
      message: 'Absensi berhasil!',
      data: {
        student: student.name,
        date: today,
        status: 'HADIR'
      }
    });

  } catch (error) {
    console.error('Error in scanQR:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal saat memproses absensi.'
    });
  }
};

/**
 * GET /api/attendance/history
 * 
 * Mengambil riwayat absensi siswa yang sedang login.
 * 
 * Membutuhkan middleware autentikasi (req.user.id tersedia).
 * 
 * Response:
 *   - 200: Daftar riwayat absensi
 *   - 500: Error server
 */
const getAttendanceHistory = async (req, res) => {
  const studentId = req.user.id; // Diasumsikan middleware auth sudah menyisipkan user

  try {
    // Ambil data dari attendance_records
    const [records] = await db.execute(`
      SELECT 
        DATE(date) as date,
        status
      FROM attendance_records
      WHERE student_id = ?
      ORDER BY date DESC
    `, [studentId]);

    return res.status(200).json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error('Error in getAttendanceHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat absensi.'
    });
  }
};

module.exports = {
  scanQR,
  getAttendanceHistory
};