// js/ui.js - Функции для отображения интерфейса и перевода

// Функция для перевода сообщений (если i18n ещё не загружен)
function t(key, params = {}) {
    if (typeof window.t === 'function') {
        return window.t(key, params);
    }
    return key;
}

// Вместо обычного alert - переводимое сообщение
function showMessage(key, params = {}) {
    const message = t(key, params);
    alert(message);
}

// Вместо confirm - переводимое подтверждение
function showConfirm(key, callback) {
    const message = t(key);
    if (confirm(message)) {
        if (callback) callback();
        return true;
    }
    return false;
}

// Успешное уведомление
function showSuccess(key, params = {}) {
    const message = t(key, params);
    alert('✅ ' + message);
}

// Уведомление об ошибке
function showError(key, params = {}) {
    const message = t(key, params);
    alert('❌ ' + message);
}

// Отрисовка карточки сделки (оставляем как есть, но текст переводим через t)
function renderDealCard(deal) {
    const price = deal.pricePerUsdt ? deal.pricePerUsdt.toFixed(2) : (deal.amountPaid / deal.usdtAmount).toFixed(2);
    const isBuy = deal.type === 'buy';
    const margin = !isBuy ? calculateSimpleMargin(deal) : null;
    const marginFormatted = margin !== null ? (margin >= 0 ? `+${margin.toFixed(2)} ₽` : `${margin.toFixed(2)} ₽`) : null;
    const marginClass = margin !== null ? (margin >= 0 ? 'positive' : 'negative') : '';
    
    let extraInfoHtml = '';
    extraInfoHtml += `<div class="info-row"><span class="info-label">💵 ${t('deal.price')}:</span><span class="info-value">${price} ₽</span></div>`;
    
    if (!isBuy && margin !== null) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">💰 ${t('deal.margin')}:</span><span class="info-value ${marginClass}">${marginFormatted}</span></div>`;
    } else if (!isBuy && margin === null && window.deals && window.deals.filter(d => d.type === 'buy').length > 0) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">💰 ${t('deal.margin')}:</span><span class="info-value">${t('deal.insufficient')}</span></div>`;
    } else if (!isBuy && margin === null) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">💰 ${t('deal.margin')}:</span><span class="info-value">${t('deal.noPurchases')}</span></div>`;
    }
    
    if (deal.counterparty && deal.counterparty.trim()) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">💳 ${t('deal.paymentMethod')}:</span><span class="info-value">${deal.counterparty}</span></div>`;
    }
    if (deal.dealNumber && deal.dealNumber.trim()) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">🔢 ${t('deal.dealNumber')}:</span><span class="info-value">${deal.dealNumber}</span></div>`;
    }
    if (deal.comment && deal.comment.trim()) {
        extraInfoHtml += `<div class="info-row"><span class="info-label">📎 ${t('deal.checkLink')}:</span><a href="${deal.comment}" target="_blank" class="info-value">${deal.comment.length > 40 ? deal.comment.substring(0,37)+'...' : deal.comment}</a></div>`;
    }
    
    const iconBuy = isBuy ? '🔴' : '🟢';
    const typeName = isBuy ? t('deal.buy') : t('deal.sell');
    
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
            <button class="action-btn edit" data-id="${deal.id}">✏️ ${t('deal.edit')}</button>
            <button class="action-btn delete" data-id="${deal.id}">🗑️ ${t('deal.delete')}</button>
        </div>
    </div>`;
}