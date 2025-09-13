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
        
        paymentModal: document.getElementById('paymentModal'),
        paymentModalTitle: document.getElementById('paymentModal').querySelector('#paymentModalTitle'),
        paymentTotalAmount: document.getElementById('paymentModal').querySelector('#paymentTotalAmount'),
        paymentOptionsFooter: document.getElementById('paymentModal').querySelector('#paymentOptionsFooter'),
        paymentCancelBtn: document.getElementById('paymentModal').querySelector('#paymentCancelBtn'),

        payByCashBtn: document.getElementById('payByCashBtn'),
        payByCardBtn: document.getElementById('payByCardBtn'),
        payByPixBtn: document.getElementById('payByPixBtn'),

        // NOVO: Inputs de desconto e acréscimo
        comandaDiscountInput: document.getElementById('comandaDiscount'),
        comandaSurchargeInput: document.getElementById('comandaSurcharge'),
    };
    let currentTableId = null;

    // --- FUNÇÕES DE DADOS ---
    const loadDB = () => {
        const dbData = localStorage.getItem('conteinerBeerDB');
        DB = dbData ? JSON.parse(dbData) : { products: [], sales: [], tables: [], openOrders: {}, notifications: [] };
        if (!DB.openOrders) {
            DB.openOrders = {};
        }
        if (!DB.notifications) {
            DB.notifications = [];
        }
    };

    const saveDB = () => {
        localStorage.setItem('conteinerBeerDB', JSON.stringify(DB));
    };

    const parseFormattedNumber = (value) => {
        if (typeof value !== 'string' || value.trim() === '') return 0;
        const cleanedValue = value.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
        return parseFloat(cleanedValue) || 0;
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
    };

    const renderOrderModalBody = () => {
        if (!currentTableId) return;
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

    // NOVO: Função para atualizar o total no modal de pagamento
    const updatePaymentModalTotal = () => {
        const order = DB.openOrders[currentTableId];
        if (!order) return;

        const subtotal = order.total;
        const discount = parseFormattedNumber(elements.comandaDiscountInput.value);
        const surcharge = parseFormattedNumber(elements.comandaSurchargeInput.value);
        const finalTotal = subtotal - discount + surcharge;

        elements.paymentTotalAmount.textContent = formatCurrency(finalTotal);
    };

    const showPaymentModal = () => {
        const order = DB.openOrders[currentTableId];
        if (!order || order.items.length === 0) {
            alert("Não é possível fechar uma comanda vazia.");
            return;
        }
        // Limpa os campos antes de mostrar
        elements.comandaDiscountInput.value = '';
        elements.comandaSurchargeInput.value = '';
        updatePaymentModalTotal(); // Calcula e exibe o total inicial
        closeOrderModal();
        elements.paymentModal.classList.remove('hidden');
    };

    const closePaymentModal = () => {
        elements.paymentModal.classList.add('hidden');
        currentTableId = null; 
    };

    const finalizeSale = (paymentMethod) => {
        const order = DB.openOrders[currentTableId];
        const discount = parseFormattedNumber(elements.comandaDiscountInput.value);
        const surcharge = parseFormattedNumber(elements.comandaSurchargeInput.value);
        const finalTotal = order.total - discount + surcharge;

        const newSale = {
            id: Date.now(),
            date: new Date().toISOString(),
            client: DB.tables.find(t => t.id === currentTableId)?.name || 'Comanda',
            products: order.items.map(item => ({...item})),
            subtotal: order.total,
            discount: discount,
            surcharge: surcharge,
            total: finalTotal,
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

        const notification = {
            id: Date.now(),
            title: 'Venda Registrada (Comanda)',
            message: `Venda da mesa "${newSale.client}" finalizada em ${formatCurrency(newSale.total)}.`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false
        };
        if (!DB.notifications) DB.notifications = [];
        DB.notifications.unshift(notification);

        saveDB();
        closePaymentModal();
        renderTablesGrid();
    };

    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    const init = () => {
        loadDB();
        renderTablesGrid();

        elements.modalCloseBtn.addEventListener('click', () => { closeOrderModal(); currentTableId = null; });
        elements.modalCancelBtn.addEventListener('click', () => { closeOrderModal(); currentTableId = null; });
        elements.closeBillBtn.addEventListener('click', showPaymentModal);

        elements.paymentCancelBtn.addEventListener('click', closePaymentModal);
        
        elements.payByCashBtn?.addEventListener('click', () => finalizeSale('Dinheiro'));
        elements.payByCardBtn?.addEventListener('click', () => finalizeSale('Cartão'));
        elements.payByPixBtn?.addEventListener('click', () => finalizeSale('PIX'));

        // NOVO: Listeners para atualizar o total dinamicamente
        elements.comandaDiscountInput?.addEventListener('input', updatePaymentModalTotal);
        elements.comandaSurchargeInput?.addEventListener('input', updatePaymentModalTotal);

        elements.modalBody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.id === 'addItemBtn') {
                addItemToOrder();
            }
            if (target.classList.contains('remove-item-btn')) {
                const itemIndex = parseInt(target.dataset.index, 10);
                removeItemFromOrder(itemIndex);
            }
        });
    };

    init();
});
