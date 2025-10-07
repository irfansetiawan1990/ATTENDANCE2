// backend/models/Student.js
const db = require('../database');

class Student {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, name, email FROM students WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Student;