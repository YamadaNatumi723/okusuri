const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dbOp', {
  // 薬を新しく登録する
  addMedicine: (name) => ipcRenderer.invoke('add-medicine', name),

  // 登録されている薬のリストをすべて取得する
  getMedicines: () => ipcRenderer.invoke('get-medicines'),

  // 薬をマスターデータから削除する
  deleteMedicine: (name) => ipcRenderer.invoke('delete-medicine', name), // ←ここにコンマが必要！
  
  // --- 追記 ---
  saveRecords: (data) => ipcRenderer.invoke('save-records', data), // ←ここにコンマが必要！
  getRecordsByDate: (date) => ipcRenderer.invoke('get-records-by-date', date)
});