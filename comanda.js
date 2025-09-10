document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS E ESTADO ---
    let DB = {};
    const elements = {
        tablesGrid: document.getElementById('tablesGrid'),
        orderModal: document.getElementById('orderModal'),
        modalTitle: document.getElementById('orderModal').querySelector('#modalTitle'),
        modalBody: document.getElementById('orderModal').querySelector('#modalBody'),
        modalCloseBtn: document.getElementById('orderModal').querySelector('#modalCloseBtn'),
        modalCancelBtn: document.getElementById('orderModal').querySelector('#modalCancelBtn'),
        closeBillBtn: document.getElementById('orderModal').querySelector('#closeBillBtn'),
        
        // NOVO: Elementos para o Modal de Pagamento
        paymentModal: document.getElementById('paymentModal'),
        paymentModalTitle: document.getElementById('paymentModal').querySelector('#paymentModalTitle'),
        paymentTotalAmount: document.getElementById('paymentModal').querySelector('#paymentTotalAmount'),
        paymentOptionsFooter: document.getElementById('paymentModal').querySelector('#paymentOptionsFooter'),
        paymentCancelBtn: document.getElementById('paymentModal').querySelector('#paymentCancelBtn'),
    };
    let currentTableId = null;

    // --- FUNÇÕES DE DADOS ---
    const loadDB = () => {
        const dbData = localStorage.getItem('conteinerBeerDB');
        DB = dbData ? JSON.parse(dbData) : { products: [], sales: [], tables: [], openOrders: {} };
        if (!DB.openOrders) {
            DB.openOrders = {};
        }
    };

    const saveDB = () => {
        localStorage.setItem('conteinerBeerDB', JSON.stringify(DB));
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') value = 0;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // --- RENDERIZAÇÃO ---
    const renderTablesGrid = () => {
        if (!elements.tablesGrid) return;
        elements.tablesGrid.innerHTML = '';

        if (!DB.tables || DB.tables.length === 0) {
            elements.tablesGrid.innerHTML = '<p>Nenhuma mesa cadastrada. Adicione mesas na área de "Configurações" do sistema principal.</p>';
            return;
        }

        DB.tables.forEach(table => {
            const isOccupied = DB.openOrders[table.id] && DB.openOrders[table.id].items.length > 0;
            const tableEl = document.createElement('div');
            tableEl.className = `table-item ${isOccupied ? 'occupied' : 'free'}`;
            tableEl.dataset.id = table.id;
            tableEl.innerHTML = `
                <span>${table.name}</span>
                <span class="status">${isOccupied ? 'Ocupada' : 'Livre'}</span>
            `;
            tableEl.addEventListener('click', () => openOrderModal(table.id));
            elements.tablesGrid.appendChild(tableEl);
        });
    };

    // --- LÓGICA DO MODAL DE COMANDA ---
    const openOrderModal = (tableId) => {
        currentTableId = tableId;
        const table = DB.tables.find(t => t.id === tableId);
        if (!table) return;

        if (!DB.openOrders[tableId]) {
            DB.openOrders[tableId] = { items: [], total: 0 };
        }

        elements.modalTitle.textContent = `Comanda - ${table.name}`;
        renderOrderModalBody();
        elements.orderModal.classList.remove('hidden');
    };

    const closeOrderModal = () => {
        elements.orderModal.classList.add('hidden');
        currentTableId = null;
    };

    const renderOrderModalBody = () => {
        const order = DB.openOrders[currentTableId];
        const productOptions = DB.products
            .filter(p => p.quantity > 0)
            .map(p => `<option value="${p.id}">${p.name} (Estoque: ${p.quantity})</option>`)
            .join('');

        let itemsHTML = '<p>Nenhum item na comanda.</p>';
        if (order.items.length > 0) {
            itemsHTML = '<ul class="order-item-list">';
            order.items.forEach((item, index) => {
                itemsHTML += `
                    <li>
                        <span>${item.quantity}x ${item.name}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                        <button class="btn btn-sm btn-danger remove-item-btn" data-index="${index}">&times;</button>
                    </li>`;
            });
            itemsHTML += '</ul>';
        }

        const total = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        order.total = total;

        elements.modalBody.innerHTML = `
            ${itemsHTML}
            <hr>
            <div style="text-align: right; font-weight: bold; font-size: 1.2rem; margin: 10px 0;">
                Total: ${formatCurrency(total)}
            </div>
            <hr>
            <h4>Adicionar Item</h4>
            <div class="form-group">
                <label>Produto</label>
                <select id="productSelector">${productOptions}</select>
            </div>
            <div class="form-group">
                <label>Quantidade</label>
                <input type="number" id="quantitySelector" value="1" min="1" class="form-control">
            </div>
            <button class="btn btn-primary" id="addItemBtn">Adicionar à Comanda</button>
        `;
    };

    // --- AÇÕES ---
    const addItemToOrder = () => {
        const productSelector = document.getElementById('productSelector');
        if(!productSelector || !productSelector.value) {
            alert("Não há produtos em estoque para adicionar.");
            return;
        }
        
        const productId = productSelector.value;
        const quantity = parseInt(document.getElementById('quantitySelector').value, 10);
        const product = DB.products.find(p => p.id === Number(productId));

        if (!product || isNaN(quantity) || quantity <= 0) {
            alert("Selecione um produto e uma quantidade válida.");
            return;
        }

        if (quantity > product.quantity) {
            alert(`Estoque insuficiente. Apenas ${product.quantity} unidades disponíveis.`);
            return;
        }

        const order = DB.openOrders[currentTableId];
        
        const existingItem = order.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            order.items.push({
                id: product.id,
                name: product.name,
                price: product.salePrice,
                quantity: quantity
            });
        }
        
        saveDB();
        renderOrderModalBody();
    };

    const removeItemFromOrder = (itemIndex) => {
        const order = DB.openOrders[currentTableId];
        order.items.splice(itemIndex, 1);
        saveDB();
        renderOrderModalBody();
    };

    const showPaymentModal = () => {
        const order = DB.openOrders[currentTableId];
        if (order.items.length === 0) {
            alert("Não é possível fechar uma comanda vazia.");
            return;
        }
        elements.paymentTotalAmount.textContent = formatCurrency(order.total);
        closeOrderModal();
        elements.paymentModal.classList.remove('hidden');
    };

    const closePaymentModal = () => {
        elements.paymentModal.classList.add('hidden');
    };

    const finalizeSale = (paymentMethod) => {
        const order = DB.openOrders[currentTableId];

        const newSale = {
            id: Date.now(),
            date: new Date().toISOString(),
            client: DB.tables.find(t => t.id === currentTableId)?.name || 'Comanda',
            products: order.items,
            total: order.total,
            status: 'Pago',
            paymentMethod: paymentMethod,
            payment: {}
        };

        order.items.forEach(item => {
            const productInDB = DB.products.find(p => p.id === item.id);
            if (productInDB) {
                productInDB.quantity -= item.quantity;
            }
        });

        DB.sales.push(newSale);
        delete DB.openOrders[currentTableId];

        saveDB();
        closePaymentModal();
        renderTablesGrid();
        alert(`Conta fechada com sucesso no valor de ${formatCurrency(newSale.total)} em ${paymentMethod}!`);
    };

    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    const init = () => {
        loadDB();
        renderTablesGrid();

        // Listeners do Modal de Comanda
        elements.modalCloseBtn.addEventListener('click', closeOrderModal);
        elements.modalCancelBtn.addEventListener('click', closeOrderModal);
        elements.closeBillBtn.addEventListener('click', showPaymentModal);

        // Listeners do Modal de Pagamento
        elements.paymentCancelBtn.addEventListener('click', closePaymentModal);
        elements.paymentOptionsFooter.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (target && target.dataset.method) {
                const paymentMethod = target.dataset.method;
                finalizeSale(paymentMethod);
            }
        });

        // Listener dinâmico para ações dentro do modal de comanda
        elements.modalBody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.id === 'addItemBtn') {
                addItemToOrder();
            }
            if (target.classList.contains('remove-item-btn')) {
                const itemIndex = target.dataset.index;
                removeItemFromOrder(itemIndex);
            }
        });
    };

    init();
});
