// backend/controllers/authController.js
const Student = require('../config/models/Student'); // Pastikan path benar: ../models/Student
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // ✅ Tambahkan ini

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    // ✅ Verifikasi password dengan bcrypt
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });
  } catch (err) {
    next(err); // Kirim ke error handler middleware
  }
};

module.exports = { login };