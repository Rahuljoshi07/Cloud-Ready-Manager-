const Resource = require('../models/Resource');

const getResources = async (req, res) => {
  try {
    const filters = {
      subscription_id: req.query.subscription_id,
      resource_group: req.query.resource_group,
      type: req.query.type,
      status: req.query.status,
    };
    const resources = await Resource.findAll(filters);
    res.json({ data: resources, count: resources.length });
  } catch (error) {
    console.error('getResources error:', error);
    res.status(500).json({ error: 'Failed to retrieve resources.' });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve resource.' });
  }
};

const createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource.' });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.update(req.params.id, req.body);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource.' });
  }
};

const deleteResource = async (req, res) => {
  try {
    await Resource.delete(req.params.id);
    res.json({ message: 'Resource deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource.' });
  }
};

const getResourceStats = async (req, res) => {
  try {
    const all = await Resource.findAll();
    const stats = {
      total: all.length,
      running: all.filter(r => r.status === 'running').length,
      stopped: all.filter(r => r.status === 'stopped').length,
      deallocated: all.filter(r => r.status === 'deallocated').length,
      idle: all.filter(r => r.status === 'running' && parseFloat(r.cpu_utilization) < 5).length,
      total_monthly_cost: all.reduce((sum, r) => sum + parseFloat(r.monthly_cost || 0), 0).toFixed(2),
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get resource stats.' });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourceStats,
};
