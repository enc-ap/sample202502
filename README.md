# sample202502

# 書誌情報管理アプリ - API一覧

本アプリケーションで使用しているバックエンドAPIのエンドポイント・機能・ブラウザ(or curl)での確認方法をまとめています。  
ベースURLは `http://localhost:4000` を想定。

---

## 1. ヘルスチェック

| **HTTPメソッド** | **エンドポイント** | **機能**                        | **確認方法 (例)**                                                                 |
|-----------------|--------------------|--------------------------------|-----------------------------------------------------------------------------------|
| GET             | `/api/health`     | アプリの稼働状況を確認 (ヘルスチェック) | - **ブラウザ**: `http://localhost:4000/api/health`  <br> - **curl**: `curl -i http://localhost:4000/api/health`<br> → 200ステータス & JSON(`{status:"OK", timestamp:"..."}`)を返却 |

---

## 2. 書誌情報の登録 (Create)

| **HTTPメソッド** | **エンドポイント** | **機能**                                           | **確認方法 (例)**                                                                                                                                     |
|-----------------|--------------------|---------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| POST            | `/api/biblios`    | 新しい書誌情報(ISBN,タイトル,出版社)を登録する      | - **ブラウザ**: フロントエンドから登録フォーム送信 (Reactで `axios.post`)<br> - **curl**:  <br>```bash<br>curl -X POST -H "Content-Type: application/json" -d '{"isbn":"1234567890123","title":"test","publisher":"test"}' http://localhost:4000/api/biblios<br>``` |

- **ボディ例** (JSON):
  ```json
  {
    "isbn": "1234567890123",
    "title": "サンプル書籍",
    "publisher": "テスト出版社"
  }


3. 書誌情報の検索 (Read)
HTTPメソッド	エンドポイント	機能	確認方法 (例)
GET	/api/biblios/search?q=...	タイトル部分一致による検索	- ブラウザ: http://localhost:4000/api/biblios/search?q=java (結果はJSONリスト)
- curl: curl "http://localhost:4000/api/biblios/search?q=java"
クエリパラメータ: q=タイトルの一部
パラメータなし or 空文字の場合: 全件取得
成功時: 200ステータス + [ {...}, {...}, ... ] (ISBN/タイトル/出版社 の配列)
4. 書誌情報の更新 (Update)
HTTPメソッド	エンドポイント	機能	確認方法 (例)
PUT	/api/biblios/:isbn	指定したISBNの書誌情報(タイトル,出版社)を更新	- ブラウザ: フロントエンドで編集フォーム & axios.put
- curl:
bash<br>curl -X PUT -H "Content-Type: application/json" -d '{"title":"新タイトル","publisher":"新出版社"}' http://localhost:4000/api/biblios/1234567890123<br>
ボディ例 (JSON):
json
コピーする
編集する
{
  "title": "新タイトル",
  "publisher": "新出版社"
}
成功時: 200ステータス + 更新後オブジェクト / 404(未存在) or 500(サーバエラー)
5. 書誌情報の削除 (Delete)
HTTPメソッド	エンドポイント	機能	確認方法 (例)
DELETE	/api/biblios/:isbn	指定したISBNの書誌情報を削除する	- ブラウザ: フロント側で一覧表示に「削除」ボタン → axios.delete
- curl:
curl -X DELETE http://localhost:4000/api/biblios/1234567890123
成功時: 200ステータス + { message: "Deleted successfully" } / 404(未存在)
補足
ブラウザで直接確認できるAPI
GET /api/health と GET /api/biblios/search は、アドレスバーへURLを入力すればJSONが表示される
POST / PUT / DELETE は通常アドレスバーからは送れない
フロントエンド(React)や curl, Postman等でHTTPメソッドを指定して実行
DB構成
biblios テーブル: isbn (PK, VARCHAR(13)), title (TEXT), publisher (TEXT)
エラー時
400: バリデーションエラー (ISBN13桁でない、重複など)
404: 指定リソース(ISBN)が存在しない
500: サーバー内エラー(DB接続不良など)
以上が、書誌情報管理アプリのAPI一覧
