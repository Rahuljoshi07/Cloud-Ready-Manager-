const db = require('../db');

class Budget {
  static async findById(id) {
    const result = await db.query(
      `SELECT b.*, u.name as owner_name, u.email as owner_email
       FROM budgets b LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = `SELECT b.*, u.name as owner_name FROM budgets b LEFT JOIN users u ON b.user_id = u.id WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (filters.user_id) {
      sql += ` AND b.user_id = $${idx++}`;
      params.push(filters.user_id);
    }
    if (filters.subscription_id) {
      sql += ` AND b.subscription_id = $${idx++}`;
      params.push(filters.subscription_id);
    }

    sql += ' ORDER BY b.created_at DESC';
    const result = await db.query(sql, params);
    return result.rows;
  }

  static async create(data) {
    const { name, subscription_id, amount, period = 'monthly', threshold_percentage = 80, user_id } = data;
    const result = await db.query(
      `INSERT INTO budgets (name, subscription_id, amount, period, threshold_percentage, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, subscription_id, amount, period, threshold_percentage, user_id]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await db.query(
      `UPDATE budgets SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM budgets WHERE id = $1', [id]);
    return true;
  }

  static async updateSpend(id, current_spend) {
    const result = await db.query(
      'UPDATE budgets SET current_spend = $2 WHERE id = $1 RETURNING *',
      [id, current_spend]
    );
    return result.rows[0];
  }
}

module.exports = Budget;
