const db = require('../db');

class Recommendation {
  static async findById(id) {
    const result = await db.query('SELECT * FROM recommendations WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM recommendations WHERE 1=1';
    const params = [];
    let idx = 1;

    if (filters.status) {
      sql += ` AND status = $${idx++}`;
      params.push(filters.status);
    }
    if (filters.type) {
      sql += ` AND type = $${idx++}`;
      params.push(filters.type);
    }

    sql += ' ORDER BY potential_savings DESC';
    const result = await db.query(sql, params);
    return result.rows;
  }

  static async getTotalSavings() {
    const result = await db.query(
      "SELECT SUM(potential_savings) as total FROM recommendations WHERE status = 'pending'"
    );
    return parseFloat(result.rows[0]?.total || 0);
  }

  static async create(data) {
    const { type, resource_id, resource_name, description, potential_savings, action, status = 'pending' } = data;
    const result = await db.query(
      `INSERT INTO recommendations (type, resource_id, resource_name, description, potential_savings, action, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [type, resource_id, resource_name, description, potential_savings, action, status]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await db.query(
      `UPDATE recommendations SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM recommendations WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Recommendation;
