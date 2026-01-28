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

  // 2. 服用記録テーブル（名前を pill_records に変更してエラーを回避）
  db.run(`
    CREATE TABLE IF NOT EXISTS pill_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      medicine_name TEXT NOT NULL,
      is_taken INTEGER DEFAULT 0,
      UNIQUE(date, medicine_name)
    );
  `);

  createWindow();
});

// --- IPC通信ハンドラ ---

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

// 薬をマスターから削除する（関連記録も削除）
ipcMain.handle('delete-medicine', (event, name) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM medicines WHERE name = ?', [name], (err) => {
      if (err) reject(err);
      else {
        // 新しいテーブル名 pill_records に合わせて削除
        db.run('DELETE FROM pill_records WHERE medicine_name = ?', [name], (err2) => {
          if (err2) reject(err2);
          else resolve();
        });
      }
    });
  });
});

// 今日の服用記録を保存する
ipcMain.handle('save-records', async (event, { date, records }) => {
  return new Promise((resolve, reject) => {
    // 新しいテーブル名 pill_records に保存
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pill_records (date, medicine_name, is_taken)
      VALUES (?, ?, ?)
    `);

    db.serialize(() => {
      records.forEach(rec => {
        stmt.run(date, rec.name, rec.is_taken);
      });
    });

    stmt.finalize((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

// 特定の日付の記録を取得する
ipcMain.handle('get-records-by-date', (event, date) => {
  return new Promise((resolve, reject) => {
    // 新しいテーブル名 pill_records から取得
    db.all('SELECT medicine_name, is_taken FROM pill_records WHERE date = ?', [date], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// アプリ終了処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});