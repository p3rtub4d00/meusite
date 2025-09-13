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
        printBillBtn: document.getElementById('orderModal').querySelector('#printBillBtn'),
        
        paymentModal: document.getElementById('paymentModal'),
        paymentModalTitle: document.getElementById('paymentModal').querySelector('#paymentModalTitle'),
        paymentTotalAmount: document.getElementById('paymentModal').querySelector('#paymentTotalAmount'),
        paymentOptionsFooter: document.getElementById('paymentModal').querySelector('#paymentOptionsFooter'),
        paymentCancelBtn: document.getElementById('paymentModal').querySelector('#paymentCancelBtn'),

        payByCashBtn: document.getElementById('payByCashBtn'),
        payByCardBtn: document.getElementById('payByCardBtn'),
        payByPixBtn: document.getElementById('payByPixBtn'),

        comandaDiscountInput: document.getElementById('comandaDiscount'),
        includeTipCheckbox: document.getElementById('includeTipCheckbox'),
    };
    let currentTableId = null;

    // --- FUNÇÕES DE DADOS ---
    const loadDB = () => {
        const dbData = localStorage.getItem('conteinerBeerDB');
        DB = dbData ? JSON.parse(dbData) : { products: [], sales: [], tables: [], openOrders: {}, notifications: [] };
        if (!DB.openOrders) DB.openOrders = {};
        if (!DB.notifications) DB.notifications = [];
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

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
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
                const surchargeText = item.surcharge ? `<div class="item-surcharge">(+ ${item.surcharge.description}: ${formatCurrency(item.surcharge.value)})</div>` : '';
                itemsHTML += `
                    <li>
                        <div class="item-details">
                            ${item.quantity}x ${item.name}
                            ${surchargeText}
                        </div>
                        <span>${formatCurrency(item.price * item.quantity + (item.surcharge ? item.surcharge.value : 0))}</span>
                        <div>
                            <button class="btn btn-sm btn-warning add-surcharge-btn" data-index="${index}" title="Adicionar Acréscimo">+</button>
                            <button class="btn btn-sm btn-danger remove-item-btn" data-index="${index}" title="Remover Item">&times;</button>
                        </div>
                    </li>`;
            });
            itemsHTML += '</ul>';
        }

        const total = order.items.reduce((acc, item) => acc + (item.price * item.quantity) + (item.surcharge ? item.surcharge.value : 0), 0);
        order.total = total;

        elements.modalBody.innerHTML = `
            ${itemsHTML}
            <hr>
            <div style="text-align: right; font-weight: bold; font-size: 1.2rem; margin: 10px 0;">
                Subtotal: ${formatCurrency(total)}
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

        if (!product || isNaN(quantity) || quantity <= 0) return;
        if (quantity > product.quantity) {
            alert(`Estoque insuficiente. Apenas ${product.quantity} unidades disponíveis.`);
            return;
        }

        const order = DB.openOrders[currentTableId];
        
        const existingItem = order.items.find(item => item.id === product.id && !item.surcharge);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            order.items.push({ id: product.id, name: product.name, price: product.salePrice, quantity: quantity, surcharge: null });
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

    const addSurchargeToItem = (itemIndex) => {
        const description = prompt("Descrição do acréscimo (ex: com gelo de coco):");
        if (!description) return;
        const valueStr = prompt("Valor do acréscimo (ex: 2,50):");
        const value = parseFormattedNumber(valueStr);

        if (isNaN(value) || value <= 0) {
            alert("Valor do acréscimo inválido.");
            return;
        }

        const order = DB.openOrders[currentTableId];
        order.items[itemIndex].surcharge = { description, value };
        saveDB();
        renderOrderModalBody();
    };

    const updatePaymentModalTotal = () => {
        const order = DB.openOrders[currentTableId];
        if (!order) return;

        const subtotal = order.total;
        const discount = parseFormattedNumber(elements.comandaDiscountInput.value);
        let finalTotal = subtotal - discount;

        if(elements.includeTipCheckbox.checked) {
            finalTotal *= 1.10; // Adiciona 10%
        }

        elements.paymentTotalAmount.textContent = formatCurrency(finalTotal);
    };

    const showPaymentModal = () => {
        const order = DB.openOrders[currentTableId];
        if (!order || order.items.length === 0) {
            alert("Não é possível fechar uma comanda vazia.");
            return;
        }
        elements.comandaDiscountInput.value = '';
        elements.includeTipCheckbox.checked = false;
        updatePaymentModalTotal();
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
        const subtotal = order.total;
        let finalTotal = subtotal - discount;
        let tip = 0;

        if(elements.includeTipCheckbox.checked) {
            tip = (subtotal - discount) * 0.10;
            finalTotal += tip;
        }

        const newSale = {
            id: Date.now(),
            date: new Date().toISOString(),
            client: DB.tables.find(t => t.id === currentTableId)?.name || 'Comanda',
            products: order.items.map(item => ({...item})),
            subtotal: subtotal,
            discount: discount,
            surcharge: 0, // Surcharge agora é por item
            tip: tip,
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

    const printBill = () => {
        const order = DB.openOrders[currentTableId];
        const table = DB.tables.find(t => t.id === currentTableId);
        if (!order || order.items.length === 0) {
            alert("Comanda vazia, nada para imprimir.");
            return;
        }

        let printContent = `
            <style>
                body { font-family: monospace; }
                h2, h3 { text-align: center; margin: 5px 0; }
                p { margin: 2px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 2px; }
                .total { font-weight: bold; }
            </style>
            <h2>CONTEINER BEER</h2>
            <h3>Pré-Conta - ${table.name}</h3>
            <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
            <hr>
            <table>
                <thead>
                    <tr><th>Qtd</th><th>Item</th><th>Vl. Unit.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>`;

        order.items.forEach(item => {
            printContent += `
                <tr>
                    <td>${item.quantity}</td>
                    <td>${item.name}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>`;
            if (item.surcharge) {
                 printContent += `
                <tr>
                    <td></td>
                    <td colspan="2" style="font-size: 0.8em;"><em>  + ${item.surcharge.description}</em></td>
                    <td>${formatCurrency(item.surcharge.value)}</td>
                </tr>`;
            }
        });
        
        printContent += `
                </tbody>
            </table>
            <hr>
            <p class="total">Subtotal: ${formatCurrency(order.total)}</p>
            <p class="total">Taxa de Serviço (10%): ${formatCurrency(order.total * 0.1)}</p>
            <h3 class="total">Total com Serviço: ${formatCurrency(order.total * 1.1)}</h3>
            <p style="text-align: center; font-size: 0.8em; margin-top: 10px;">-- Não é documento fiscal --</p>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };


    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    const init = () => {
        loadDB();
        renderTablesGrid();

        elements.modalCloseBtn.addEventListener('click', () => { closeOrderModal(); currentTableId = null; });
        elements.modalCancelBtn.addEventListener('click', () => { closeOrderModal(); currentTableId = null; });
        elements.closeBillBtn.addEventListener('click', showPaymentModal);
        elements.printBillBtn.addEventListener('click', printBill);

        elements.paymentCancelBtn.addEventListener('click', closePaymentModal);
        
        elements.payByCashBtn?.addEventListener('click', () => finalizeSale('Dinheiro'));
        elements.payByCardBtn?.addEventListener('click', () => finalizeSale('Cartão'));
        elements.payByPixBtn?.addEventListener('click', () => finalizeSale('PIX'));

        elements.comandaDiscountInput?.addEventListener('input', updatePaymentModalTotal);
        elements.includeTipCheckbox?.addEventListener('change', updatePaymentModalTotal);

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
            if (target.classList.contains('add-surcharge-btn')) {
                const itemIndex = parseInt(target.dataset.index, 10);
                addSurchargeToItem(itemIndex);
            }
        });
    };

    init();
});
