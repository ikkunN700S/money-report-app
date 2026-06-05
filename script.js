document.addEventListener('DOMContentLoaded', () => {
    const incomeTableBody = document.getElementById('income-table-body');
    const expenseTableBody = document.getElementById('expense-table-body');
    const addIncomeBtn = document.getElementById('add-income-btn');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const printBtn = document.getElementById('print-btn');
    const importBtn = document.getElementById('import-btn');
    const pasteArea = document.getElementById('paste-area');

    function setDefaultFiscalYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let targetYear = (currentMonth >= 3) ? currentYear - 1 : currentYear - 2;
        document.getElementById('period-start').value = `${targetYear}-04`;
        document.getElementById('period-end').value = `${targetYear + 1}-03`;
    }

    function createRow(tbody, data = { date: '', desc: '', amount: '' }) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><input type="date" class="row-date" value="${data.date}"></td>
            <td><input type="text" class="row-desc" value="${data.desc}" placeholder="内容を入力"></td>
            <td><input type="number" class="row-amount" value="${data.amount}" placeholder="0" min="0"></td>
            <td class="no-print" style="text-align:center;">
                <button class="delete-btn" tabindex="-1">削除</button>
            </td>
        `;

        const amountInput = tr.querySelector('.row-amount');
        const deleteBtn = tr.querySelector('.delete-btn');

        amountInput.addEventListener('input', calculateTotals);
        deleteBtn.addEventListener('click', () => {
            tr.remove();
            calculateTotals();
        });

        tbody.appendChild(tr);
    }

    function calculateTotals() {
        let totalIncome = 0;
        let totalExpense = 0;

        incomeTableBody.querySelectorAll('.row-amount').forEach(input => {
            totalIncome += parseInt(input.value) || 0;
        });

        expenseTableBody.querySelectorAll('.row-amount').forEach(input => {
            totalExpense += parseInt(input.value) || 0;
        });

        const balance = totalIncome - totalExpense;

        document.getElementById('total-income').textContent = `¥${totalIncome.toLocaleString()}`;
        document.getElementById('total-expense').textContent = `¥${totalExpense.toLocaleString()}`;
        document.getElementById('total-balance').textContent = `¥${balance.toLocaleString()}`;
    }

    // --- コピペデータのインポート処理 ---
    function importData() {
        const text = pasteArea.value;
        if (!text.trim()) {
            alert('データが入力されていません。');
            return;
        }

        // ▼ 追加: 空行（日付、内容、金額がすべて未入力の行）を削除する関数
        const removeEmptyRows = (tbody) => {
            tbody.querySelectorAll('tr').forEach(row => {
                const date = row.querySelector('.row-date').value;
                const desc = row.querySelector('.row-desc').value.trim();
                const amount = row.querySelector('.row-amount').value;
                
                if (!date && !desc && !amount) {
                    row.remove();
                }
            });
        };

        // インポート前に両方のテーブルの空行をお掃除
        removeEmptyRows(incomeTableBody);
        removeEmptyRows(expenseTableBody);

        const rows = text.split('\n');
        let importedCount = 0;

        rows.forEach(row => {
            const cols = row.split('\t');
            if (cols.length < 2) return; 

            const rawDate = cols[0] ? cols[0].trim() : '';
            const storeName = cols[1] ? cols[1].trim() : '';
            
            if (rawDate === '日付' || storeName === '摘要内容' || storeName === 'ストア名') return;

            const expenseStr = cols[2] ? cols[2].replace(/[,¥]/g, '').trim() : '';
            const incomeStr = cols[3] ? cols[3].replace(/[,¥]/g, '').trim() : '';
            const notes = cols[4] ? cols[4].trim() : '';

            const formattedDate = rawDate.replace(/\//g, '-');

            let desc = storeName;
            if (notes) {
                desc += ` (${notes})`; 
            }

            const expenseAmount = parseInt(expenseStr) || 0;
            const incomeAmount = parseInt(incomeStr) || 0;

            if (incomeAmount > 0) {
                createRow(incomeTableBody, { date: formattedDate, desc: desc, amount: incomeAmount });
                importedCount++;
            }
            if (expenseAmount > 0) {
                createRow(expenseTableBody, { date: formattedDate, desc: desc, amount: expenseAmount });
                importedCount++;
            }
        });

        if (importedCount > 0) {
            calculateTotals();
            pasteArea.value = ''; 
            alert(`${importedCount}件のデータをインポートしました！`);
        } else {
            alert('有効なデータが見つかりませんでした。列の構成を確認してください。');
        }
    }

    // 初期化
    setDefaultFiscalYear(); 
    
    // 手入力を想定して最初は空行を1つずつ出しておく
    createRow(incomeTableBody);
    createRow(expenseTableBody);
    calculateTotals();

    // イベントリスナー
    addIncomeBtn.addEventListener('click', () => createRow(incomeTableBody));
    addExpenseBtn.addEventListener('click', () => createRow(expenseTableBody));
    printBtn.addEventListener('click', () => window.print());
    importBtn.addEventListener('click', importData);
});