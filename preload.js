// レンダラーからNode.jsにアクセスするためのファイル
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('dbOp', {
    createDb: async () => ipcRenderer.invoke('createDb'),    //データベース作成
});
