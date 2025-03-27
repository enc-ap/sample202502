// backend/src/app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ---------------- 変更点(1) PostgreSQL用のpgモジュールを削除し、MySQL用モジュールを追加 ----------------
// const { Pool } = require('pg');
const mysql = require('mysql2/promise'); // CHANGED: mysql2/promise で非同期操作

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- 変更点(2) pgのPoolからmysql2/promiseのcreatePoolへ切り替え ----------------
const pool = mysql.createPool({
  user: process.env.DB_USER,      // ex) 'admin'
  host: process.env.DB_HOST,      // ex) 'xxxxxx.ap-northeast-1.rds.amazonaws.com'
  database: process.env.DB_NAME,  // ex) 'mydbname'
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
});

// [A] ヘルスチェック用API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// [B] 書誌登録 (Create)
app.post('/api/biblios', async (req, res) => {
  const { isbn, title, publisher } = req.body;
  try {
    // ISBN13桁かどうか簡易チェック
    if (!/^\d{13}$/.test(isbn)) {
      return res.status(400).json({ error: 'Invalid ISBN format (must be 13 digits)' });
    }

    // ---------------- 変更点(3) PostgreSQLのINSERT ... RETURNING * を使わず、MySQLのINSERT文に変更 ----------------
    //    MySQLの場合はINSERT直後に「INSERTした行データ」を取得できないため、
    //    ここではリクエストから受け取った値をそのまま返す
    const insertSql = `
      INSERT INTO biblios (isbn, title, publisher)
      VALUES (?, ?, ?)
    `;
    // pool.query で [result, fields] が返る
    //  -> result.affectedRows などが確認可能
    await pool.query(insertSql, [isbn, title, publisher]);

    // もしINSERT後の行を返したい場合は、INSERT文の後にSELECT文を実行する等の工夫が必要
    

    // ここでは簡易的にリクエストデータを返す
    res.status(201).json({ isbn, title, publisher });
  } catch (err) {
    console.error(err);
    // ---------------- 変更点(4) PostgreSQLのerr.code === '23505' → MySQLはER_DUP_ENTRYなどになる ----------------
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Duplicate ISBN' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// [C] 書誌検索 (Read by title)
app.get('/api/biblios/search', async (req, res) => {
  const { q } = req.query; // ?q=... でタイトル部分一致検索
  try {
    let rows;
    if (!q || q.trim() === '') {
      // 全件取得
      const [all] = await pool.query(`SELECT * FROM biblios`);
      rows = all;
    } else {
      // ---------------- 変更点(5) PostgreSQLの ILIKE → MySQLでは大文字小文字を区別しない collation を使うか、LIKEで対応 ----------------
      // 例: テーブルが utf8_general_ci 等のcollationならデフォルトで大小区別なし検索になる
      const [searchResult] = await pool.query(
        `SELECT * FROM biblios
         WHERE title LIKE CONCAT('%', ?, '%')`, 
        [q]
      );
      rows = searchResult;
    }
    res.json(rows);
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
    // ---------------- 変更点(6) PostgreSQLの RETURNING * は使えないので、UPDATE後に行数を確認 ----------------
    const updateSql = `
      UPDATE biblios
      SET title = ?, publisher = ?
      WHERE isbn = ?
    `;
    const [result] = await pool.query(updateSql, [title, publisher, isbn]);

    // result.affectedRows で更新件数を確認
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    // MySQLでは更新後のデータを返すには再SELECTするか、requestの値を返す
    // ここでは request データをそのまま返す例
    res.json({ isbn, title, publisher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// [E] 書誌削除 (Delete)
app.delete('/api/biblios/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const deleteSql = `DELETE FROM biblios WHERE isbn = ?`;
    const [result] = await pool.query(deleteSql, [isbn]);

    if (result.affectedRows === 0) {
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
