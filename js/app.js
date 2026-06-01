// js/app.js - Основная логика приложения

// Обработчик формы создания сделки
document.getElementById('dealForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const type = document.getElementById('dealType').value;
    const amountPaid = parseFloat(document.getElementById('amountPaid').value);
    const usdtAmount = parseFloat(document.getElementById('usdtAmount').value);
    let price = document.getElementById('pricePerUsdt').value;
    const counterparty = document.getElementById('counterparty').value;
    const dealNumber = document.getElementById('dealNumber').value;
    const comment = document.getElementById('comment').value;
    const date = document.getElementById('dealDate').value;
    
    // ЗАМЕНЕНО: alert на showMessage
    if(isNaN(amountPaid) || isNaN(usdtAmount)) { 
        showMessage('create.fillFields');
        return; 
    }
    
    if(price && !isNaN(parseFloat(price))) price = parseFloat(price);
    else price = amountPaid / usdtAmount;
    
    addDeal({ 
        type, 
        amountPaid, 
        usdtAmount, 
        pricePerUsdt: parseFloat(price.toFixed(2)), 
        counterparty, 
        dealNumber, 
        comment, 
        customDate: date 
    });
    
    document.getElementById('dealForm').reset();
    
    // ЗАМЕНЕНО: alert на showSuccess
    showSuccess('create.success');
});

// Обработчик калькулятора 1
document.getElementById('calcBtn').addEventListener('click', () => { 
    const rub = parseFloat(document.getElementById('calcRub').value); 
    const rate = parseFloat(document.getElementById('calcRate').value); 
    
    // ЗАМЕНЕНО
    if(isNaN(rub) || isNaN(rate)) { 
        showMessage('calculator.fillBoth'); 
        return; 
    } 
    
    const result = (rub / rate).toFixed(2);
    document.getElementById('calcResultField').value = `${t('calculator.result')} ${result} USDT`;
});

// Обработчик калькулятора 2
document.getElementById('quickCalcBtn').addEventListener('click', () => { 
    const rub = parseFloat(document.getElementById('quickRub').value); 
    const usdt = parseFloat(document.getElementById('quickUsdt').value); 
    
    // ЗАМЕНЕНО
    if(isNaN(rub) || isNaN(usdt) || usdt === 0) { 
        showMessage('calculator.fillBoth'); 
        return; 
    } 
    
    const result = (rub / usdt).toFixed(2);
    document.getElementById('quickResultField').value = `${t('calculator.secondResult')} ${result} ₽`;
});

// Кнопка очистки всех данных - ЗАМЕНЕНО
document.getElementById('clearAllDataBtn').addEventListener('click', () => {
    showConfirm('home.deleteAllConfirm', () => {
        clearAllDeals();
    });
});