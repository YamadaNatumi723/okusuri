 // テーブル作成　即時関数として呼出し
window.dbOp.createDb()
    .catch(err => { console.log(err) });

const addBtn = document.getElementById('add-btn');
const medInput = document.getElementById('med-name');
const medList = document.getElementById('med-list');

// チェックボックスの状態を取得する関数
function setupCheckboxEvent(li) {
    const checkbox = li.querySelector('input[type="checkbox"]');
    const nameSpan = li.querySelector('.med-name');

    checkbox.addEventListener('change', () => {
        const isChecked = checkbox.checked;
        const medName = nameSpan.textContent;

        console.log(
            `薬名: ${medName}, チェック状態: ${isChecked ? 'ON' : 'OFF'}`
        );
    });
}

// 削除ボタンの処理
function setupDeleteEvent(li) {
    const deleteBtn = li.querySelector('.delete-btn');

    deleteBtn.addEventListener('click', () => {
        console.log('削除:', li.querySelector('.med-name').textContent);
        li.remove();
    });
}

// 追加ボタンが押された時の処理（←ここは1回だけ）
addBtn.addEventListener('click', () => {
    const name = medInput.value;
    if (name === "") return;

    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox">
        <span class="med-name">${name}</span>
        <button class="delete-btn">削除</button>
    `;

    medList.appendChild(li);

    // ★ ここで新しく追加した処理を呼ぶ
    setupCheckboxEvent(li);
    setupDeleteEvent(li);

    medInput.value = "";
});

