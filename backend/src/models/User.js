const db = require('../db');

class User {
  static async findById(id) {
    const result = await db.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findAll() {
    const result = await db.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async create({ email, password_hash, name, role = 'viewer' }) {
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, password_hash, name, role]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await db.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING id, email, name, role`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }
}

module.exports = User;
