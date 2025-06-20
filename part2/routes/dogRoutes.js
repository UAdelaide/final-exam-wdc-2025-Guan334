const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /api/dogs - 返回所有狗狗的列表，包含其大小和主人用户名
router.get('/', async (req, res) => {
  try {
    // 联结 Dogs 表和 Users 表，以获取每只狗的主人名
    const [rows] = await db.query(
      `SELECT d.dog_id, d.name, d.size, u.username AS owner_username
       FROM Dogs d
       JOIN Users u ON d.owner_id = u.user_id`
    );
    // 以 JSON 格式返回结果
    res.json(rows);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

module.exports = router; 