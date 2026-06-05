document.addEventListener('DOMContentLoaded', () => {
    const incomeTableBody = document.getElementById('income-table-body');
    const expenseTableBody = document.getElementById('expense-table-body');
    const addIncomeBtn = document.getElementById('add-income-btn');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const printBtn = document.getElementById('print-btn');

    // --- 自動期間設定ロジック (年月版) ---
    function setDefaultFiscalYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0=1月, 3=4月

        let targetYear;
        // 4月以降なら昨年度は currentYear - 1、1〜3月なら昨年度は currentYear - 2
        if (currentMonth >= 3) {
            targetYear = currentYear - 1;
        } else {
            targetYear = currentYear - 2;
        }

        // YYYY-MM 形式の文字列を作成 (月は常に2桁にする)
        const startPeriod = `${targetYear}-04`;
        const endPeriod = `${targetYear + 1}-03`;

        // フォームにセット
        document.getElementById('period-start').value = startPeriod;
        document.getElementById('period-end').value = endPeriod;
    }
    // ------------------------------------

    // 初期データ
    const initialIncomes = [
    ];
    const initialExpenses = [
    ];

    // 行を作成して指定のtbodyに追加する関数
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

    // 合計金額を計算する関数
    function calculateTotals() {
        let totalIncome = 0;
        let totalExpense = 0;

        const incomeRows = incomeTableBody.querySelectorAll('.row-amount');
        incomeRows.forEach(input => {
            totalIncome += parseInt(input.value) || 0;
        });

        const expenseRows = expenseTableBody.querySelectorAll('.row-amount');
        expenseRows.forEach(input => {
            totalExpense += parseInt(input.value) || 0;
        });

        const balance = totalIncome - totalExpense;

        document.getElementById('total-income').textContent = `¥${totalIncome.toLocaleString()}`;
        document.getElementById('total-expense').textContent = `¥${totalExpense.toLocaleString()}`;
        document.getElementById('total-balance').textContent = `¥${balance.toLocaleString()}`;
    }

    // 実行・初期化
    setDefaultFiscalYear(); 
    
    initialIncomes.forEach(data => createRow(incomeTableBody, data));
    initialExpenses.forEach(data => createRow(expenseTableBody, data));
    
    createRow(incomeTableBody);
    createRow(expenseTableBody);
    
    calculateTotals();

    // イベントリスナー
    addIncomeBtn.addEventListener('click', () => createRow(incomeTableBody));
    addExpenseBtn.addEventListener('click', () => createRow(expenseTableBody));
    printBtn.addEventListener('click', () => window.print());
});