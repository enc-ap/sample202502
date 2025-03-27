// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [q, setQ] = useState('');             // 検索キーワード
  const [searchResults, setSearchResults] = useState([]);  // 検索結果
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');

  // (1) 検索ボタン押下時
  const handleSearch = async () => {
    try {
      const res = await axios.get(`https//team2-api.modernization-cloudnative.click:4000/api/biblios/search?q=${q}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
      alert('Search failed.');
    }
  };

  // (2) 登録ボタン押下時
  const handleRegister = async () => {
    try {
      const res = await axios.post('https://team2-api.modernization-cloudnative.click:4000/api/biblios', {
        isbn,
        title,
        publisher,
      });
      alert(`Registered: ${res.data.title}`);
      // フォームリセット
      setIsbn('');
      setTitle('');
      setPublisher('');
    } catch (err) {
      console.error(err);
      alert('Registration failed.');
    }
  };

  return (
    <div style={{ margin: '1rem' }}>
      {/* トップ画面 */}
      <h1 style={{ textAlign: 'center' }}>書誌情報検索くん</h1>

      {/* 検索窓 */}
      <div style={{ textAlign: 'center' }}>
        <input
          placeholder="タイトルで検索"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <button onClick={handleSearch}>検索</button>
      </div>

      {/* 検索結果一覧 */}
      <ul>
        {searchResults.map((biblio) => (
          <li key={biblio.isbn}>
            ISBN: {biblio.isbn}, タイトル: {biblio.title}, 出版社: {biblio.publisher}
          </li>
        ))}
      </ul>

      {/* 登録画面への遷移ボタン (簡略化して同一画面内に配置) */}
      <h3>書誌情報登録</h3>
      <div>
        <label>ISBN(13桁): </label>
        <input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
      </div>
      <div>
        <label>タイトル: </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label>出版社: </label>
        <input
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
        />
      </div>
      <button onClick={handleRegister}>登録</button>
    </div>
  );
}

export default App;

