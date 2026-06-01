// ===== DATA MANAGEMENT =====
let deals = [];
let currentUsdRate = 0;
let currentEurRate = 0;
let currentCnyRate = 0;
let currentUserId = null;

function getCurrentUserId() {
    if (currentUserId) return currentUserId;
    if (window.Telegram && Telegram.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe?.user;
        if (user && user.id) { currentUserId = user.id.toString(); return currentUserId; }
    }
    let guestId = localStorage.getItem('p2p_guest_id');
    if (!guestId) { guestId = 'guest_' + Date.now(); localStorage.setItem('p2p_guest_id', guestId); }
    currentUserId = guestId;
    return currentUserId;
}

function getCloudKey() { return `p2p_deals_${getCurrentUserId()}`; }

function sortDealsByDate() {
    deals.sort((a, b) => {
        const dateA = a.customDate ? parseCustomDate(a.customDate) : a.date;
        const dateB = b.customDate ? parseCustomDate(b.customDate) : b.date;
        return dateB - dateA;
    });
}

function parseCustomDate(dateStr) {
    if (!dateStr) return 0;
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        return new Date(2000 + parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
    }
    return 0;
}

function isValidDate(str) { return /^(\d{2})\.(\d{2})\.(\d{2})$/.test(str); }
function formatDate(ts) { return new Date(ts).toLocaleDateString('ru-RU', { day:'numeric', month:'short' }); }

function saveDataToCloud() {
    if (!window.Telegram?.WebApp || !Telegram.WebApp.CloudStorage) {
        localStorage.setItem(getCloudKey(), JSON.stringify(deals));
        if (typeof showSyncStatus === 'function') showSyncStatus(t('syncLocal'), false);
        return;
    }
    
    try {
        Telegram.WebApp.CloudStorage.setItem(getCloudKey(), JSON.stringify(deals), (error) => {
            if (error) {
                localStorage.setItem(getCloudKey(), JSON.stringify(deals));
                if (typeof showSyncStatus === 'function') showSyncStatus(t('syncError') + ', ' + t('syncLocal'), true);
            } else {
                if (typeof showSyncStatus === 'function') showSyncStatus(t('syncCloud'), false);
            }
        });
    } catch(e) {
        localStorage.setItem(getCloudKey(), JSON.stringify(deals));
        if (typeof showSyncStatus === 'function') showSyncStatus(t('syncError'), true);
    }
}

function loadDataFromCloud() {
    if (!window.Telegram?.WebApp || !Telegram.WebApp.CloudStorage) {
        const stored = localStorage.getItem(getCloudKey());
        deals = stored ? JSON.parse(stored) : [];
        sortDealsByDate();
        if (typeof renderAll === 'function') renderAll();
        if (typeof updateStats === 'function') updateStats();
        if (typeof showSyncStatus === 'function') showSyncStatus(t('syncLocal'), false);
        return;
    }
    
    try {
        Telegram.WebApp.CloudStorage.getItem(getCloudKey(), (error, result) => {
            if (error) {
                const stored = localStorage.getItem(getCloudKey());
                deals = stored ? JSON.parse(stored) : [];
                if (typeof showSyncStatus === 'function') showSyncStatus(t('syncError'), true);
            } else if (result && result !== '') {
                deals = JSON.parse(result);
                if (typeof showSyncStatus === 'function') showSyncStatus(`Loaded ${deals.length} deals from cloud`, false);
            } else {
                const stored = localStorage.getItem(getCloudKey());
                if (stored) {
                    deals = JSON.parse(stored);
                    saveDataToCloud();
                    if (typeof showSyncStatus === 'function') showSyncStatus(`Migrated ${deals.length} deals to cloud`, false);
                } else {
                    deals = [];
                    if (typeof showSyncStatus === 'function') showSyncStatus('Cloud is empty, add some deals', false);
                }
            }
            sortDealsByDate();
            if (typeof renderAll === 'function') renderAll();
            if (typeof updateStats === 'function') updateStats();
        });
    } catch(e) {
        const stored = localStorage.getItem(getCloudKey());
        deals = stored ? JSON.parse(stored) : [];
        sortDealsByDate();
        if (typeof renderAll === 'function') renderAll();
        if (typeof updateStats === 'function') updateStats();
        if (typeof showSyncStatus === 'function') showSyncStatus(t('syncError'), true);
    }
}

function saveData() { 
    sortDealsByDate();
    saveDataToCloud();
}

function addDeal(deal) { 
    deal.id = Date.now() + Math.random(); 
    deal.date = Date.now(); 
    deals.unshift(deal); 
    sortDealsByDate();
    saveData(); 
    if (typeof renderAll === 'function') renderAll(); 
    if (typeof updateStats === 'function') updateStats(); 
}

function updateDeal(id, updated) { 
    const i = deals.findIndex(d => d.id == id); 
    if(i !== -1) { 
        deals[i] = {...deals[i], ...updated, id: deals[i].id}; 
        sortDealsByDate();
        saveData(); 
        if (typeof renderAll === 'function') renderAll(); 
        if (typeof updateStats === 'function') updateStats(); 
    } 
}

function deleteDeal(id) { 
    deals = deals.filter(d => d.id != id); 
    sortDealsByDate();
    saveData(); 
    if (typeof renderAll === 'function') renderAll(); 
    if (typeof updateStats === 'function') updateStats(); 
}

function clearAllDeals() {
    if(confirm(t('confirmDelete'))) {
        deals = [];
        saveData();
        if (typeof renderAll === 'function') renderAll();
        if (typeof updateStats === 'function') updateStats();
        alert(t('deletedAll'));
    }
}

function updateStats() {
    const buys = deals.filter(d => d.type === 'buy');
    const sells = deals.filter(d => d.type === 'sell');
    const buysCountEl = document.getElementById('totalBuysCount');
    const sellsCountEl = document.getElementById('totalSellsCount');
    const totalCountEl = document.getElementById('totalOperationsCount');
    if (buysCountEl) buysCountEl.innerText = buys.length;
    if (sellsCountEl) sellsCountEl.innerText = sells.length;
    if (totalCountEl) totalCountEl.innerText = deals.length;
}

function calculateRealProfit() {
    const buys = deals.filter(d => d.type === 'buy').sort((a,b) => a.date - b.date);
    const sells = deals.filter(d => d.type === 'sell').sort((a,b) => a.date - b.date);
    let profit = 0, buyIdx = 0, buyRemaining = buys[0]?.usdtAmount || 0;
    let buyPrice = buys[0]?.pricePerUsdt || (buys[0]?.amountPaid / buys[0]?.usdtAmount) || 0;
    for(const sell of sells) {
        let sellAmount = sell.usdtAmount;
        const sellPrice = sell.pricePerUsdt || sell.amountPaid / sell.usdtAmount;
        while(sellAmount > 0.001 && buyIdx < buys.length) {
            if(buyRemaining <= 0.001) { 
                buyIdx++; 
                if(buyIdx >= buys.length) break; 
                buyRemaining = buys[buyIdx].usdtAmount; 
                buyPrice = buys[buyIdx].pricePerUsdt || buys[buyIdx].amountPaid / buys[buyIdx].usdtAmount; 
            }
            const used = Math.min(sellAmount, buyRemaining);
            profit += (sellPrice - buyPrice) * used;
            sellAmount -= used; 
            buyRemaining -= used;
        }
    }
    return profit;
}

function calcAnalytics() {
    const profit = calculateRealProfit();
    const profitEl = document.getElementById('totalProfitRub');
    if (profitEl) {
        profitEl.innerHTML = profit.toFixed(2) + ' ₽';
        profitEl.style.color = profit >= 0 ? '#10b981' : '#ef4444';
    }
}

function calculateSimpleMargin(deal) {
    if (deal.type !== 'sell') return null;
    const buys = deals.filter(d => d.type === 'buy').sort((a,b) => a.date - b.date);
    if (buys.length === 0) return null;
    
    let remainingAmount = deal.usdtAmount;
    let totalCost = 0;
    let tempBuys = [...deals.filter(d => d.type === 'buy').sort((a,b) => a.date - b.date)];
    
    for(let buy of tempBuys) {
        if(remainingAmount <= 0) break;
        const used = Math.min(remainingAmount, buy.usdtAmount);
        const buyPrice = buy.pricePerUsdt || (buy.amountPaid / buy.usdtAmount);
        totalCost += buyPrice * used;
        remainingAmount -= used;
    }
    
    if(remainingAmount > 0.001) return null;
    
    const avgBuyPrice = totalCost / deal.usdtAmount;
    const sellPrice = deal.pricePerUsdt || (deal.amountPaid / deal.usdtAmount);
    return (sellPrice - avgBuyPrice) * deal.usdtAmount;
}

async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        currentUsdRate = data.rates.RUB;
        currentEurRate = data.rates.EUR;
        currentCnyRate = data.rates.CNY;
        const usdEl = document.getElementById('usdRate');
        const eurEl = document.getElementById('eurRate');
        const cnyEl = document.getElementById('cnyRate');
        if (usdEl) usdEl.innerHTML = currentUsdRate.toFixed(2) + ' ₽';
        if (eurEl) eurEl.innerHTML = (currentUsdRate / currentEurRate).toFixed(2) + ' ₽';
        if (cnyEl) cnyEl.innerHTML = (currentUsdRate / currentCnyRate).toFixed(2) + ' ₽';
        updateLastUpdateTime();
    } catch(e) { console.error(e); }
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const usdUpdate = document.getElementById('usdUpdate');
    const eurUpdate = document.getElementById('eurUpdate');
    const cnyUpdate = document.getElementById('cnyUpdate');
    if (usdUpdate) usdUpdate.innerHTML = timeStr;
    if (eurUpdate) eurUpdate.innerHTML = timeStr;
    if (cnyUpdate) cnyUpdate.innerHTML = timeStr;
}

function initData() {
    fetchExchangeRates();
    loadDataFromCloud();
    setInterval(fetchExchangeRates, 60000);
}