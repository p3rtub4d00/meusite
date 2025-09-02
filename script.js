// Dados iniciais (serão substituídos pelos dados salvos localmente)
let products = [
    { id: 1, name: "Vodka Smirnoff", category: "Destilados", quantity: 45, price: 29.90, minStock: 10 },
    { id: 2, name: "Cerveja Heineken", category: "Cervejas", quantity: 120, price: 7.90, minStock: 30 },
    { id: 3, name: "Vinho Tinto Chileno", category: "Vinhos", quantity: 32, price: 49.90, minStock: 5 },
    { id: 4, name: "Whisky Johnnie Walker", category: "Destilados", quantity: 8, price: 129.90, minStock: 5 },
    { id: 5, name: "Energético Red Bull", category: "Energéticos", quantity: 0, price: 11.90, minStock: 20 }
];

let categories = ["Cervejas", "Destilados", "Vinhos", "Energéticos", "Refrigerantes", "Águas", "Sucos"];

let sales = [
    { id: 1, date: "2023-10-25", productId: 2, quantity: 10, price: 7.90, paymentMethod: "dinheiro" },
    { id: 2, date: "2023-10-25", productId: 1, quantity: 2, price: 29.90, paymentMethod: "pix" },
    { id: 3, date: "2023-10-24", productId: 3, quantity: 3, price: 49.90, paymentMethod: "cartao", cardFee: 2.50 },
    { id: 4, date: "2023-10-24", productId: 4, quantity: 1, price: 129.90, paymentMethod: "cartao", cardFee: 5.00 }
];

let tables = [
    { id: 1, number: 1, capacity: 4, description: "Mesa perto do balcão", status: "free", orders: [] },
    { id: 2, number: 2, capacity: 6, description: "Mesa central", status: "free", orders: [] },
    { id: 3, number: 3, capacity: 2, description: "Mesa de casal", status: "free", orders: [] },
    { id: 4, number: 4, capacity: 8, description: "Mesa grande", status: "free", orders: [] }
];

let receivables = [
    { id: 1, client: "João Silva", totalAmount: 150.00, receivedAmount: 0.00, dueDate: "2023-11-10", status: "pending", sales: [] },
    { id: 2, client: "Maria Santos", totalAmount: 89.70, receivedAmount: 50.00, dueDate: "2023-11-05", status: "partial", sales: [] },
    { id: 3, client: "Carlos Oliveira", totalAmount: 230.50, receivedAmount: 230.50, dueDate: "2023-10-20", status: "paid", sales: [] }
];

let expenses = [
    { id: 1, description: "Compra de bebidas", category: "Estoque", amount: 1250.00, date: "2023-10-20" },
    { id: 2, description: "Pagamento de funcionários", category: "Folha de Pagamento", amount: 3200.00, date: "2023-10-05" },
    { id: 3, description: "Aluguel do espaço", category: "Despesas Fixas", amount: 1800.00, date: "2023-10-01" },
    { id: 4, description: "Conta de luz", category: "Utilidades", amount: 350.00, date: "2023-10-15" }
];

let expenseCategories = ["Estoque", "Folha de Pagamento", "Despesas Fixas", "Utilidades", "Manutenção", "Outros"];

let currentSale = [];
let selectedPaymentMethod = null;
let cardFee = 0;
let currentLowStockFilter = 'all';
let currentSalesFilter = 'all';
let backupInterval = null;

// Funções para salvar e carregar dados do localStorage
function saveDataToLocalStorage() {
    localStorage.setItem('conteinerbeer_products', JSON.stringify(products));
    localStorage.setItem('conteinerbeer_categories', JSON.stringify(categories));
    localStorage.setItem('conteinerbeer_sales', JSON.stringify(sales));
    localStorage.setItem('conteinerbeer_tables', JSON.stringify(tables));
    localStorage.setItem('conteinerbeer_receivables', JSON.stringify(receivables));
    localStorage.setItem('conteinerbeer_expenses', JSON.stringify(expenses));
    localStorage.setItem('conteinerbeer_expense_categories', JSON.stringify(expenseCategories));
    localStorage.setItem('conteinerbeer_last_save', new Date().toISOString());
    
    // Atualizar o indicador de último backup
    updateLastBackupTime();
}

function loadDataFromLocalStorage() {
    const savedProducts = localStorage.getItem('conteinerbeer_products');
    const savedCategories = localStorage.getItem('conteinerbeer_categories');
    const savedSales = localStorage.getItem('conteinerbeer_sales');
    const savedTables = localStorage.getItem('conteinerbeer_tables');
    const savedReceivables = localStorage.getItem('conteinerbeer_receivables');
    const savedExpenses = localStorage.getItem('conteinerbeer_expenses');
    const savedExpenseCategories = localStorage.getItem('conteinerbeer_expense_categories');
    
    if (savedProducts) products = JSON.parse(savedProducts);
    if (savedCategories) categories = JSON.parse(savedCategories);
    if (savedSales) sales = JSON.parse(savedSales);
    if (savedTables) tables = JSON.parse(savedTables);
    if (savedReceivables) receivables = JSON.parse(savedReceivables);
    if (savedExpenses) expenses = JSON.parse(savedExpenses);
    if (savedExpenseCategories) expenseCategories = JSON.parse(savedExpenseCategories);
    
    // Atualizar o indicador de último backup
    updateLastBackupTime();
}

// Atualizar o indicador de último backup
function updateLastBackupTime() {
    const lastSave = localStorage.getItem('conteinerbeer_last_save');
    const lastBackupElement = document.getElementById('last-backup-time');
    
    if (lastBackupElement) {
        if (lastSave) {
            const lastSaveDate = new Date(lastSave);
            lastBackupElement.textContent = `Último backup: ${formatDateTime(lastSaveDate)}`;
        } else {
            lastBackupElement.textContent = 'Nenhum backup realizado';
        }
    }
}

// Formatar data e hora
function formatDateTime(date) {
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Iniciar backup automático a cada 30 minutos
function startAutoBackup() {
    if (backupInterval) clearInterval(backupInterval);
    
    backupInterval = setInterval(() => {
        saveDataToLocalStorage();
        console.log('Backup automático realizado às', new Date().toLocaleTimeString('pt-BR'));
    }, 30 * 60 * 1000); // 30 minutos
}

// Exportar dados para JSON
function exportData() {
    const data = {
        products: products,
        categories: categories,
        sales: sales,
        tables: tables,
        receivables: receivables,
        expenses: expenses,
        expenseCategories: expenseCategories,
        exportDate: new Date().toISOString(),
        system: "Conteiner Beer"
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `conteinerbeer-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Atualizar o indicador de último backup
    saveDataToLocalStorage();
}

// Importar dados de JSON
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar se é um arquivo JSON
    if (!file.name.endsWith('.json')) {
        alert('Por favor, selecione um arquivo JSON.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Verificar se é um arquivo válido do Conteiner Beer
            if (!data.products || !data.categories || !data.sales) {
                alert('Arquivo inválido. Este não parece ser um backup do Conteiner Beer.');
                return;
            }
            
            if (confirm('Isso substituirá todos os dados atuais. Tem certeza?')) {
                if (data.products) products = data.products;
                if (data.categories) categories = data.categories;
                if (data.sales) sales = data.sales;
                if (data.tables) tables = data.tables;
                if (data.receivables) receivables = data.receivables;
                if (data.expenses) expenses = data.expenses;
                if (data.expenseCategories) expenseCategories = data.expenseCategories;
                
                // Atualizar a interface
                updateProductsTable();
                updateDashboard();
                updateProductSelects();
                updateQuickSalesStock();
                updateTablesGrid();
                updateReceivablesTable();
                updateExpensesTable();
                
                // Salvar no localStorage também
                saveDataToLocalStorage();
                
                alert('Dados importados com sucesso!');
            }
        } catch (error) {
            alert('Erro ao importar arquivo. O arquivo pode estar corrompido ou em formato inválido.');
            console.error('Erro na importação:', error);
        }
    };
    reader.readAsText(file);
}

// Função para calcular vendas do dia
function getTodaySales() {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.date === today);
}

// Função para mostrar resumo das vendas do dia
function showDailySalesSummary() {
    const todaySales = getTodaySales();
    const totalSales = todaySales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    const salesCount = todaySales.length;
    
    document.getElementById('daily-sales-count').textContent = salesCount;
    document.getElementById('daily-sales-total').textContent = `R$ ${totalSales.toFixed(2)}`;
    
    const summaryElement = document.getElementById('daily-sales-summary');
    summaryElement.style.display = 'block';
    
    // Ocultar o resumo após 5 segundos
    setTimeout(() => {
        summaryElement.style.display = 'none';
    }, 5000);
}

// Função para limpar vendas do dia
function clearTodaySales() {
    const today = new Date().toISOString().split('T')[0];
    const todaySalesCount = sales.filter(sale => sale.date === today).length;
    
    if (todaySalesCount === 0) {
        alert('Não há vendas registradas hoje!');
        return;
    }
    
    if (confirm(`Tem certeza que deseja limpar as ${todaySalesCount} vendas de hoje? Esta ação não pode ser desfeita!`)) {
        // Manter apenas vendas de outros dias
        sales = sales.filter(sale => sale.date !== today);
        
        // Salvar dados
        saveDataToLocalStorage();
        
        // Atualizar histórico se estiver visível
        if (document.getElementById('sales-modal').style.display === 'block') {
            updateSalesHistory();
        }
        
        // Atualizar dashboard
        updateDashboard();
        
        // Mostrar resumo
        showDailySalesSummary();
        
        alert(`Vendas do dia limpas com sucesso! ${todaySalesCount} vendas removidas.`);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados salvos
    loadDataFromLocalStorage();
    
    // Iniciar backup automático
    startAutoBackup();
    
    // Atualizar a interface
    updateProductsTable();
    updateDashboard();
    updateProductSelects();
    updateQuickSalesStock();
    updateTablesGrid();
    updateReceivablesTable();
    updateExpensesTable();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Definir data atual para campos de data
    const today = new Date().toISOString().split('T')[0];
    const expenseDate = document.getElementById('expense-date');
    const paymentDate = document.getElementById('payment-date');
    const receivableDueDate = document.getElementById('receivable-due-date');
    
    if (expenseDate) expenseDate.value = today;
    if (paymentDate) paymentDate.value = today;
    if (receivableDueDate) receivableDueDate.value = today;
});

// Atualiza a tabela de produtos
function updateProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    const modalTableBody = document.getElementById('modal-products-table-body');
    let tableContent = '';
    let modalTableContent = '';
    
    products.forEach(product => {
        const status = product.quantity === 0 ? 'Esgotado' : 
                      product.quantity <= product.minStock ? 'Estoque Baixo' : 'Disponível';
        
        const statusClass = product.quantity === 0 ? 'alert' : 
                           product.quantity <= product.minStock ? 'warning' : '';
        
        tableContent += `
            <tr class="${statusClass}">
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${status}</td>
                <td>
                    <button class="action-btn edit-product" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn delete-product" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        
        modalTableContent += `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit-product" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn delete-product" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    
    if (tableBody) tableBody.innerHTML = tableContent;
    if (modalTableBody) modalTableBody.innerHTML = modalTableContent;
    
    // Adicionar event listeners aos botões de editar e excluir
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
    
    // Atualizar selects de produtos
    updateProductSelects();
    updateQuickSalesStock();
    
    // Salvar dados
    saveDataToLocalStorage();
}

// Atualiza o estoque nos botões de venda rápida
function updateQuickSalesStock() {
    const heineken = products.find(p => p.name === "Cerveja Heineken");
    const smirnoff = products.find(p => p.name === "Vodka Smirnoff");
    const vinho = products.find(p => p.name.includes("Vinho Tinto"));
    const whisky = products.find(p => p.name.includes("Whisky Johnnie"));
    
    if (heineken && document.getElementById('stock-heineken')) document.getElementById('stock-heineken').textContent = heineken.quantity;
    if (smirnoff && document.getElementById('stock-smirnoff')) document.getElementById('stock-smirnoff').textContent = smirnoff.quantity;
    if (vinho && document.getElementById('stock-vinho')) document.getElementById('stock-vinho').textContent = vinho.quantity;
    if (whisky && document.getElementById('stock-whisky')) document.getElementById('stock-whisky').textContent = whisky.quantity;
}

// Atualiza o dashboard
function updateDashboard() {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
    
    // Calcular vendas de hoje
    const today = new Date().toISOString().split('T')[0];
    const salesToday = sales
        .filter(sale => sale.date === today)
        .reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    
    // Calcular produtos com estoque baixo
    const lowStock = products.filter(product => product.quantity <= product.minStock && product.quantity > 0).length;
    const outOfStock = products.filter(product => product.quantity === 0).length;
    
    // Calcular vendas de hoje para o novo card
    const todaySales = getTodaySales();
    
    // Calcular total a receber
    const totalReceivables = receivables.reduce((sum, rec) => sum + (rec.totalAmount - rec.receivedAmount), 0);
    
    // Calcular gastos do mês
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = expenses
        .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calcular mesas ativas
    const activeTables = tables.filter(table => table.status !== 'free').length;
    
    if (document.getElementById('total-products')) document.getElementById('total-products').textContent = totalProducts;
    if (document.getElementById('total-stock')) document.getElementById('total-stock').textContent = `${totalStock.toLocaleString()} uni.`;
    if (document.getElementById('sales-today')) document.getElementById('sales-today').textContent = `R$ ${salesToday.toFixed(2)}`;
    if (document.getElementById('low-stock')) document.getElementById('low-stock').textContent = lowStock + outOfStock;
    if (document.getElementById('today-sales-count')) document.getElementById('today-sales-count').textContent = `${todaySales.length} vendas`;
    if (document.getElementById('total-receivables')) document.getElementById('total-receivables').textContent = `R$ ${totalReceivables.toFixed(2)}`;
    if (document.getElementById('month-expenses')) document.getElementById('month-expenses').textContent = `R$ ${monthExpenses.toFixed(2)}`;
    if (document.getElementById('active-tables')) document.getElementById('active-tables').textContent = activeTables;
    
    // Salvar dados
    saveDataToLocalStorage();
}

// Atualiza os selects de produtos
function updateProductSelects() {
    const saleProductSelect = document.getElementById('sale-product');
    if (saleProductSelect) {
        let options = '<option value="">Selecione um produto</option>';
        
        products.forEach(product => {
            if (product.quantity > 0) {
                options += `<option value="${product.id}" data-price="${product.price}">${product.name} - R$ ${product.price.toFixed(2)} (Estoque: ${product.quantity})</option>`;
            }
        });
        
        saleProductSelect.innerHTML = options;
    }
    
    // Atualizar select de categorias
    const categorySelect = document.getElementById('productCategory');
    if (categorySelect) {
        let categoryOptions = '<option value="">Selecione uma categoria</option>';
        
        categories.forEach(category => {
            categoryOptions += `<option value="${category}">${category}</option>`;
        });
        
        categorySelect.innerHTML = categoryOptions;
    }
    
    // Atualizar lista de categorias
    const categoriesList = document.getElementById('categories-list');
    if (categoriesList) {
        let categoriesContent = '';
        
        categories.forEach(category => {
            categoriesContent += `<li>${category} <button class="action-btn delete-btn delete-category" data-category="${category}"><i class="fas fa-trash"></i></button></li>`;
        });
        
        categoriesList.innerHTML = categoriesContent;
        
        // Adicionar event listeners aos botões de excluir categoria
        document.querySelectorAll('.delete-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.closest('button').getAttribute('data-category');
                deleteCategory(category);
            });
        });
    }
    
    // Atualizar select de mesas
    const tableSelect = document.getElementById('sale-table');
    if (tableSelect) {
        let tableOptions = '<option value="">Selecione uma mesa</option>';
        
        tables.forEach(table => {
            if (table.status === 'occupied') {
                tableOptions += `<option value="${table.id}">Mesa ${table.number} (Ocupada)</option>`;
            }
        });
        
        tableSelect.innerHTML = tableOptions;
    }
    
    // Atualizar select de contas a receber
    const receivableSelect = document.getElementById('receivable-select');
    if (receivableSelect) {
        let receivableOptions = '<option value="">Selecione uma conta</option>';
        
        receivables.forEach(receivable => {
            if (receivable.status !== 'paid') {
                const pendingAmount = receivable.totalAmount - receivable.receivedAmount;
                receivableOptions += `<option value="${receivable.id}" data-pending="${pendingAmount}">${receivable.client} - R$ ${pendingAmount.toFixed(2)}</option>`;
            }
        });
        
        receivableSelect.innerHTML = receivableOptions;
    }
    
    // Atualizar select de categorias de gastos
    const expenseCategorySelect = document.getElementById('expense-category');
    if (expenseCategorySelect) {
        let expenseCategoryOptions = '<option value="">Selecione uma categoria</option>';
        
        expenseCategories.forEach(category => {
            expenseCategoryOptions += `<option value="${category}">${category}</option>`;
        });
        
        expenseCategorySelect.innerHTML = expenseCategoryOptions;
    }
    
    // Atualizar lista de categorias de gastos
    const expenseCategoriesList = document.getElementById('expense-categories-list');
    if (expenseCategoriesList) {
        let expenseCategoriesContent = '';
        
        expenseCategories.forEach(category => {
            expenseCategoriesContent += `<li>${category} <button class="action-btn delete-btn delete-expense-category" data-category="${category}"><i class="fas fa-trash"></i></button></li>`;
        });
        
        expenseCategoriesList.innerHTML = expenseCategoriesContent;
        
        // Adicionar event listeners aos botões de excluir categoria de gastos
        document.querySelectorAll('.delete-expense-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.closest('button').getAttribute('data-category');
                deleteExpenseCategory(category);
            });
        });
    }
}

// Atualiza a grade de mesas
function updateTablesGrid() {
    const tablesGrid = document.getElementById('tables-grid');
    const tablesManagement = document.getElementById('tables-management');
    
    if (!tablesGrid && !tablesManagement) return;
    
    let tablesContent = '';
    let managementContent = '';
    
    tables.forEach(table => {
        const statusText = table.status === 'free' ? 'Livre' : 
                          table.status === 'occupied' ? 'Ocupada' : 'Reservada';
        
        const statusClass = table.status === 'free' ? 'status-free' : 
                           table.status === 'occupied' ? 'status-occupied' : 'status-reserved';
        
        // Calcular total da mesa se estiver ocupada
        let tableTotal = 0;
        if (table.status === 'occupied' && table.orders.length > 0) {
            tableTotal = table.orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
        }
        
        tablesContent += `
            <div class="table-item ${table.status !== 'free' ? 'active' : ''}" data-id="${table.id}">
                <div class="table-number">Mesa ${table.number}</div>
                <div class="table-status ${statusClass}">${statusText}</div>
                <div class="table-capacity">${table.capacity} lugares</div>
                <div class="table-description">${table.description || ''}</div>
                ${table.status === 'occupied' ? `<div class="table-total">Total: R$ ${tableTotal.toFixed(2)}</div>` : ''}
            </div>
        `;
        
        managementContent += `
            <div class="table-item ${table.status !== 'free' ? 'active' : ''}" data-id="${table.id}">
                <div class="table-number">Mesa ${table.number}</div>
                <div class="table-status ${statusClass}">${statusText}</div>
                <div class="table-capacity">${table.capacity} lugares</div>
                <div class="table-description">${table.description || ''}</div>
                <div style="margin-top: 10px;">
                    <button class="action-btn edit-table" data-id="${table.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn delete-table" data-id="${table.id}"><i class="fas fa-trash"></i></button>
                    ${table.status === 'occupied' ? `
                        <button class="action-btn close-table" data-id="${table.id}"><i class="fas fa-receipt"></i> Fechar</button>
                        <div class="table-total">Total: R$ ${tableTotal.toFixed(2)}</div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    if (tablesGrid) tablesGrid.innerHTML = tablesContent;
    if (tablesManagement) tablesManagement.innerHTML = managementContent;
    
    // Adicionar event listeners às mesas
    document.querySelectorAll('.table-item').forEach(tableItem => {
        tableItem.addEventListener('click', (e) => {
            const tableId = parseInt(e.currentTarget.getAttribute('data-id'));
            const table = tables.find(t => t.id === tableId);
            
            if (table) {
                if (table.status === 'free') {
                    // Abrir modal de vendas para esta mesa
                    openTableForSale(tableId);
                } else if (table.status === 'occupied') {
                    // Mostrar detalhes da mesa
                    showTableDetails(tableId);
                }
            }
        });
    });
    
    // Adicionar event listeners aos botões de editar, excluir e fechar mesa
    document.querySelectorAll('.edit-table').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const tableId = parseInt(button.getAttribute('data-id'));
            editTable(tableId);
        });
    });
    
    document.querySelectorAll('.delete-table').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const tableId = parseInt(button.getAttribute('data-id'));
            deleteTable(tableId);
        });
    });
    
    document.querySelectorAll('.close-table').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const tableId = parseInt(button.getAttribute('data-id'));
            closeTable(tableId);
        });
    });
}

// Atualiza a tabela de contas a receber
function updateReceivablesTable() {
    const tableBody = document.getElementById('receivables-table-body');
    const listBody = document.getElementById('receivables-list-body');
    
    if (!tableBody && !listBody) return;
    
    let tableContent = '';
    let listContent = '';
    
    receivables.forEach(receivable => {
        const pendingAmount = receivable.totalAmount - receivable.receivedAmount;
        const status = pendingAmount <= 0 ? 'Paga' : 
                      new Date(receivable.dueDate) < new Date() ? 'Atrasada' : 'Pendente';
        
        const statusClass = status === 'Paga' ? 'status-paid' : 
                           status === 'Atrasada' ? 'status-overdue' : 'status-pending';
        
        tableContent += `
            <tr>
                <td>${receivable.client}</td>
                <td>R$ ${receivable.totalAmount.toFixed(2)}</td>
                <td>R$ ${receivable.receivedAmount.toFixed(2)}</td>
                <td>R$ ${pendingAmount.toFixed(2)}</td>
                <td>${formatDate(receivable.dueDate)}</td>
                <td><span class="receivable-status ${statusClass}">${status}</span></td>
                <td>
                    <button class="action-btn view-receivable" data-id="${receivable.id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete-btn delete-receivable" data-id="${receivable.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        
        listContent += `
            <tr>
                <td>${receivable.client}</td>
                <td>R$ ${receivable.totalAmount.toFixed(2)}</td>
                <td>R$ ${receivable.receivedAmount.toFixed(2)}</td>
                <td>R$ ${pendingAmount.toFixed(2)}</td>
                <td>${formatDate(receivable.dueDate)}</td>
                <td><span class="receivable-status ${statusClass}">${status}</span></td>
                <td>
                    <button class="action-btn receive-payment" data-id="${receivable.id}"><i class="fas fa-money-bill-wave"></i></button>
                    <button class="action-btn delete-btn delete-receivable" data-id="${receivable.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    
    if (tableBody) tableBody.innerHTML = tableContent;
    if (listBody) listBody.innerHTML = listContent;
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.view-receivable').forEach(button => {
        button.addEventListener('click', (e) => {
            const receivableId = parseInt(button.getAttribute('data-id'));
            viewReceivable(receivableId);
        });
    });
    
    document.querySelectorAll('.receive-payment').forEach(button => {
        button.addEventListener('click', (e) => {
            const receivableId = parseInt(button.getAttribute('data-id'));
            receivePayment(receivableId);
        });
    });
    
    document.querySelectorAll('.delete-receivable').forEach(button => {
        button.addEventListener('click', (e) => {
            const receivableId = parseInt(button.getAttribute('data-id'));
            deleteReceivable(receivableId);
        });
    });
}

// Atualiza a tabela de gastos
function updateExpensesTable() {
    const tableBody = document.getElementById('expenses-table-body');
    const listBody = document.getElementById('expenses-list-body');
    
    if (!tableBody && !listBody) return;
    
    let tableContent = '';
    let listContent = '';
    
    // Ordenar gastos por data (mais recente primeiro)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExpenses.forEach(expense => {
        tableContent += `
            <tr>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>R$ ${expense.amount.toFixed(2)}</td>
                <td>${formatDate(expense.date)}</td>
                <td>
                    <button class="action-btn edit-expense" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn delete-expense" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        
        listContent += `
            <tr>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>R$ ${expense.amount.toFixed(2)}</td>
                <td>${formatDate(expense.date)}</td>
                <td>
                    <button class="action-btn edit-expense" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn delete-expense" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    
    if (tableBody) tableBody.innerHTML = tableContent;
    if (listBody) listBody.innerHTML = listContent;
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.edit-expense').forEach(button => {
        button.addEventListener('click', (e) => {
            const expenseId = parseInt(button.getAttribute('data-id'));
            editExpense(expenseId);
        });
    });
    
    document.querySelectorAll('.delete-expense').forEach(button => {
        button.addEventListener('click', (e) => {
            const expenseId = parseInt(button.getAttribute('data-id'));
            deleteExpense(expenseId);
        });
    });
}

// Configura os event listeners
function setupEventListeners() {
    // Navegação
    document.getElementById('nav-dashboard').addEventListener('click', () => showSection('dashboard'));
    document.getElementById('nav-products').addEventListener('click', () => showModal('products-modal'));
    document.getElementById('nav-sales').addEventListener('click', () => showModal('sales-modal'));
    document.getElementById('nav-tables').addEventListener('click', () => showModal('tables-modal'));
    document.getElementById('nav-receivables').addEventListener('click', () => showModal('receivables-modal'));
    document.getElementById('nav-expenses').addEventListener('click', () => showModal('expenses-modal'));
    document.getElementById('nav-reports').addEventListener('click', () => showModal('reports-modal'));
    
    // Botões de ação
    document.getElementById('btn-new-product').addEventListener('click', () => {
        showModal('products-modal');
        const tabAddProduct = document.querySelector('[data-tab="tab-add-product"]');
        if (tabAddProduct) tabAddProduct.click();
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) addProductForm.reset();
        const editProductId = document.getElementById('edit-product-id');
        if (editProductId) editProductId.value = '';
        const submitProductBtn = document.getElementById('submit-product-btn');
        if (submitProductBtn) submitProductBtn.textContent = 'Adicionar Produto';
    });
    
    document.getElementById('btn-new-sale').addEventListener('click', () => showModal('sales-modal'));
    document.getElementById('btn-manage-tables').addEventListener('click', () => showModal('tables-modal'));
    document.getElementById('btn-receivables').addEventListener('click', () => showModal('receivables-modal'));
    document.getElementById('btn-expenses').addEventListener('click', () => showModal('expenses-modal'));
    document.getElementById('btn-generate-report').addEventListener('click', () => showModal('reports-modal'));
    
    // Fechar modais
    document.getElementById('close-products').addEventListener('click', () => closeModal('products-modal'));
    document.getElementById('close-sales').addEventListener('click', () => closeModal('sales-modal'));
    document.getElementById('close-tables').addEventListener('click', () => closeModal('tables-modal'));
    document.getElementById('close-receivables').addEventListener('click', () => closeModal('receivables-modal'));
    document.getElementById('close-expenses').addEventListener('click', () => closeModal('expenses-modal'));
    document.getElementById('close-reports').addEventListener('click', () => closeModal('reports-modal'));
    document.getElementById('close-low-stock').addEventListener('click', () => closeModal('low-stock-modal'));
    document.getElementById('close-today-sales').addEventListener('click', () => closeModal('today-sales-modal'));
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabButtons = e.target.parentElement.querySelectorAll('.tab-btn');
            const tabContents = e.target.parentElement.nextElementSibling.querySelectorAll('.tab-content');
            const targetTab = e.target.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Atualizar conteúdo específico da aba
            if (targetTab === 'tab-sales-history') {
                updateSalesHistory();
            } else if (targetTab === 'tab-receivables-list') {
                updateReceivablesTable();
            } else if (targetTab === 'tab-expenses-list') {
                updateExpensesTable();
            }
        });
    });
    
    // Formulários
    document.getElementById('add-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const productId = document.getElementById('edit-product-id').value;
        if (productId) {
            updateProduct(parseInt(productId));
        } else {
            addNewProduct();
        }
    });
    
    document.getElementById('add-table-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewTable();
    });
    
    document.getElementById('receive-payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        receivePaymentSubmit();
    });
    
    document.getElementById('add-expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewExpense();
    });
    
    document.getElementById('add-receivable-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewReceivable();
    });
    
    // Adicionar categoria
    document.getElementById('btn-add-category').addEventListener('click', addNewCategory);
    
    // Adicionar categoria de gastos
    document.getElementById('btn-add-expense-category').addEventListener('click', addNewExpenseCategory);
    
    // Vendas
    document.getElementById('btn-add-to-sale').addEventListener('click', addProductToSale);
    document.getElementById('btn-finalize-sale').addEventListener('click', finalizeSale);
    document.getElementById('sale-date').addEventListener('change', updateSalesHistory);
    
    // Tipo de venda
    document.getElementById('sale-type').addEventListener('change', (e) => {
        const saleType = e.target.value;
        const tableSelection = document.getElementById('table-selection');
        const clientSelection = document.getElementById('client-selection');
        
        if (tableSelection) tableSelection.style.display = saleType === 'table' ? 'block' : 'none';
        if (clientSelection) clientSelection.style.display = saleType === 'credit' ? 'block' : 'none';
    });
    
    // Busca de produtos
    document.getElementById('search-product').addEventListener('input', filterProducts);
    
    // Opções de pagamento
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', (e) => {
            selectPaymentMethod(e.currentTarget.getAttribute('data-method'));
        });
    });
    
    // Campos de pagamento
    document.getElementById('cash-received').addEventListener('input', calculateCashChange);
    document.getElementById('card-fee').addEventListener('input', calculateCardTotal);
    
    // Relatórios
    document.getElementById('btn-generate-pdf').addEventListener('click', generatePDF);
    
    // Backup de dados
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-btn').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        fileInput.onchange = importData;
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
    
    // Limpar vendas do dia
    document.getElementById('btn-clear-sales').addEventListener('click', clearTodaySales);
    
    // Cliques fora do modal para fechar
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Abrir modal de produtos em falta ao clicar no card
    document.getElementById('low-stock-card').addEventListener('click', () => {
        showModal('low-stock-modal');
        updateLowStockTable();
    });
    
    // Abrir modal de vendas do dia ao clicar no card
    document.getElementById('today-sales-card').addEventListener('click', () => {
        showModal('today-sales-modal');
        updateTodaySalesTable();
    });
    
    // Abrir modal de mesas ativas ao clicar no card
    document.getElementById('active-tables-card').addEventListener('click', () => {
        showModal('tables-modal');
    });
    
    // Filtros para produtos em falta
    document.querySelectorAll('.filter-options .btn[data-filter]').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remover classe active de todos os botões
            document.querySelectorAll('.filter-options .btn[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar classe active ao botão clicado
            e.target.classList.add('active');
            
            // Atualizar filtro e tabela
            currentLowStockFilter = e.target.getAttribute('data-filter');
            updateLowStockTable();
        });
    });
    
    // Filtros para vendas do dia
    document.querySelectorAll('.filter-options .btn[data-sales-filter]').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remover classe active de todos os botões
            document.querySelectorAll('.filter-options .btn[data-sales-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar classe active ao botão clicado
            e.target.classList.add('active');
            
            // Atualizar filtro e tabela
            currentSalesFilter = e.target.getAttribute('data-sales-filter');
            updateTodaySalesTable();
        });
    });
}

// Mostrar seção específica
function showSection(section) {
    // Ocultar todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar a seção solicitada
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Atualizar navegação
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(`nav-${section}`).classList.add('active');
}

// Mostrar modal
function showModal(modalId) {
    // Ocultar todos os modais primeiro
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Mostrar o modal solicitado
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        
        // Se for o modal de vendas, atualizar a lista de vendas
        if (modalId === 'sales-modal') {
            updateSalesHistory();
            // Resetar seleção de pagamento
            selectedPaymentMethod = null;
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });
            const paymentDetails = document.getElementById('payment-details');
            if (paymentDetails) paymentDetails.style.display = 'none';
            const paymentMethodDisplay = document.getElementById('payment-method-display');
            if (paymentMethodDisplay) paymentMethodDisplay.textContent = 'Método selecionado: Nenhum';
            updatePaymentSummary();
        }
    }
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Adicionar novo produto
function addNewProduct() {
    const name = document.getElementById('productName');
    const category = document.getElementById('productCategory');
    const quantity = document.getElementById('productQuantity');
    const price = document.getElementById('productPrice');
    const minStock = document.getElementById('productMinStock');
    
    if (!name || !category || !quantity || !price || !minStock) return;
    
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: name.value,
        category: category.value,
        quantity: parseInt(quantity.value),
        price: parseFloat(price.value),
        minStock: parseInt(minStock.value)
    };
    
    products.push(newProduct);
    updateProductsTable();
    updateDashboard();
    
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) addProductForm.reset();
    
    alert('Produto adicionado com sucesso!');
}

// Editar produto
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const editProductId = document.getElementById('edit-product-id');
        const productName = document.getElementById('productName');
        const productCategory = document.getElementById('productCategory');
        const productQuantity = document.getElementById('productQuantity');
        const productPrice = document.getElementById('productPrice');
        const productMinStock = document.getElementById('productMinStock');
        const submitProductBtn = document.getElementById('submit-product-btn');
        
        if (editProductId) editProductId.value = product.id;
        if (productName) productName.value = product.name;
        if (productCategory) productCategory.value = product.category;
        if (productQuantity) productQuantity.value = product.quantity;
        if (productPrice) productPrice.value = product.price;
        if (productMinStock) productMinStock.value = product.minStock;
        
        if (submitProductBtn) submitProductBtn.textContent = 'Atualizar Produto';
        
        // Mostrar modal e mudar para a aba de adicionar/editar produto
        showModal('products-modal');
        const tabAddProduct = document.querySelector('[data-tab="tab-add-product"]');
        if (tabAddProduct) tabAddProduct.click();
    }
}

// Atualizar produto
function updateProduct(productId) {
    const name = document.getElementById('productName');
    const category = document.getElementById('productCategory');
    const quantity = document.getElementById('productQuantity');
    const price = document.getElementById('productPrice');
    const minStock = document.getElementById('productMinStock');
    
    if (!name || !category || !quantity || !price || !minStock) return;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = {
            id: productId,
            name: name.value,
            category: category.value,
            quantity: parseInt(quantity.value),
            price: parseFloat(price.value),
            minStock: parseInt(minStock.value)
        };
        
        updateProductsTable();
        updateDashboard();
        
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) addProductForm.reset();
        
        const editProductId = document.getElementById('edit-product-id');
        if (editProductId) editProductId.value = '';
        
        const submitProductBtn = document.getElementById('submit-product-btn');
        if (submitProductBtn) submitProductBtn.textContent = 'Adicionar Produto';
        
        alert('Produto atualizado com sucesso!');
    }
}

// Excluir produto
function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products = products.filter(p => p.id !== productId);
        updateProductsTable();
        updateDashboard();
        alert('Produto excluído com sucesso!');
    }
}

// Adicionar nova categoria
function addNewCategory() {
    const newCategoryInput = document.getElementById('newCategory');
    if (!newCategoryInput) return;
    
    const newCategory = newCategoryInput.value.trim();
    
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        updateProductSelects();
        newCategoryInput.value = '';
        alert('Categoria adicionada com sucesso!');
    } else if (categories.includes(newCategory)) {
        alert('Esta categoria já existe!');
    } else {
        alert('Por favor, digite um nome válido para a categoria!');
    }
}

// Excluir categoria
function deleteCategory(category) {
    // Verificar se há produtos usando esta categoria
    const productsWithCategory = products.filter(p => p.category === category);
    
    if (productsWithCategory.length > 0) {
        alert(`Não é possível excluir a categoria "${category}" porque existem ${productsWithCategory.length} produto(s) usando ela.`);
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir a categoria "${category}"?`)) {
        categories = categories.filter(c => c !== category);
        updateProductSelects();
        alert('Categoria excluída com sucesso!');
    }
}

// Adicionar nova mesa
function addNewTable() {
    const number = document.getElementById('tableNumber');
    const capacity = document.getElementById('tableCapacity');
    const description = document.getElementById('tableDescription');
    
    if (!number || !capacity) return;
    
    const newTable = {
        id: tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1,
        number: parseInt(number.value),
        capacity: parseInt(capacity.value),
        description: description ? description.value : '',
        status: 'free',
        orders: []
    };
    
    tables.push(newTable);
    updateTablesGrid();
    updateDashboard();
    
    const addTableForm = document.getElementById('add-table-form');
    if (addTableForm) addTableForm.reset();
    
    alert('Mesa adicionada com sucesso!');
}

// Editar mesa
function editTable(tableId) {
    const table = tables.find(t => t.id === tableId);
    if (table) {
        const tableNumber = document.getElementById('tableNumber');
        const tableCapacity = document.getElementById('tableCapacity');
        const tableDescription = document.getElementById('tableDescription');
        
        if (tableNumber) tableNumber.value = table.number;
        if (tableCapacity) tableCapacity.value = table.capacity;
        if (tableDescription) tableDescription.value = table.description || '';
        
        // Mudar para a aba de adicionar mesa
        showModal('tables-modal');
        const tabAddTable = document.querySelector('[data-tab="tab-add-table"]');
        if (tabAddTable) tabAddTable.click();
        
        // Adicionar ID da mesa ao formulário para edição
        const addTableForm = document.getElementById('add-table-form');
        if (addTableForm) {
            addTableForm.dataset.editId = tableId;
            const submitButton = addTableForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.textContent = 'Atualizar Mesa';
        }
    }
}

// Excluir mesa
function deleteTable(tableId) {
    if (confirm('Tem certeza que deseja excluir esta mesa?')) {
        tables = tables.filter(t => t.id !== tableId);
        updateTablesGrid();
        updateDashboard();
        alert('Mesa excluída com sucesso!');
    }
}

// Fechar mesa
function closeTable(tableId) {
    const table = tables.find(t => t.id === tableId);
    if (table && table.status === 'occupied') {
        // Calcular total da mesa
        const total = table.orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
        
        if (confirm(`Fechar mesa ${table.number}? Total: R$ ${total.toFixed(2)}`)) {
            // Registrar venda
            const today = new Date().toISOString().split('T')[0];
            let saleId = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
            
            table.orders.forEach(order => {
                sales.push({
                    id: saleId++,
                    date: today,
                    productId: order.productId,
                    quantity: order.quantity,
                    price: order.price,
                    paymentMethod: 'dinheiro', // Assume pagamento em dinheiro para mesas
                    tableId: tableId
                });
                
                // Atualizar estoque
                const product = products.find(p => p.id === order.productId);
                if (product) {
                    product.quantity -= order.quantity;
                }
            });
            
            // Limpar mesa
            table.orders = [];
            table.status = 'free';
            
            updateTablesGrid();
            updateProductsTable();
            updateDashboard();
            saveDataToLocalStorage();
            
            alert(`Mesa ${table.number} fechada com sucesso! Total: R$ ${total.toFixed(2)}`);
        }
    }
}

// Adicionar nova conta a receber
function addNewReceivable() {
    const client = document.getElementById('receivable-client');
    const amount = document.getElementById('receivable-amount');
    const dueDate = document.getElementById('receivable-due-date');
    
    if (!client || !amount || !dueDate) return;
    
    const newReceivable = {
        id: receivables.length > 0 ? Math.max(...receivables.map(r => r.id)) + 1 : 1,
        client: client.value,
        totalAmount: parseFloat(amount.value),
        receivedAmount: 0,
        dueDate: dueDate.value,
        status: 'pending',
        sales: []
    };
    
    receivables.push(newReceivable);
    updateReceivablesTable();
    updateDashboard();
    
    const addReceivableForm = document.getElementById('add-receivable-form');
    if (addReceivableForm) addReceivableForm.reset();
    
    alert('Conta a receber adicionada com sucesso!');
}

// Receber pagamento
function receivePaymentSubmit() {
    const receivableSelect = document.getElementById('receivable-select');
    const paymentAmount = document.getElementById('payment-amount');
    const paymentDate = document.getElementById('payment-date');
    const paymentMethod = document.getElementById('payment-method');
    
    if (!receivableSelect || !paymentAmount || !paymentDate || !paymentMethod) return;
    
    const receivableId = parseInt(receivableSelect.value);
    const amount = parseFloat(paymentAmount.value);
    
    if (!receivableId || amount <= 0) {
        alert('Selecione uma conta e informe um valor válido!');
        return;
    }
    
    const receivable = receivables.find(r => r.id === receivableId);
    if (receivable) {
        const pendingAmount = receivable.totalAmount - receivable.receivedAmount;
        
        if (amount > pendingAmount) {
            alert(`O valor informado (R$ ${amount.toFixed(2)}) é maior que o valor pendente (R$ ${pendingAmount.toFixed(2)})!`);
            return;
        }
        
        receivable.receivedAmount += amount;
        
        // Atualizar status
        if (receivable.receivedAmount >= receivable.totalAmount) {
            receivable.status = 'paid';
        } else if (new Date(receivable.dueDate) < new Date()) {
            receivable.status = 'overdue';
        } else {
            receivable.status = 'partial';
        }
        
        updateReceivablesTable();
        updateDashboard();
        
        const receivePaymentForm = document.getElementById('receive-payment-form');
        if (receivePaymentForm) receivePaymentForm.reset();
        
        alert(`Pagamento de R$ ${amount.toFixed(2)} registrado com sucesso!`);
    }
}

// Excluir conta a receber
function deleteReceivable(receivableId) {
    if (confirm('Tem certeza que deseja excluir esta conta a receber?')) {
        receivables = receivables.filter(r => r.id !== receivableId);
        updateReceivablesTable();
        updateDashboard();
        alert('Conta a receber excluída com sucesso!');
    }
}

// Adicionar novo gasto
function addNewExpense() {
    const description = document.getElementById('expense-description');
    const category = document.getElementById('expense-category');
    const amount = document.getElementById('expense-amount');
    const date = document.getElementById('expense-date');
    
    if (!description || !category || !amount || !date) return;
    
    const newExpense = {
        id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
        description: description.value,
        category: category.value,
        amount: parseFloat(amount.value),
        date: date.value
    };
    
    expenses.push(newExpense);
    updateExpensesTable();
    updateDashboard();
    
    const addExpenseForm = document.getElementById('add-expense-form');
    if (addExpenseForm) addExpenseForm.reset();
    
    alert('Gasto adicionado com sucesso!');
}

// Editar gasto
function editExpense(expenseId) {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
        const expenseDescription = document.getElementById('expense-description');
        const expenseCategory = document.getElementById('expense-category');
        const expenseAmount = document.getElementById('expense-amount');
        const expenseDate = document.getElementById('expense-date');
        
        if (expenseDescription) expenseDescription.value = expense.description;
        if (expenseCategory) expenseCategory.value = expense.category;
        if (expenseAmount) expenseAmount.value = expense.amount;
        if (expenseDate) expenseDate.value = expense.date;
        
        // Mudar para a aba de adicionar gasto
        showModal('expenses-modal');
        const tabAddExpense = document.querySelector('[data-tab="tab-add-expense"]');
        if (tabAddExpense) tabAddExpense.click();
        
        // Adicionar ID do gasto ao formulário para edição
        const addExpenseForm = document.getElementById('add-expense-form');
        if (addExpenseForm) {
            addExpenseForm.dataset.editId = expenseId;
            const submitButton = addExpenseForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.textContent = 'Atualizar Gasto';
        }
    }
}

// Excluir gasto
function deleteExpense(expenseId) {
    if (confirm('Tem certeza que deseja excluir este gasto?')) {
        expenses = expenses.filter(e => e.id !== expenseId);
        updateExpensesTable();
        updateDashboard();
        alert('Gasto excluído com sucesso!');
    }
}

// Adicionar nova categoria de gastos
function addNewExpenseCategory() {
    const newCategoryInput = document.getElementById('new-expense-category');
    if (!newCategoryInput) return;
    
    const newCategory = newCategoryInput.value.trim();
    
    if (newCategory && !expenseCategories.includes(newCategory)) {
        expenseCategories.push(newCategory);
        updateProductSelects();
        newCategoryInput.value = '';
        alert('Categoria de gastos adicionada com sucesso!');
    } else if (expenseCategories.includes(newCategory)) {
        alert('Esta categoria já existe!');
    } else {
        alert('Por favor, digite um nome válido para a categoria!');
    }
}

// Excluir categoria de gastos
function deleteExpenseCategory(category) {
    // Verificar se há gastos usando esta categoria
    const expensesWithCategory = expenses.filter(e => e.category === category);
    
    if (expensesWithCategory.length > 0) {
        alert(`Não é possível excluir a categoria "${category}" porque existem ${expensesWithCategory.length} gasto(s) usando ela.`);
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir a categoria "${category}"?`)) {
        expenseCategories = expenseCategories.filter(c => c !== category);
        updateProductSelects();
        alert('Categoria de gastos excluída com sucesso!');
    }
}

// Adicionar produto à venda
function addProductToSale() {
    const saleProduct = document.getElementById('sale-product');
    const saleQuantity = document.getElementById('sale-quantity');
    
    if (!saleProduct || !saleQuantity) return;
    
    const productId = parseInt(saleProduct.value);
    const quantity = parseInt(saleQuantity.value);
    
    if (!productId || quantity < 1) {
        alert('Selecione um produto e uma quantidade válida!');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (quantity > product.quantity) {
        alert(`Quantidade solicitada indisponível. Estoque atual: ${product.quantity}`);
        return;
    }
    
    // Verificar se o produto já está na venda atual
    const existingItem = currentSale.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity + quantity > product.quantity) {
            alert(`Quantidade total solicitada indisponível. Estoque atual: ${product.quantity}`);
            return;
        }
        existingItem.quantity += quantity;
    } else {
        currentSale.push({
            productId,
            name: product.name,
            price: product.price,
            quantity
        });
    }
    
    updateSaleItems();
    updatePaymentSummary();
    if (saleQuantity) saleQuantity.value = 1;
}

// Atualizar itens da venda
function updateSaleItems() {
    const saleItemsContainer = document.getElementById('sale-items');
    if (!saleItemsContainer) return;
    
    let itemsHtml = '';
    
    currentSale.forEach((item, index) => {
        const total = item.price * item.quantity;
        itemsHtml += `
            <div class="sale-item">
                <div>${item.name} - ${item.quantity} x R$ ${item.price.toFixed(2)}</div>
                <div>R$ ${total.toFixed(2)} <button class="action-btn delete-btn remove-sale-item" data-index="${index}"><i class="fas fa-trash"></i></button></div>
            </div>
        `;
    });
    
    saleItemsContainer.innerHTML = itemsHtml || '<p>Nenhum item adicionado à venda.</p>';
    
    // Calcular total
    const totalAmount = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const saleTotalAmount = document.getElementById('sale-total-amount');
    if (saleTotalAmount) saleTotalAmount.textContent = `R$ ${totalAmount.toFixed(2)}`;
    
    // Adicionar event listeners aos botões de remover
    document.querySelectorAll('.remove-sale-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            currentSale.splice(index, 1);
            updateSaleItems();
            updatePaymentSummary();
        });
    });
}

// Selecionar método de pagamento
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Remover seleção de todos os botões
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Adicionar seleção ao botão clicado
    const selectedOption = document.querySelector(`.payment-option[data-method="${method}"]`);
    if (selectedOption) selectedOption.classList.add('selected');
    
    // Mostrar detalhes do pagamento selecionado
    const paymentDetails = document.getElementById('payment-details');
    if (paymentDetails) paymentDetails.style.display = 'block';
    
    // Ocultar todos os detalhes primeiro
    const cashDetails = document.getElementById('cash-details');
    const cardDetails = document.getElementById('card-details');
    
    if (cashDetails) cashDetails.style.display = 'none';
    if (cardDetails) cardDetails.style.display = 'none';
    
    // Mostrar detalhes específicos do método selecionado
    if (method === 'dinheiro') {
        if (cashDetails) cashDetails.style.display = 'block';
        const cashReceived = document.getElementById('cash-received');
        if (cashReceived) cashReceived.value = '';
        const cashChange = document.getElementById('cash-change');
        if (cashChange) cashChange.textContent = 'Troco: R$ 0,00';
    } else if (method === 'cartao') {
        if (cardDetails) cardDetails.style.display = 'block';
        const cardFeeInput = document.getElementById('card-fee');
        if (cardFeeInput) cardFeeInput.value = '0';
        calculateCardTotal();
    }
    
    // Atualizar resumo do pagamento
    updatePaymentSummary();
}

// Calcular troco para pagamento em dinheiro
function calculateCashChange() {
    const totalAmount = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cashReceived = parseFloat(document.getElementById('cash-received').value) || 0;
    const change = cashReceived - totalAmount;
    
    const cashChange = document.getElementById('cash-change');
    if (cashChange) cashChange.textContent = `Troco: R$ ${change >= 0 ? change.toFixed(2) : '0,00'}`;
    updatePaymentSummary();
}

// Calcular total com taxa para cartão
function calculateCardTotal() {
    const totalAmount = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cardFee = parseFloat(document.getElementById('card-fee').value) || 0;
    const totalWithFee = totalAmount + cardFee;
    
    const cardTotal = document.getElementById('card-total');
    if (cardTotal) cardTotal.textContent = `Total com Taxa: R$ ${totalWithFee.toFixed(2)}`;
    updatePaymentSummary();
}

// Atualizar resumo do pagamento
function updatePaymentSummary() {
    const totalAmount = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let paymentTotal = totalAmount;
    let methodText = 'Nenhum';
    
    const paymentMethodDisplay = document.getElementById('payment-method-display');
    const paymentTotalElement = document.getElementById('payment-total');
    
    if (selectedPaymentMethod === 'dinheiro') {
        methodText = 'Dinheiro';
        const cashReceived = parseFloat(document.getElementById('cash-received').value) || 0;
        if (paymentTotalElement) paymentTotalElement.textContent = `Valor a pagar: R$ ${totalAmount.toFixed(2)} | Recebido: R$ ${cashReceived.toFixed(2)}`;
    } else if (selectedPaymentMethod === 'pix') {
        methodText = 'PIX';
        if (paymentTotalElement) paymentTotalElement.textContent = `Valor a pagar: R$ ${totalAmount.toFixed(2)}`;
    } else if (selectedPaymentMethod === 'cartao') {
        methodText = 'Cartão';
        paymentTotal = totalAmount + cardFee;
        if (paymentTotalElement) paymentTotalElement.textContent = `Valor a pagar: R$ ${paymentTotal.toFixed(2)} (Produtos: R$ ${totalAmount.toFixed(2)} + Taxa: R$ ${cardFee.toFixed(2)})`;
    } else {
        if (paymentTotalElement) paymentTotalElement.textContent = `Valor a pagar: R$ ${totalAmount.toFixed(2)}`;
    }
    
    if (paymentMethodDisplay) paymentMethodDisplay.textContent = `Método selecionado: ${methodText}`;
}

// Finalizar venda
function finalizeSale() {
    if (currentSale.length === 0) {
        alert('Adicione pelo menos um item à venda!');
        return;
    }
    
    if (!selectedPaymentMethod) {
        alert('Selecione uma forma de pagamento!');
        return;
    }
    
    // Verificar se para dinheiro foi informado o valor recebido
    if (selectedPaymentMethod === 'dinheiro') {
        const cashReceived = parseFloat(document.getElementById('cash-received').value) || 0;
        const totalAmount = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cashReceived < totalAmount) {
            alert(`Valor recebido (R$ ${cashReceived.toFixed(2)}) é menor que o total da venda (R$ ${totalAmount.toFixed(2)})!`);
            return;
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    let saleId = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
    
    // Registrar vendas e atualizar estoque
    currentSale.forEach(item => {
        // Adicionar ao histórico de vendas
        const saleData = {
            id: saleId++,
            date: today,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            paymentMethod: selectedPaymentMethod
        };
        
        // Adicionar taxa do cartão se for pagamento com cartão
        if (selectedPaymentMethod === 'cartao') {
            saleData.cardFee = cardFee;
        }
        
        sales.push(saleData);
        
        // Atualizar estoque
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.quantity -= item.quantity;
        }
    });
    
    const totalSale = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalTotal = totalSale;
    let paymentInfo = '';
    
    if (selectedPaymentMethod === 'cartao') {
        finalTotal = totalSale + cardFee;
        paymentInfo = `Total: R$ ${totalSale.toFixed(2)} + Taxa: R$ ${cardFee.toFixed(2)} = R$ ${finalTotal.toFixed(2)}`;
    } else if (selectedPaymentMethod === 'dinheiro') {
        const cashReceived = parseFloat(document.getElementById('cash-received').value) || 0;
        const change = cashReceived - totalSale;
        paymentInfo = `Recebido: R$ ${cashReceived.toFixed(2)} | Troco: R$ ${change.toFixed(2)}`;
    } else {
        paymentInfo = `Total: R$ ${finalTotal.toFixed(2)}`;
    }
    
    alert(`Venda finalizada com sucesso! ${paymentInfo}`);
    
    // Limpar venda atual
    currentSale = [];
    selectedPaymentMethod = null;
    cardFee = 0;
    updateSaleItems();
    updateProductsTable();
    updateDashboard();
    updateSalesHistory();
    updateProductSelects();
    
    // Limpar campos de pagamento
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const paymentDetails = document.getElementById('payment-details');
    if (paymentDetails) paymentDetails.style.display = 'none';
    
    const cashReceived = document.getElementById('cash-received');
    if (cashReceived) cashReceived.value = '';
    
    const cardFeeInput = document.getElementById('card-fee');
    if (cardFeeInput) cardFeeInput.value = '0';
    
    const paymentMethodDisplay = document.getElementById('payment-method-display');
    if (paymentMethodDisplay) paymentMethodDisplay.textContent = 'Método selecionado: Nenhum';
    
    updatePaymentSummary();
    
    // Salvar dados
    saveDataToLocalStorage();
}

// Atualizar histórico de vendas
function updateSalesHistory() {
    const salesHistoryBody = document.getElementById('sales-history-body');
    if (!salesHistoryBody) return;
    
    const filterDate = document.getElementById('sale-date');
    const filterDateValue = filterDate ? filterDate.value : '';
    
    let filteredSales = sales;
    if (filterDateValue) {
        filteredSales = sales.filter(sale => sale.date === filterDateValue);
    }
    
    let salesHtml = '';
    
    if (filteredSales.length === 0) {
        salesHtml = '<tr><td colspan="6">Nenhuma venda encontrada para esta data.</td></tr>';
    } else {
        filteredSales.forEach(sale => {
            const product = products.find(p => p.id === sale.productId);
            const total = sale.quantity * sale.price;
            
            salesHtml += `
                <tr>
                    <td>${formatDate(sale.date)}</td>
                    <td>${product ? product.name : 'Produto não encontrado'}</td>
                    <td>${sale.quantity}</td>
                    <td>R$ ${sale.price.toFixed(2)}</td>
                    <td>R$ ${total.toFixed(2)}</td>
                    <td>${sale.paymentMethod.toUpperCase()}</td>
                </tr>
            `;
        });
    }
    
    salesHistoryBody.innerHTML = salesHtml;
}

// Atualizar tabela de produtos em falta
function updateLowStockTable() {
    const tableBody = document.getElementById('low-stock-table-body');
    if (!tableBody) return;
    
    let tableContent = '';
    
    // Filtrar produtos baseado no filtro selecionado
    let filteredProducts = [];
    
    if (currentLowStockFilter === 'all') {
        filteredProducts = products.filter(product => 
            product.quantity === 0 || product.quantity <= product.minStock
        );
    } else if (currentLowStockFilter === 'zero') {
        filteredProducts = products.filter(product => product.quantity === 0);
    } else if (currentLowStockFilter === 'low') {
        filteredProducts = products.filter(product => 
            product.quantity > 0 && product.quantity <= product.minStock
        );
    }
    
    if (filteredProducts.length === 0) {
        tableContent = '<tr><td colspan="6">Nenhum produto encontrado com este filtro.</td></tr>';
    } else {
        filteredProducts.forEach(product => {
            const status = product.quantity === 0 ? 'Esgotado' : 'Estoque Baixo';
            const statusClass = product.quantity === 0 ? 'alert' : 'warning';
            
            tableContent += `
                <tr class="${statusClass}">
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.quantity}</td>
                    <td>${product.minStock}</td>
                    <td>${status}</td>
                    <td>
                        <button class="action-btn edit-product" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn delete-product" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = tableContent;
    
    // Adicionar event listeners aos botões de editar e excluir
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            editProduct(productId);
            closeModal('low-stock-modal');
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

// Atualizar tabela de vendas do dia
function updateTodaySalesTable() {
    const tableBody = document.getElementById('today-sales-table-body');
    if (!tableBody) return;
    
    let tableContent = '';
    
    // Obter vendas de hoje
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.date === today);
    
    // Atualizar resumo
    const totalSales = todaySales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    const totalProducts = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    const modalSalesCount = document.getElementById('modal-sales-count');
    const modalSalesTotal = document.getElementById('modal-sales-total');
    const modalProductsSold = document.getElementById('modal-products-sold');
    
    if (modalSalesCount) modalSalesCount.textContent = todaySales.length;
    if (modalSalesTotal) modalSalesTotal.textContent = `R$ ${totalSales.toFixed(2)}`;
    if (modalProductsSold) modalProductsSold.textContent = totalProducts;
    
    if (todaySales.length === 0) {
        tableContent = '<tr><td colspan="6">Nenhuma venda realizada hoje.</td></tr>';
    } else {
        // Agrupar vendas por produto se o filtro for "Por Produto"
        if (currentSalesFilter === 'product') {
            const productSales = {};
            
            todaySales.forEach(sale => {
                const product = products.find(p => p.id === sale.productId);
                if (product) {
                    if (!productSales[product.id]) {
                        productSales[product.id] = {
                            product: product,
                            quantity: 0,
                            total: 0
                        };
                    }
                    productSales[product.id].quantity += sale.quantity;
                    productSales[product.id].total += sale.quantity * sale.price;
                }
            });
            
            for (const productId in productSales) {
                const saleData = productSales[productId];
                tableContent += `
                    <tr>
                        <td>${saleData.product.name}</td>
                        <td>${saleData.product.category}</td>
                        <td>${saleData.quantity}</td>
                        <td>R$ ${saleData.product.price.toFixed(2)}</td>
                        <td>R$ ${saleData.total.toFixed(2)}</td>
                        <td>Várias</td>
                    </tr>
                `;
            }
        } 
        // Agrupar vendas por categoria se o filtro for "Por Categoria"
        else if (currentSalesFilter === 'category') {
            const categorySales = {};
            
            todaySales.forEach(sale => {
                const product = products.find(p => p.id === sale.productId);
                if (product) {
                    if (!categorySales[product.category]) {
                        categorySales[product.category] = {
                            quantity: 0,
                            total: 0
                        };
                    }
                    categorySales[product.category].quantity += sale.quantity;
                    categorySales[product.category].total += sale.quantity * sale.price;
                }
            });
            
            for (const category in categorySales) {
                const saleData = categorySales[category];
                tableContent += `
                    <tr>
                        <td>Vários</td>
                        <td>${category}</td>
                        <td>${saleData.quantity}</td>
                        <td>-</td>
                        <td>R$ ${saleData.total.toFixed(2)}</td>
                        <td>Várias</td>
                    </tr>
                `;
            }
        } 
        // Mostrar todas as vendas individualmente
        else {
            todaySales.forEach(sale => {
                const product = products.find(p => p.id === sale.productId);
                const total = sale.quantity * sale.price;
                
                tableContent += `
                    <tr>
                        <td>${product ? product.name : 'Produto não encontrado'}</td>
                        <td>${product ? product.category : '-'}</td>
                        <td>${sale.quantity}</td>
                        <td>R$ ${sale.price.toFixed(2)}</td>
                        <td>R$ ${total.toFixed(2)}</td>
                        <td>${sale.paymentMethod.toUpperCase()}</td>
                    </tr>
                `;
            });
        }
    }
    
    tableBody.innerHTML = tableContent;
}

// Filtrar produtos na busca
function filterProducts() {
    const searchTerm = document.getElementById('search-product').value.toLowerCase();
    const saleProductSelect = document.getElementById('sale-product');
    
    if (!saleProductSelect) return;
    
    // Mostrar/ocultar opções com base no termo de busca
    for (let i = 0; i < saleProductSelect.options.length; i++) {
        const option = saleProductSelect.options[i];
        if (option.textContent.toLowerCase().includes(searchTerm)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    }
}

// Abrir mesa para venda
function openTableForSale(tableId) {
    const table = tables.find(t => t.id === tableId);
    if (table) {
        table.status = 'occupied';
        updateTablesGrid();
        updateDashboard();
        
        // Abrir modal de vendas para esta mesa
        showModal('sales-modal');
        document.getElementById('sale-type').value = 'table';
        document.getElementById('sale-table').value = tableId;
        document.getElementById('table-selection').style.display = 'block';
    }
}

// Gerar PDF
function generatePDF() {
    const reportType = document.getElementById('report-type');
    const startDate = document.getElementById('report-start-date');
    const endDate = document.getElementById('report-end-date');
    
    const reportTypeValue = reportType ? reportType.value : 'stock';
    const startDateValue = startDate ? startDate.value : '';
    const endDateValue = endDate ? endDate.value : '';
    
    // Usar jsPDF para gerar o PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações do documento
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Conteiner Beer - Relatório', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 22, { align: 'center' });
    
    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 25, 200, 25);
    
    let yPosition = 35;
    
    // Relatório de Estoque
    if (reportTypeValue === 'stock') {
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Estoque', 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        // Tabela de produtos
        const tableData = products.map(product => [
            product.name,
            product.category,
            product.quantity.toString(),
            `R$ ${product.price.toFixed(2)}`,
            product.quantity <= product.minStock ? (product.quantity === 0 ? 'Esgotado' : 'Baixo') : 'Normal'
        ]);
        
        doc.autoTable({
            startY: yPosition,
            head: [['Produto', 'Categoria', 'Quantidade', 'Preço', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [60, 60, 60],
                textColor: [255, 255, 255]
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            }
        });
    }
    // Relatório de Vendas
    else if (reportTypeValue === 'sales') {
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        
        let filteredSales = sales;
        let title = 'Relatório de Vendas - Todos os Períodos';
        
        if (startDateValue && endDateValue) {
            filteredSales = sales.filter(sale => sale.date >= startDateValue && sale.date <= endDateValue);
            title = `Relatório de Vendas - ${formatDate(startDateValue)} à ${formatDate(endDateValue)}`;
        } else if (startDateValue) {
            filteredSales = sales.filter(sale => sale.date >= startDateValue);
            title = `Relatório de Vendas - A partir de ${formatDate(startDateValue)}`;
        } else if (endDateValue) {
            filteredSales = sales.filter(sale => sale.date <= endDateValue);
            title = `Relatório de Vendas - Até ${formatDate(endDateValue)}`;
        }
        
        doc.text(title, 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        if (filteredSales.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhuma venda encontrada para o período selecionado.', 105, yPosition, { align: 'center' });
        } else {
            // Calcular totais
            const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
            const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
            
            doc.setFontSize(12);
            doc.text(`Total de Vendas: R$ ${totalSales.toFixed(2)}`, 14, yPosition);
            doc.text(`Total de Itens Vendidos: ${totalItems}`, 14, yPosition + 7);
            yPosition += 20;
            
            // Tabela de vendas
            const tableData = filteredSales.map(sale => {
                const product = products.find(p => p.id === sale.productId);
                return [
                    formatDate(sale.date),
                    product ? product.name : 'Produto não encontrado',
                    sale.quantity,
                    `R$ ${sale.price.toFixed(2)}`,
                    `R$ ${(sale.quantity * sale.price).toFixed(2)}`,
                    sale.paymentMethod.toUpperCase()
                ];
            });
            
            doc.autoTable({
                startY: yPosition,
                head: [['Data', 'Produto', 'Quantidade', 'Preço', 'Total', 'Pagamento']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [60, 60, 60],
                    textColor: [255, 255, 255]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                }
            });
        }
    }
    // Relatório de Produtos com Estoque Baixo
    else if (reportTypeValue === 'low-stock') {
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Produtos com Estoque Baixo', 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        const lowStockProducts = products.filter(product => 
            product.quantity === 0 || product.quantity <= product.minStock
        );
        
        if (lowStockProducts.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhum produto com estoque baixo ou zerado.', 105, yPosition, { align: 'center' });
        } else {
            const tableData = lowStockProducts.map(product => [
                product.name,
                product.category,
                product.quantity.toString(),
                product.minStock.toString(),
                `R$ ${product.price.toFixed(2)}`,
                product.quantity === 0 ? 'Esgotado' : 'Baixo'
            ]);
            
            doc.autoTable({
                startY: yPosition,
                head: [['Produto', 'Categoria', 'Quantidade', 'Estoque Mínimo', 'Preço', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [60, 60, 60],
                    textColor: [255, 255, 255]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                }
            });
        }
    }
    // Relatório de Vendas do Dia
    else if (reportTypeValue === 'daily-sales') {
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(sale => sale.date === today);
        
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(`Relatório de Vendas do Dia - ${formatDate(today)}`, 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        if (todaySales.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhuma venda realizada hoje.', 105, yPosition, { align: 'center' });
        } else {
            const totalSales = todaySales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
            const totalItems = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
            
            doc.setFontSize(12);
            doc.text(`Total de Vendas: R$ ${totalSales.toFixed(2)}`, 14, yPosition);
            doc.text(`Total de Itens Vendidos: ${totalItems}`, 14, yPosition + 7);
            yPosition += 20;
            
            const tableData = todaySales.map(sale => {
                const product = products.find(p => p.id === sale.productId);
                return [
                    sale.id,
                    product ? product.name : 'Produto não encontrado',
                    product ? product.category : '-',
                    sale.quantity,
                    `R$ ${sale.price.toFixed(2)}`,
                    `R$ ${(sale.quantity * sale.price).toFixed(2)}`,
                    sale.paymentMethod.toUpperCase()
                ];
            });
            
            doc.autoTable({
                startY: yPosition,
                head: [['ID', 'Produto', 'Categoria', 'Quantidade', 'Preço', 'Total', 'Pagamento']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [60, 60, 60],
                    textColor: [255, 255, 255]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                }
            });
        }
    }
    // Relatório de Contas a Receber
    else if (reportTypeValue === 'receivables') {
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Contas a Receber', 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        if (receivables.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhuma conta a receber encontrada.', 105, yPosition, { align: 'center' });
        } else {
            const tableData = receivables.map(receivable => {
                const pendingAmount = receivable.totalAmount - receivable.receivedAmount;
                const status = pendingAmount <= 0 ? 'Paga' : 
                              new Date(receivable.dueDate) < new Date() ? 'Atrasada' : 'Pendente';
                
                return [
                    receivable.client,
                    `R$ ${receivable.totalAmount.toFixed(2)}`,
                    `R$ ${receivable.receivedAmount.toFixed(2)}`,
                    `R$ ${pendingAmount.toFixed(2)}`,
                    formatDate(receivable.dueDate),
                    status
                ];
            });
            
            doc.autoTable({
                startY: yPosition,
                head: [['Cliente', 'Valor Total', 'Valor Recebido', 'Valor Pendente', 'Data Venc.', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [60, 60, 60],
                    textColor: [255, 255, 255]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                }
            });
        }
    }
    // Relatório de Gastos
    else if (reportTypeValue === 'expenses') {
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        
        let filteredExpenses = expenses;
        let title = 'Relatório de Gastos - Todos os Períodos';
        
        if (startDateValue && endDateValue) {
            filteredExpenses = expenses.filter(expense => expense.date >= startDateValue && expense.date <= endDateValue);
            title = `Relatório de Gastos - ${formatDate(startDateValue)} à ${formatDate(endDateValue)}`;
        } else if (startDateValue) {
            filteredExpenses = expenses.filter(expense => expense.date >= startDateValue);
            title = `Relatório de Gastos - A partir de ${formatDate(startDateValue)}`;
        } else if (endDateValue) {
            filteredExpenses = expenses.filter(expense => expense.date <= endDateValue);
            title = `Relatório de Gastos - Até ${formatDate(endDateValue)}`;
        }
        
        doc.text(title, 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        if (filteredExpenses.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhum gasto encontrado para o período selecionado.', 105, yPosition, { align: 'center' });
        } else {
            const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            
            doc.setFontSize(12);
            doc.text(`Total de Gastos: R$ ${totalExpenses.toFixed(2)}`, 14, yPosition);
            yPosition += 15;
            
            const tableData = filteredExpenses.map(expense => [
                expense.description,
                expense.category,
                `R$ ${expense.amount.toFixed(2)}`,
                formatDate(expense.date)
            ]);
            
            doc.autoTable({
                startY: yPosition,
                head: [['Descrição', 'Categoria', 'Valor', 'Data']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [60, 60, 60],
                    textColor: [255, 255, 255]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                }
            });
        }
    }
    // Relatório de Mesas
    else if (reportTypeValue === 'tables') {
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Mesas', 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        if (tables.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhuma mesa cadastrada.', 105, yPosition, { align: 'center' });
        } else {
            const tableData = tables.map(table => {
                const status = table.status === 'free' ? 'Livre' : 
                              table.status === 'occupied' ? 'Ocupada' : 'Reservada';
                
                return [
                    table.number,
                    table.capacity,
                    table.description || '-',
                    status
                ];
            });
            
            doc.autoTable({
                startY: yPosition,
                head: [['Número', 'Capacidade', 'Descrição', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [60, 60, 60],
                    textColor: [255, 255, 255]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                }
            });
        }
    }
    
    // Salvar o PDF
    const fileName = `conteinerbeer-relatorio-${reportTypeValue}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    alert(`Relatório ${reportTypeValue} gerado com sucesso!`);
}

// Inicializar mostrando a seção do dashboard
showSection('dashboard');