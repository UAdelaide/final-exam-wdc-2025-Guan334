const express = require('express');
const router = express.Router();
const { pool: db } = require('../models/db'); // Use pool and alias as db

// 问题6：/api/dogs 路由
// 返回所有狗狗及其大小和主人用户名
router.get('/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.name AS dog_name,
             d.size,
             u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dogs:', err);
    res.status(500).json({ error: 'Failed to retrieve dogs' });
  }
});

// 问题7：/api/walkrequests/open 路由
// 返回所有处于 open 状态的遛狗请求
router.get('/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT wr.request_id,
             d.name AS dog_name,
             wr.requested_time,
             wr.duration_minutes,
             wr.location,
             u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching walk requests:', err);
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

// 问题8：/api/walkers/summary 路由
// 返回每个遛狗师的完成次数与平均评分摘要
router.get('/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.username AS walker_username,
             COUNT(r.rating_id)        AS total_ratings,
             AVG(r.rating)             AS average_rating,
             COUNT(r.request_id)       AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r
             ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id, u.username
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching walker summary:', err);
    res.status(500).json({ error: 'Failed to retrieve summary' });
  }
});

module.exports = router; 