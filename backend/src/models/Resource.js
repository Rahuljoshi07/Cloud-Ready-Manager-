const db = require('../db');

class Resource {
  static async findById(id) {
    const result = await db.query('SELECT * FROM resources WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByResourceId(resourceId) {
    const result = await db.query('SELECT * FROM resources WHERE resource_id = $1', [resourceId]);
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM resources WHERE 1=1';
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
    if (filters.type) {
      sql += ` AND type = $${idx++}`;
      params.push(filters.type);
    }
    if (filters.status) {
      sql += ` AND status = $${idx++}`;
      params.push(filters.status);
    }

    sql += ' ORDER BY monthly_cost DESC';
    const result = await db.query(sql, params);
    return result.rows;
  }

  static async countActive() {
    const result = await db.query("SELECT COUNT(*) FROM resources WHERE status = 'running'");
    return parseInt(result.rows[0].count || 0);
  }

  static async create(data) {
    const { resource_id, name, type, resource_group, subscription_id, region, status, cpu_utilization, memory_utilization, monthly_cost, tags } = data;
    const result = await db.query(
      `INSERT INTO resources (resource_id, name, type, resource_group, subscription_id, region, status, cpu_utilization, memory_utilization, monthly_cost, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (resource_id) DO UPDATE SET
         name=EXCLUDED.name, status=EXCLUDED.status,
         cpu_utilization=EXCLUDED.cpu_utilization,
         memory_utilization=EXCLUDED.memory_utilization,
         monthly_cost=EXCLUDED.monthly_cost,
         updated_at=NOW()
       RETURNING *`,
      [resource_id, name, type, resource_group, subscription_id, region, status, cpu_utilization, memory_utilization, monthly_cost, tags ? JSON.stringify(tags) : null]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await db.query(
      `UPDATE resources SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM resources WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Resource;
