const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

// アプリ起動時のデータベース初期化
app.whenReady().then(() => {
  db = new sqlite3.Database("./my_database.db");

  // 1. 薬マスターテーブル（薬の名前を管理）
  db.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT NOT NULL UNIQUE
    );
  `);

  // 2. 服用記録テーブル（日付ごとに保存）
  // date: '2026-01-15' のような形式
  // is_taken: 1なら服用済み、0なら未服用
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      medicine_name TEXT NOT NULL,
      is_taken INTEGER DEFAULT 0,
      UNIQUE(date, medicine_name)
    );
  `);

  createWindow();
});

// --- IPC通信ハンドラ（renderer.jsからの命令を受け取る） ---

// 薬を追加する
ipcMain.handle('add-medicine', (event, name) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT OR IGNORE INTO medicines (name) VALUES (?)`;
    db.run(sql, [name], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
});

// 薬のリストをすべて取得する
ipcMain.handle('get-medicines', () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM medicines', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// 薬をマスターから削除する
ipcMain.handle('delete-medicine', (event, name) => {
  return new Promise((resolve, reject) => {
    // 薬自体を削除
    db.run('DELETE FROM medicines WHERE name = ?', [name], (err) => {
      if (err) reject(err);
      else {
        // 関連する過去の記録も消す場合
        db.run('DELETE FROM records WHERE medicine_name = ?', [name], (err2) => {
          if (err2) reject(err2);
          else resolve();
        });
      }
    });
  });
});

// アプリ終了処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});