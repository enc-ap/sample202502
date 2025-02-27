// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// DB接続
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// [A] ヘルスチェック用API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// [B] 書誌登録 (Create)
app.post('/api/biblios', async (req, res) => {
  const { isbn, title, publisher } = req.body;
  try {
    // ISBN13桁かどうか簡易チェック(省略可)
    if (!/^\d{13}$/.test(isbn)) {
      return res.status(400).json({ error: 'Invalid ISBN format (must be 13 digits)' });
    }

    const result = await pool.query(
      `INSERT INTO biblios (isbn, title, publisher)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [isbn, title, publisher]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Duplicate ISBN' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// [C] 書誌検索 (Read by title)
app.get('/api/biblios/search', async (req, res) => {
  const { q } = req.query; // ?q=... でタイトル部分一致検索
  try {
    let result;
    if (!q || q.trim() === '') {
      // 全件取得
      result = await pool.query(`SELECT * FROM biblios`);
    } else {
      // タイトルにqを含むレコード
      result = await pool.query(
        `SELECT * FROM biblios
         WHERE title ILIKE $1`,
        [`%${q}%`]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// [D] 書誌更新 (Update)
app.put('/api/biblios/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const { title, publisher } = req.body;
  try {
    const result = await pool.query(
      `UPDATE biblios
       SET title = $1, publisher = $2
       WHERE isbn = $3
       RETURNING *`,
      [title, publisher, isbn]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// [E] 書誌削除 (Delete)
app.delete('/api/biblios/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const result = await pool.query(`DELETE FROM biblios WHERE isbn = $1`, [isbn]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// (F) サーバ起動
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});