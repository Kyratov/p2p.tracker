// ===== UI RENDERING =====
let historyFilter = 'all';
let historySearchQuery = '';

function setHistoryFilter(filter) { historyFilter = filter; }
function setHistorySearchQuery(query) { historySearchQuery = query; }

function getFilteredHistory() {
    return deals.filter(deal => {
        if(historyFilter !== 'all' && deal.type !== historyFilter) return false;
        if(historySearchQuery) {
            const q = historySearchQuery.toLowerCase();
            const contra = (deal.counterparty || '').toLowerCase();
            const comment = (deal.comment || '').toLowerCase();
            const dealNumber = (deal.dealNumber || '').toLowerCase();
            if(!contra.includes(q) && !comment.includes(q) && !dealNumber.includes(q)) return false;
        }
        return true;
    });
}

function renderDealCard(deal) {
    const price = deal.pricePerUsdt ? deal.pricePerUsdt.toFixed(2) : (deal.amountPaid / deal.usdtAmount).toFixed(2);
    const isBuy = deal.type === 'buy';
    const margin = !isBuy ? calculateSimpleMargin(deal) : null;
    const marginFormatted = margin !== null ? (margin >= 0 ? `+${margin.toFixed(2)} ₽` : `${margin.toFixed(2)} ₽`) : null;
    const marginClass = margin !== null ? (margin >= 0 ? 'positive' : 'negative') : '';
    
    let extraInfoHtml = '';
    const priceLabel = currentLang === 'ru' ? 'Цена за 1 USDT:' : 'Price per 1 USDT:';
    const marginLabel = currentLang === 'ru' ? 'Маржа:' : 'Margin:';
    const paymentLabel = currentLang === 'ru' ? 'Метод оплаты:' : 'Payment method:';
    const dealNumberLabel = currentLang === 'ru' ? 'Номер сделки:' : 'Deal number:';
    const receiptLabel = currentLang === 'ru' ? 'Ссылка:' : 'Receipt link:';
    
    extraInfoHtml += `<div class="info-row"><span class="info-label">${priceLabel}</span><span class="info-value">${price} ₽</span></div>`;
    if (!isBuy && margin !== null) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">${marginLabel}</span><span class="info-value ${marginClass}">${marginFormatted}</span></div>`;
    } else if (!isBuy && margin === null && deals.filter(d => d.type === 'buy').length > 0) {
        const insufficientLabel = currentLang === 'ru' ? 'Недостаточно USDT в портфеле' : 'Insufficient USDT in portfolio';
        extraInfoHtml += `<div class="info-row"><span class="info-label">${marginLabel}</span><span class="info-value">${insufficientLabel}</span></div>`;
    }
    if (deal.counterparty && deal.counterparty.trim()) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">${paymentLabel}</span><span class="info-value">${deal.counterparty}</span></div>`;
    }
    if (deal.dealNumber && deal.dealNumber.trim()) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">${dealNumberLabel}</span><span class="info-value">${deal.dealNumber}</span></div>`;
    }
    if (deal.comment && deal.comment.trim()) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">${receiptLabel}</span><a href="${deal.comment}" target="_blank" class="info-value">${deal.comment.length > 40 ? deal.comment.substring(0,37)+'...' : deal.comment}</a></div>`;
    }
    
    const iconBuy = isBuy ? '🔴' : '🟢';
    const typeName = isBuy ? (currentLang === 'ru' ? 'Покупка USDT' : 'BUY USDT') : (currentLang === 'ru' ? 'Продажа USDT' : 'SELL USDT');
    
    return `<div class="transaction-card">
        <div class="transaction-header">
            <div class="transaction-type">
                <div class="type-icon ${isBuy ? 'buy' : 'sell'}">${iconBuy}</div>
                <div class="type-name">${typeName}</div>
            </div>
            <div class="transaction-date">${deal.customDate || formatDate(deal.date)}</div>
        </div>
        <div class="transaction-body">
            <div class="amount-row">
                <span class="rub-amount">${deal.amountPaid.toLocaleString()} ₽</span>
                <span class="usdt-amount">${deal.usdtAmount.toFixed(2)} USDT</span>
            </div>
            ${extraInfoHtml}
        </div>
        <div class="transaction-footer">
            <button class="action-btn edit" data-id="${deal.id}">${currentLang === 'ru' ? 'Редактировать' : 'Edit'}</button>
            <button class="action-btn delete" data-id="${deal.id}">${currentLang === 'ru' ? 'Удалить' : 'Delete'}</button>
        </div>
    </div>`;
}

function renderRecent() {
    const container = document.getElementById('recentDealsList');
    const emptyText = currentLang === 'ru' ? 'Нет сделок' : 'No deals yet';
    if(!container) return;
    if(deals.length === 0) { container.innerHTML = `<div class="empty-state">${emptyText}</div>`; return; }
    container.innerHTML = deals.slice(0,5).map(d => renderDealCard(d)).join('');
    attachEvents();
}

function renderHistory() {
    const filtered = getFilteredHistory();
    const container = document.getElementById('historyDealsList');
    const emptyText = currentLang === 'ru' ? 'Сделок не найдено' : 'No deals found';
    if(!container) return;
    if(filtered.length === 0) { container.innerHTML = `<div class="empty-state">${emptyText}</div>`; return; }
    container.innerHTML = filtered.map(d => renderDealCard(d)).join('');
    attachHistoryEvents();
}

function attachEvents() {
    const deleteConfirmText = currentLang === 'ru' ? 'Удалить сделку?' : 'Delete this deal?';
    document.querySelectorAll('#recentDealsList .action-btn.delete').forEach(btn => btn.onclick = () => { if(confirm(deleteConfirmText)) deleteDeal(btn.dataset.id); });
    document.querySelectorAll('#recentDealsList .action-btn.edit').forEach(btn => btn.onclick = () => openEditModal(btn.dataset.id));
}

function attachHistoryEvents() {
    const deleteConfirmText = currentLang === 'ru' ? 'Удалить сделку?' : 'Delete this deal?';
    document.querySelectorAll('#historyDealsList .action-btn.delete').forEach(btn => btn.onclick = () => { if(confirm(deleteConfirmText)) deleteDeal(btn.dataset.id); });
    document.querySelectorAll('#historyDealsList .action-btn.edit').forEach(btn => btn.onclick = () => openEditModal(btn.dataset.id));
}

function openEditModal(id) {
    const deal = deals.find(d => d.id == id);
    if(!deal) return;
    
    const modalHtml = `
        <div class="modal" id="editModal">
            <div class="modal-content">
                <h3>${currentLang === 'ru' ? 'Редактирование сделки' : 'Edit Deal'}</h3>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Тип операции' : 'Deal Type'}</label><div class="select-wrapper"><select id="editType"><option value="buy" ${deal.type === 'buy' ? 'selected' : ''}>${currentLang === 'ru' ? 'Покупка USDT' : 'Buy USDT'}</option><option value="sell" ${deal.type === 'sell' ? 'selected' : ''}>${currentLang === 'ru' ? 'Продажа USDT' : 'Sell USDT'}</option></select></div></div>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Дата сделки (ДД.ММ.ГГ)' : 'Deal Date (DD.MM.YY)'}</label><input type="text" id="editDate" value="${deal.customDate || ''}" placeholder="25.05.26" maxlength="10"></div>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Сумма (RUB)' : 'Amount (RUB)'}</label><input type="number" id="editAmount" value="${deal.amountPaid}" step="0.01"></div>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Количество USDT' : 'USDT Amount'}</label><input type="number" id="editUsdt" value="${deal.usdtAmount}" step="0.01"></div>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Цена за 1 USDT' : 'Price per 1 USDT'}</label><input type="number" id="editPrice" value="${deal.pricePerUsdt || (deal.amountPaid/deal.usdtAmount).toFixed(2)}" step="0.01"></div>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Метод оплаты' : 'Payment Method'}</label><input type="text" id="editCounterparty" value="${deal.counterparty || ''}"></div>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Номер сделки' : 'Deal Number'}</label><input type="text" id="editDealNumber" value="${deal.dealNumber || ''}"></div>
                <div class="input-group"><label>${currentLang === 'ru' ? 'Ссылка на чек' : 'Receipt Link'}</label><textarea id="editComment" rows="2">${deal.comment || ''}</textarea></div>
                <button id="saveEditBtn" class="btn" style="margin-bottom: 12px;">${currentLang === 'ru' ? 'Сохранить' : 'Save'}</button>
                <button id="cancelEditBtn" class="center-btn">${currentLang === 'ru' ? 'Отмена' : 'Cancel'}</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('saveEditBtn').onclick = () => {
        const newType = document.getElementById('editType').value;
        const newDate = document.getElementById('editDate').value;
        const newAmount = parseFloat(document.getElementById('editAmount').value);
        const newUsdt = parseFloat(document.getElementById('editUsdt').value);
        let newPrice = document.getElementById('editPrice').value;
        const newCounterparty = document.getElementById('editCounterparty').value;
        const newDealNumber = document.getElementById('editDealNumber').value;
        const newComment = document.getElementById('editComment').value;
        
        if(isNaN(newAmount) || isNaN(newUsdt)) { alert(t('fillFields')); return; }
        if(newDate && !isValidDate(newDate) && newDate !== '') { alert(t('invalidDate')); return; }
        if(newPrice && !isNaN(parseFloat(newPrice))) newPrice = parseFloat(newPrice);
        else newPrice = newAmount / newUsdt;
        
        updateDeal(id, {
            type: newType,
            amountPaid: newAmount,
            usdtAmount: newUsdt,
            pricePerUsdt: parseFloat(newPrice.toFixed(2)),
            counterparty: newCounterparty,
            dealNumber: newDealNumber,
            comment: newComment,
            customDate: newDate
        });
        document.getElementById('editModal').remove();
    };
    
    document.getElementById('cancelEditBtn').onclick = () => {
        document.getElementById('editModal').remove();
    };
    
    const modal = document.getElementById('editModal');
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function renderAll() { 
    calcAnalytics(); 
    renderRecent(); 
}

function handleAddDeal() {
    const type = document.getElementById('dealType').value;
    const amountPaid = parseFloat(document.getElementById('amountPaid').value);
    const usdtAmount = parseFloat(document.getElementById('usdtAmount').value);
    let price = document.getElementById('pricePerUsdt').value;
    const counterparty = document.getElementById('counterparty').value;
    const dealNumber = document.getElementById('dealNumber').value;
    const comment = document.getElementById('comment').value;
    const date = document.getElementById('dealDate').value;
    
    if(isNaN(amountPaid) || isNaN(usdtAmount)) { alert(t('fillFields')); return; }
    if(price && !isNaN(parseFloat(price))) price = parseFloat(price);
    else price = amountPaid / usdtAmount;
    
    addDeal({ type, amountPaid, usdtAmount, pricePerUsdt: parseFloat(price.toFixed(2)), counterparty, dealNumber, comment, customDate: date });
    document.getElementById('dealForm').reset();
    alert(t('dealAdded'));
}

function handleCalculate() {
    const rub = parseFloat(document.getElementById('calcRub').value); 
    const rate = parseFloat(document.getElementById('calcRate').value); 
    if(isNaN(rub) || isNaN(rate)) { alert(t('fillBoth')); return; } 
    document.getElementById('calcResultField').value = `${(rub / rate).toFixed(2)} USDT`;
}

function handleQuickCalculate() {
    const rub = parseFloat(document.getElementById('quickRub').value); 
    const usdt = parseFloat(document.getElementById('quickUsdt').value); 
    if(isNaN(rub) || isNaN(usdt) || usdt === 0) { alert(t('fillBoth')); return; } 
    document.getElementById('quickResultField').value = `${(rub / usdt).toFixed(2)} ₽`;
}