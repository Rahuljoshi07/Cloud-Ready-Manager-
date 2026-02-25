const db = require('../db');

class Alert {
  static async findById(id) {
    const result = await db.query('SELECT * FROM alerts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    let idx = 1;

    if (filters.is_resolved !== undefined) {
      sql += ` AND is_resolved = $${idx++}`;
      params.push(filters.is_resolved);
    }
    if (filters.severity) {
      sql += ` AND severity = $${idx++}`;
      params.push(filters.severity);
    }
    if (filters.subscription_id) {
      sql += ` AND subscription_id = $${idx++}`;
      params.push(filters.subscription_id);
    }

    sql += ' ORDER BY created_at DESC';
    if (filters.limit) {
      sql += ` LIMIT $${idx++}`;
      params.push(filters.limit);
    }

    const result = await db.query(sql, params);
    return result.rows;
  }

  static async countActive() {
    const result = await db.query('SELECT COUNT(*) FROM alerts WHERE is_resolved = false');
    return parseInt(result.rows[0].count || 0);
  }

  static async create(data) {
    const { type, severity, message, resource_id, subscription_id } = data;
    const result = await db.query(
      `INSERT INTO alerts (type, severity, message, resource_id, subscription_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [type, severity, message, resource_id, subscription_id]
    );
    return result.rows[0];
  }

  static async resolve(id) {
    const result = await db.query(
      `UPDATE alerts SET is_resolved = true, resolved_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await db.query(
      `UPDATE alerts SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM alerts WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Alert;
