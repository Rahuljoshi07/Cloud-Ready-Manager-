const db = require('../db');

class CostRecord {
  static async findById(id) {
    const result = await db.query('SELECT * FROM cost_records WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM cost_records WHERE 1=1';
    const params = [];
    let idx = 1;

    if (filters.subscription_id) {
      sql += ` AND subscription_id = $${idx++}`;
      params.push(filters.subscription_id);
    }
    if (filters.resource_group) {
      sql += ` AND resource_group = $${idx++}`;
      params.push(filters.resource_group);
    }
    if (filters.service_name) {
      sql += ` AND service_name = $${idx++}`;
      params.push(filters.service_name);
    }
    if (filters.start_date) {
      sql += ` AND usage_date >= $${idx++}`;
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      sql += ` AND usage_date <= $${idx++}`;
      params.push(filters.end_date);
    }

    sql += ' ORDER BY usage_date DESC';
    if (filters.limit) {
      sql += ` LIMIT $${idx++}`;
      params.push(filters.limit);
    }

    const result = await db.query(sql, params);
    return result.rows;
  }

  static async getDailyTrend(days = 30) {
    const result = await db.query(
      `SELECT usage_date, SUM(cost) as total_cost, COUNT(*) as record_count
       FROM cost_records
       WHERE usage_date >= NOW() - INTERVAL '${days} days'
       GROUP BY usage_date
       ORDER BY usage_date ASC`
    );
    return result.rows;
  }

  static async getCostByService(days = 30) {
    const result = await db.query(
      `SELECT service_name, SUM(cost) as total_cost
       FROM cost_records
       WHERE usage_date >= NOW() - INTERVAL '${days} days'
       GROUP BY service_name
       ORDER BY total_cost DESC`
    );
    return result.rows;
  }

  static async getCostByRegion(days = 30) {
    const result = await db.query(
      `SELECT region, SUM(cost) as total_cost
       FROM cost_records
       WHERE usage_date >= NOW() - INTERVAL '${days} days'
       GROUP BY region
       ORDER BY total_cost DESC`
    );
    return result.rows;
  }

  static async getTotalMonthly() {
    const result = await db.query(
      `SELECT SUM(cost) as total
       FROM cost_records
       WHERE DATE_TRUNC('month', usage_date) = DATE_TRUNC('month', NOW())`
    );
    return parseFloat(result.rows[0]?.total || 0);
  }

  static async create(data) {
    const { subscription_id, resource_group, service_name, region, cost, currency = 'USD', usage_date, tags } = data;
    const result = await db.query(
      `INSERT INTO cost_records (subscription_id, resource_group, service_name, region, cost, currency, usage_date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [subscription_id, resource_group, service_name, region, cost, currency, usage_date, tags ? JSON.stringify(tags) : null]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await db.query(
      `UPDATE cost_records SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM cost_records WHERE id = $1', [id]);
    return true;
  }
}

module.exports = CostRecord;
