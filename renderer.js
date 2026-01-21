// --- 1. 要素の取得 ---
const addBtn = document.getElementById('add-btn');
const medInput = document.getElementById('med-name');
const medList = document.getElementById('med-list');
const dailyCheckList = document.getElementById('daily-check-list');

// --- 2. タブ切り替え機能 ---
function switchTab(tabId) {
    // すべてのコンテンツを非表示にする
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // すべてのボタンの active クラスを外す
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 選択されたタブを表示
    document.getElementById(tabId).classList.add('active');
    
   function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  document.getElementById(tabId).classList.add('active');

  if (tabId === 'check-tab') {
    renderDailyCheck();
  }
}


    // 「今日のチェック」タブが開かれたらリストを更新する
    if (tabId === 'check-tab') {
        renderDailyCheck();
    }
}

// --- 3. 日付の表示 ---
function displayDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const week = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.innerText = `${y}年${m}月${d}日 (${week})`;
    }
}

// --- 4. 今日のチェックリストを描画する関数 ---
async function renderDailyCheck() {
    if (!dailyCheckList) return;
    dailyCheckList.innerHTML = ""; // 一旦クリア

    try {
        const medicines = await window.dbOp.getMedicines();
        medicines.forEach(med => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox">
                <span class="med-name">${med.name}</span>
            `;
            dailyCheckList.appendChild(li);
            
            // チェックボックスの動き（後でDB保存処理を追加する場所）
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                console.log(`${med.name} のチェック状態: ${checkbox.checked}`);
            });
        });
    } catch (e) {
        console.error("チェックリストの読み込み失敗", e);
    }
}

// --- 5. 管理画面用のイベント設定 ---
function setupCheckboxEvent(li) {
    const checkbox = li.querySelector('input[type="checkbox"]');
    const nameSpan = li.querySelector('.med-name');
    if (!checkbox || !nameSpan) return;

    checkbox.addEventListener('change', () => {
        console.log(`管理画面 - 薬名: ${nameSpan.textContent}, 状態: ${checkbox.checked}`);
    });
}

function setupDeleteEvent(li) {
    const deleteBtn = li.querySelector('.delete-btn');
    if (!deleteBtn) return;

    deleteBtn.addEventListener('click', async () => {
        const name = li.querySelector('.med-name').textContent;
        try {
            await window.dbOp.deleteMedicine(name);
            console.log('削除成功:', name);
            li.remove();
        } catch (e) {
            console.error('削除失敗', e);
        }
    });
}

// --- 6. 追加ボタンの処理 ---
if (addBtn) {
    addBtn.addEventListener('click', async () => {
        const name = medInput.value;
        if (name === "") return;

        try {
            await window.dbOp.addMedicine(name);
            console.log('保存成功:', name);

            // 管理画面のリストに表示を追加
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox">
                <span class="med-name">${name}</span>
                <button class="delete-btn">削除</button>
            `;
            medList.appendChild(li);
            setupCheckboxEvent(li);
            setupDeleteEvent(li);

            medInput.value = "";
        } catch (e) {
            console.error('保存失敗', e);
        }
    });
}

// --- 7. 初期起動時の処理 ---
window.addEventListener('DOMContentLoaded', async () => {
    displayDate();
    
    // 最初の画面（今日のチェック）を出す
    renderDailyCheck();

    // 管理画面のリストも読み込んでおく
    try {
        const medicines = await window.dbOp.getMedicines();
        if (medList) {
            medicines.forEach(med => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox">
                    <span class="med-name">${med.name}</span>
                    <button class="delete-btn">削除</button>
                `;
                medList.appendChild(li);
                setupCheckboxEvent(li);
                setupDeleteEvent(li);
            });
        }
    } catch (e) {
        console.error('初期読み込み失敗', e);
    }
});

// --- タブボタンにクリックイベントを設定 ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    switchTab(tabId);

    // activeクラスの切り替え
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
