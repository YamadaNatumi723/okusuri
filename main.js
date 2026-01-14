const { app, BrowserWindow ,ipcMain} = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database("./my_database.db");

function createWindow() {

 // テーブル作成　第2引数asyncでうまく戻り値拾えず。ちゃんとnew Promiseで記述しています。
  ipcMain.handle('createDb', (eve) =>
    new Promise((resolve, reject) => {
      db.run('CREATE TABLE IF NOT EXISTS medicines (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,is_taken INTEGER DEFAULT 0);', err => {
        if (err) reject(err);
        resolve();
      });
    }));

  // ウィンドウの作成
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Node.jsの機能を使えるようにする
      contextIsolation: true,
       preload: path.join(__dirname, 'preload.js'), //プレローダーの指定
    }
  });

  
  // 1. ローカルの index.html を表示する場合（お薬チェッカーの画面）
  win.loadFile('index.html');

}

// アプリの準備ができたらウィンドウを作る
app.whenReady().then(createWindow);

// 全てのウィンドウが閉じられたらアプリを終了する（Windows/Linux用）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


