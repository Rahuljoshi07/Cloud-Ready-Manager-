const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const DEMO_USERS = [
  {
    id: 'user-001',
    email: 'admin@company.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    name: 'Admin User',
    role: 'admin',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'user-002',
    email: 'viewer@company.com',
    password_hash: bcrypt.hashSync('viewer123', 10),
    name: 'Viewer User',
    role: 'viewer',
    created_at: new Date('2024-01-15').toISOString()
  }
];

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }
    const existing = DEMO_USERS.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password_hash,
      name,
      role: role || 'viewer',
      created_at: new Date().toISOString()
    };
    DEMO_USERS.push(newUser);
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'azure_cost_monitor_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = DEMO_USERS.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'azure_cost_monitor_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const logout = (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
};

const getProfile = (req, res) => {
  const user = DEMO_USERS.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at }
  });
};

module.exports = { register, login, logout, getProfile };
