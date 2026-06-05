document.addEventListener('DOMContentLoaded', () => {
    const incomeTableBody = document.getElementById('income-table-body');
    const expenseTableBody = document.getElementById('expense-table-body');
    const addIncomeBtn = document.getElementById('add-income-btn');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const printBtn = document.getElementById('print-btn');
    const importBtn = document.getElementById('import-btn');
    const pasteArea = document.getElementById('paste-area');

    function setDefaultDates() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); 

        let targetYear = (currentMonth >= 3) ? currentYear - 1 : currentYear - 2;
        document.getElementById('period-start').value = `${targetYear}-04`;
        document.getElementById('period-end').value = `${targetYear + 1}-03`;

        const yyyy = currentYear;
        const mm = String(currentMonth + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        document.getElementById('issue-date').value = `${yyyy}/${mm}/${dd}`;
    }

    function createRow(tbody, data = { date: '', store: '', item: '', amount: '' }) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><input type="text" class="row-date" value="${data.date}" placeholder="yyyy/mm/dd" style="text-align: center;"></td>
            <td>
                <div class="desc-group">
                    <input type="text" class="row-store" value="${data.store}" placeholder="摘要 (ストア名等)">
                    <input type="text" class="row-item" value="${data.item}" placeholder="内容 (商品名・備考等)">
                </div>
            </td>
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

    function importData() {
        const text = pasteArea.value;
        if (!text.trim()) {
            alert('データが入力されていません。');
            return;
        }

        const removeEmptyRows = (tbody) => {
            tbody.querySelectorAll('tr').forEach(row => {
                const date = row.querySelector('.row-date').value.trim();
                const store = row.querySelector('.row-store').value.trim();
                const item = row.querySelector('.row-item').value.trim();
                const amount = row.querySelector('.row-amount').value;
                
                if (!date && !store && !item && !amount) {
                    row.remove();
                }
            });
        };

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

            // ▼ スプレッドシートの日付(yyyy/mm/dd)をそのまま活かすように修正 ▼
            const formattedDate = rawDate.replace(/-/g, '/');
            const expenseAmount = parseInt(expenseStr) || 0;
            const incomeAmount = parseInt(incomeStr) || 0;

            if (incomeAmount > 0) {
                createRow(incomeTableBody, { date: formattedDate, store: storeName, item: notes, amount: incomeAmount });
                importedCount++;
            }
            if (expenseAmount > 0) {
                createRow(expenseTableBody, { date: formattedDate, store: storeName, item: notes, amount: expenseAmount });
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
    setDefaultDates(); 
    
    createRow(incomeTableBody);
    createRow(expenseTableBody);
    calculateTotals();

    // イベントリスナー
    addIncomeBtn.addEventListener('click', () => createRow(incomeTableBody));
    addExpenseBtn.addEventListener('click', () => createRow(expenseTableBody));
    printBtn.addEventListener('click', () => window.print());
    importBtn.addEventListener('click', importData);
});