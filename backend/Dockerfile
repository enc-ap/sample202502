# Dockerfile (backend/Dockerfile)

# ベースイメージ: Node.js 18 (Alpine版)
FROM node:18-alpine

# コンテナ内の作業ディレクトリを /app に設定
WORKDIR /app

# package*.json を先にコピーして npm install
COPY package*.json ./
RUN npm install

# 残りのソースコードをコピー
COPY . .

# サーバーが使用するポート (4000) を公開
EXPOSE 4000

# コンテナ起動時に実行するコマンド
CMD ["node", "src/app.js"]
