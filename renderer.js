// --- 1. 要素の取得 ---
const addBtn = document.getElementById('add-btn');
const medInput = document.getElementById('med-name');
const medList = document.getElementById('med-list');
const dailyCheckList = document.getElementById('daily-check-list');
const saveDailyBtn = document.getElementById('save-daily-btn');

// --- 2. タブ切り替え機能 ---
window.switchTab = function (tabId) {
    console.log("タブ切り替え実行:", tabId);

    // 全コンテンツを非表示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // 対象を表示
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // ボタンの見た目（色）を切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });

    // 「今日のチェック」タブが開かれたらリストを表示
    if (tabId === 'check-tab') {
        renderDailyCheck();
    }
};

// --- 3. 共通・描画処理 ---
function getTodayStr() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function renderDailyCheck() {
    if (!dailyCheckList) return;
    dailyCheckList.innerHTML = "";
    try {
        const medicines = await window.dbOp.getMedicines();
        const dateStr = getTodayStr();
        const savedRecords = await window.dbOp.getRecordsByDate(dateStr);

        medicines.forEach(med => {
            const record = savedRecords.find(r => r.medicine_name === med.name);
            const isChecked = record ? record.is_taken === 1 : false;

            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${isChecked ? 'checked' : ''}>
                <span class="med-name">${med.name}</span>
            `;
            dailyCheckList.appendChild(li);
        });
    } catch (e) {
        console.error("読み込み失敗", e);
    }
}

async function renderManageList() {
    if (!medList) return;
    medList.innerHTML = "";
    try {
        const medicines = await window.dbOp.getMedicines();
        medicines.forEach(med => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox">
                <span class="med-name">${med.name}</span>
                <button class="delete-btn">削除</button>
            `;
            medList.appendChild(li);

            // 削除ボタンのイベント
            li.querySelector('.delete-btn').addEventListener('click', async () => {
                if (!confirm(`${med.name} を削除しますか？`)) return;
                await window.dbOp.deleteMedicine(med.name);
                renderManageList();
                renderDailyCheck();
            });
        });
    } catch (e) {
        console.error("管理リスト読み込み失敗", e);
    }
}

// --- 4. 描画処理 ---
async function renderDailyCheck() {
    if (!dailyCheckList) return;
    dailyCheckList.innerHTML = ""; 
    try {
        const medicines = await window.dbOp.getMedicines();
        const dateStr = getTodayStr();
        const savedRecords = await window.dbOp.getRecordsByDate(dateStr);

        medicines.forEach(med => {
            const record = savedRecords.find(r => r.medicine_name === med.name);
            const isChecked = record ? record.is_taken === 1 : false;

            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${isChecked ? 'checked' : ''}>
                <span class="med-name">${med.name}</span>
            `;
            dailyCheckList.appendChild(li);
        });
    } catch (e) {
        console.error("チェックリスト読み込み失敗", e);
    }
}

async function renderManageList() {
    if (!medList) return;
    medList.innerHTML = "";
    try {
        const medicines = await window.dbOp.getMedicines();
        medicines.forEach(med => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox">
                <span class="med-name">${med.name}</span>
                <button class="delete-btn">削除</button>
            `;
            medList.appendChild(li);
            
            li.querySelector('.delete-btn').addEventListener('click', async () => {
                if (!confirm(`${med.name} を削除しますか？`)) return;
                await window.dbOp.deleteMedicine(med.name);
                renderManageList();
                renderDailyCheck();
            });
        });
    } catch (e) {
        console.error("管理リスト読み込み失敗", e);
    }
}

// --- 5. 起動時の設定 --- 
window.addEventListener('DOMContentLoaded', async () => {
    // タブボタンのイベント登録
    document.querySelectorAll('.tab-btn').forEach(btn => { 
        btn.addEventListener('click', () => { 
            switchTab(btn.dataset.tab); 
        }); 
    });np

    // 日付表示
    const now = new Date(); 
    const week = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()]; 
    const dateEl = document.getElementById('current-date'); 
    if (dateEl) {
        dateEl.innerText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日(${week})`;
    }

    // 初期表示 
    await renderDailyCheck(); 
    await renderManageList();

    // 薬の追加ボタン 
    if (addBtn) { 
        addBtn.addEventListener('click', async () => { 
            const name = medInput.value.trim(); 
            if (name === "") return; 
            await window.dbOp.addMedicine(name);
            medInput.value = ""; 
            renderManageList(); 
            renderDailyCheck(); 
        }); 
    }

    // 今日の記録を保存ボタン
    if (saveDailyBtn) {
        saveDailyBtn.addEventListener('click', async () => { 
            const dateStr = getTodayStr(); 
            const records = []; 
            document.querySelectorAll('#daily-check-list li').forEach(li => { 
                records.push({ 
                    name: li.querySelector('.med-name').textContent, 
                    is_taken: li.querySelector('input[type="checkbox"]').checked ? 1 : 0 
                }); 
            }); 
            try {
                await window.dbOp.saveRecords({ date: dateStr, records: records }); 
                alert("保存しました！"); 
            } catch (e) {
                console.error("保存失敗", e);
            }
        }); 
    }
});