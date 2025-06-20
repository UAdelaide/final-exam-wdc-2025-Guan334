const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store basic user info in the session
    req.session.user = rows[0];

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 新增的登出路由
// POST /logout - 销毁会话并清理 cookie
router.post('/logout', (req, res) => {
  // 调用 req.session.destroy() 来销毁当前会话
  req.session.destroy(err => {
    // 如果销毁过程中出现错误，返回 500 服务器错误
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    // 成功销毁会话后，清除客户端的会话 cookie
    res.clearCookie('connect.sid');
    // 返回成功消息
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /mydogs - 返回当前登录用户拥有的狗狗
router.get('/mydogs', async (req, res) => {
  // 检查 session 中是否存在用户信息，如果不存在则表示未登录
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    // 使用 session 中的 user_id 查询数据库，获取该用户的所有狗狗
    const [rows] = await db.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [req.session.user.user_id]
    );
    // 以 JSON 格式返回查询到的狗狗列表
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch dogs:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

module.exports = router;