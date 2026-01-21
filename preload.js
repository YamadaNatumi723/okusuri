const { contextBridge, ipcRenderer } = require('electron');

// renderer.js から使える関数を「dbOp」という名前でまとめて定義
contextBridge.exposeInMainWorld('dbOp', {
  // 薬を新しく登録する
  addMedicine: (name) => ipcRenderer.invoke('add-medicine', name),

  // 登録されている薬のリストをすべて取得する
  getMedicines: () => ipcRenderer.invoke('get-medicines'),

  // 薬をマスターデータから削除する
  deleteMedicine: (name) => ipcRenderer.invoke('delete-medicine', name)
});