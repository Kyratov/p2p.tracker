// ===== APP INITIALIZATION =====
async function loadPage(pageName) {
    try {
        const response = await fetch(`pages/${pageName}.html`);
        const html = await response.text();
        return html;
    } catch(e) {
        console.error(`Error loading ${pageName}:`, e);
        return '';
    }
}

async function loadComponent(componentName) {
    try {
        const response = await fetch(`components/${componentName}.html`);
        const html = await response.text();
        return html;
    } catch(e) {
        console.error(`Error loading ${componentName}:`, e);
        return '';
    }
}

function updateSyncStatusText() {
    const t = translations[currentLang];
    const syncTitleEl = document.getElementById('syncTitle');
    if (syncTitleEl && t.syncTitle) syncTitleEl.textContent = t.syncTitle;
    
    const syncLoadingEl = document.querySelector('#syncStatusContainer .sync-title');
    if (syncLoadingEl && t.syncLoading) syncLoadingEl.textContent = t.syncLoading;
    
    const checkBtn = document.getElementById('manualSyncBtn');
    if (checkBtn && t.syncCheck) checkBtn.textContent = t.syncCheck;
}

function showSyncStatus(message, isError = false) {
    const isInTelegram = !!(window.Telegram?.WebApp);
    const cloudAvailable = !!(window.Telegram?.WebApp?.CloudStorage);
    const t = translations[currentLang];
    
    let details = {
        'Telegram WebApp': isInTelegram ? '✅ Available' : '❌ Not available',
        'Cloud Storage': cloudAvailable ? '✅ Available' : '❌ Not available',
        'Deals in DB': deals.length.toString()
    };
    
    const container = document.getElementById('syncStatusContainer');
    if (!container) return;
    
    let icon = '☁️';
    let iconClass = 'info';
    let title = t.syncTitle || 'Sync Status';
    let recommendation = '';
    
    if (!isInTelegram || !cloudAvailable) {
        icon = '💾';
        iconClass = 'warning';
        title = t.storageLocal || 'Local storage';
        recommendation = t.recommendation || 'Open this app through Telegram for cloud sync';
    } else if (isError) {
        icon = '⚠️';
        iconClass = 'warning';
        title = t.syncError || 'Sync error';
    } else {
        icon = '✅';
        iconClass = 'success';
        title = t.syncCloud || 'Data synced with cloud';
    }
    
    let detailsHtml = '<div class="sync-details">';
    for (const [key, value] of Object.entries(details)) {
        detailsHtml += `<div class="sync-detail-row"><span class="sync-detail-label">${key}:</span><span class="sync-detail-value">${value}</span></div>`;
    }
    detailsHtml += '</div>';
    
    let recommendationHtml = recommendation ? `<div class="sync-recommendation">${recommendation}</div>` : '';
    
    container.innerHTML = `
        <div class="sync-header">
            <div class="sync-icon ${iconClass}">${icon}</div>
            <div class="sync-title">${title}</div>
        </div>
        <div class="sync-message">${message}</div>
        ${detailsHtml}
        ${recommendationHtml}
        <button class="sync-btn" id="manualSyncBtn">${t.syncCheck || 'Check Sync'}</button>
    `;
    
    const syncBtn = document.getElementById('manualSyncBtn');
    if (syncBtn) syncBtn.onclick = () => loadDataFromCloud();
}

async function initApp() {
    // Загружаем компоненты
    const tabsHtml = await loadComponent('tabs');
    const modalsHtml = await loadComponent('modals');
    
    document.getElementById('tabsContainer').innerHTML = tabsHtml;
    document.getElementById('modalsContainer').innerHTML = modalsHtml;
    
    // Загружаем страницы
    const homeHtml = await loadPage('home');
    const createHtml = await loadPage('create');
    const calculatorHtml = await loadPage('calculator');
    const moreHtml = await loadPage('more');
    
    const container = document.getElementById('appContainer');
    container.innerHTML = homeHtml + createHtml + calculatorHtml + moreHtml;
    
    // После загрузки DOM инициализируем всё остальное
    initEventListeners();
    initData();
}

function initEventListeners() {
    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });
    
    // Обработчики для модального окна истории
    const showHistoryBtn = document.getElementById('showAllHistoryBtn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyModal = document.getElementById('historyModal');
    
    if (showHistoryBtn) {
        showHistoryBtn.onclick = () => { 
            renderHistory(); 
            if (historyModal) historyModal.style.display = 'flex'; 
        };
    }
    if (closeHistoryBtn) {
        closeHistoryBtn.onclick = () => { if (historyModal) historyModal.style.display = 'none'; };
    }
    if (historyModal) {
        historyModal.onclick = (e) => { if (e.target === historyModal) historyModal.style.display = 'none'; };
    }
    
    // Поиск в истории
    const searchInput = document.getElementById('historySearchInput');
    if (searchInput) {
        searchInput.oninput = (e) => { 
            historySearchQuery = e.target.value;
            renderHistory();
        };
    }
    
    // Фильтры истории
    document.querySelectorAll('[data-history-filter]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('[data-history-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            historyFilter = btn.dataset.historyFilter;
            renderHistory();
        };
    });
    
    // Форма создания сделки
    const dealForm = document.getElementById('dealForm');
    if (dealForm) {
        dealForm.onsubmit = (e) => {
            e.preventDefault();
            handleAddDeal();
        };
    }
    
    // Калькулятор
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.onclick = () => handleCalculate();
    }
    
    const quickCalcBtn = document.getElementById('quickCalcBtn');
    if (quickCalcBtn) {
        quickCalcBtn.onclick = () => handleQuickCalculate();
    }
    
    // Поддержка
    const supportBtn = document.getElementById('supportBtn');
    if (supportBtn) supportBtn.onclick = () => window.open('https://t.me/KyratovVD', '_blank');
    
    // Импорт
    const importReplaceBtn = document.getElementById('importReplaceBtn');
    const importAddBtn = document.getElementById('importAddBtn');
    if (importReplaceBtn) importReplaceBtn.onclick = () => importFromTelegramWallet(true);
    if (importAddBtn) importAddBtn.onclick = () => importFromTelegramWallet(false);
    
    // Очистка данных
    const clearAllBtn = document.getElementById('clearAllDataBtn');
    if (clearAllBtn) clearAllBtn.onclick = () => clearAllDeals();
    
    // Переключение языка
    const langRuBtn = document.getElementById('langRuBtn');
    const langEnBtn = document.getElementById('langEnBtn');
    if (langRuBtn) langRuBtn.onclick = () => setLanguage('ru');
    if (langEnBtn) langEnBtn.onclick = () => setLanguage('en');
    
    // Тема
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
        themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
        themeToggle.onclick = () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
            themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
        };
    }
    
    // Онбординг
    initOnboarding();
}

function initOnboarding() {
    const onbSteps = [
        { icon: '📊', title: currentLang === 'ru' ? 'Добро пожаловать!' : 'Welcome!', desc: currentLang === 'ru' ? 'P2P Tracker Pro — профессиональный помощник для учёта P2P сделок' : 'P2P Tracker Pro — professional P2P deal tracking for Telegram' },
        { icon: '🏠', title: currentLang === 'ru' ? 'Главный экран' : 'Main Screen', desc: currentLang === 'ru' ? 'Прибыль, курсы валют и история сделок' : 'Profit, exchange rates, and deal history' },
        { icon: '➕', title: currentLang === 'ru' ? 'Создание сделки' : 'Create Deal', desc: currentLang === 'ru' ? 'Добавляйте покупки и продажи USDT' : 'Add USDT purchases and sales' },
        { icon: '💰', title: currentLang === 'ru' ? 'Расчёт маржи' : 'Margin Calculation', desc: currentLang === 'ru' ? 'Автоматический расчёт прибыли по каждой сделке' : 'Automatic profit calculation for each deal' },
        { icon: '📋', title: currentLang === 'ru' ? 'История' : 'History', desc: currentLang === 'ru' ? 'Все сделки с поиском и фильтрами' : 'All deals with search and filters' },
        { icon: '📎', title: currentLang === 'ru' ? 'Импорт' : 'Import', desc: currentLang === 'ru' ? 'Импорт сделок из Telegram Wallet' : 'Import deals from Telegram Wallet' }
    ];
    
    let onbStep = 0;
    
    function updateOnboarding() {
        const s = onbSteps[onbStep];
        document.getElementById('onbIcon').textContent = s.icon;
        document.getElementById('onbTitle').textContent = s.title;
        document.getElementById('onbDesc').textContent = s.desc;
        const progress = document.getElementById('onbProgress');
        progress.innerHTML = '';
        onbSteps.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot' + (i === onbStep ? ' active' : '');
            progress.appendChild(dot);
        });
        const nextBtn = document.getElementById('onbNextBtn');
        if (onbStep === onbSteps.length - 1) {
            nextBtn.textContent = currentLang === 'ru' ? 'Начать' : 'Start';
        } else {
            nextBtn.textContent = currentLang === 'ru' ? 'Далее →' : 'Continue →';
        }
    }
    
    document.getElementById('onbNextBtn').onclick = () => {
        if (onbStep < onbSteps.length - 1) {
            onbStep++;
            updateOnboarding();
        } else {
            document.getElementById('onboardingOverlay').classList.add('hide');
            localStorage.setItem('onboarding_done', 'true');
        }
    };
    
    document.getElementById('onbSkipBtn').onclick = () => {
        document.getElementById('onboardingOverlay').classList.add('hide');
        localStorage.setItem('onboarding_done', 'true');
    };
    
    if (!localStorage.getItem('onboarding_done')) {
        setTimeout(() => {
            document.getElementById('onboardingOverlay').classList.remove('hide');
            updateOnboarding();
        }, 300);
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const targetTab = document.getElementById(`${tabId}Tab`);
    if (targetTab) targetTab.classList.add('active');
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active');
}

// Запуск приложения
if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

initApp();