// ===== LANGUAGE SYSTEM =====
let currentLang = localStorage.getItem('app_language') || 'en';

const translations = {
    ru: {
        profitLabel: 'Реальная прибыль (RUB)',
        recentTitle: 'Последние операции',
        buysLabel: 'Покупок',
        sellsLabel: 'Продаж',
        totalLabel: 'Всего',
        showFullHistory: 'Показать всю историю',
        deleteAllDeals: 'Удалить все сделки',
        historyTitle: 'История сделок',
        searchPlaceholder: 'Поиск по контрагенту или комментарию',
        filterAll: 'Все',
        filterBuys: 'Покупки',
        filterSells: 'Продажи',
        newDealTitle: 'Новая сделка',
        dealTypeLabel: 'Тип операции',
        buyUsdt: 'Покупка USDT',
        sellUsdt: 'Продажа USDT',
        dealDateLabel: 'Дата сделки (ДД.ММ.ГГ)',
        amountLabel: 'Сумма (RUB)',
        usdtAmountLabel: 'Количество USDT',
        priceLabel: 'Цена за 1 USDT',
        paymentMethodLabel: 'Метод оплаты',
        dealNumberLabel: 'Номер сделки',
        receiptLinkLabel: 'Ссылка на чек',
        saveDealBtn: 'Сохранить сделку',
        calcTitle1: 'Узнать количество USDT',
        calcRubLabel: 'Сумма (RUB)',
        calcRateLabel: 'Курс USDT (₽)',
        calculateBtn: 'Рассчитать',
        calcTitle2: 'Узнать курс покупки',
        quickRubLabel: 'Сумма (RUB)',
        quickUsdtLabel: 'Получено USDT',
        calculateRateBtn: 'Узнать цену',
        supportTitle: 'Поддержка',
        supportDesc: 'Напишите нам, если нашли баг или есть идеи',
        openChatBtn: 'Открыть чат',
        languageTitle: 'Язык приложения',
        importTitle: 'Импорт из Telegram Wallet',
        replaceAllBtn: 'Заменить всё',
        addBtn: 'Добавить',
        syncTitle: 'Статус синхронизации',
        syncLoading: 'Загрузка...',
        tabMain: 'Главная',
        tabCreate: 'Создать',
        tabCalculator: 'Калькулятор',
        tabMore: 'Прочее',
        confirmDelete: 'Вы уверены, что хотите удалить ВСЕ сделки?',
        deletedAll: 'Все сделки удалены',
        fillFields: 'Заполните все поля',
        invalidDate: 'Неверный формат даты (ДД.ММ.ГГ)',
        dealAdded: 'Сделка добавлена!',
        deleteConfirm: 'Удалить сделку?',
        fillBoth: 'Заполните оба поля',
        selectFile: 'Выберите Excel-файл из Telegram Wallet',
        fileEmpty: 'Файл пуст или не содержит данных',
        importSuccess: 'Импортировано',
        deals: 'сделок!',
        skipped: 'Пропущено:',
        replaceConfirm: 'Замена удалит все текущие сделки',
        continueText: 'продолжить?',
        syncLocal: 'Данные сохранены локально',
        syncCloud: 'Данные синхронизированы с облаком',
        syncError: 'Ошибка синхронизации',
        syncCheck: 'Проверить синхронизацию',
        storageLocal: 'Локальное хранилище',
        storageCloud: 'Облачное хранилище',
        recommendation: 'Откройте приложение через Telegram для облачной синхронизации'
    },
    en: {
        profitLabel: 'Real Profit (RUB)',
        recentTitle: 'Recent Operations',
        buysLabel: 'Buys',
        sellsLabel: 'Sells',
        totalLabel: 'Total',
        showFullHistory: 'Show Full History',
        deleteAllDeals: 'Delete All Deals',
        historyTitle: 'Deal History',
        searchPlaceholder: 'Search by counterparty or comment',
        filterAll: 'All',
        filterBuys: 'Buys',
        filterSells: 'Sells',
        newDealTitle: 'New Deal',
        dealTypeLabel: 'Deal Type',
        buyUsdt: 'Buy USDT',
        sellUsdt: 'Sell USDT',
        dealDateLabel: 'Deal Date (DD.MM.YY)',
        amountLabel: 'Amount (RUB)',
        usdtAmountLabel: 'USDT Amount',
        priceLabel: 'Price per 1 USDT',
        paymentMethodLabel: 'Payment Method',
        dealNumberLabel: 'Deal Number',
        receiptLinkLabel: 'Payment Receipt Link',
        saveDealBtn: 'Save Deal',
        calcTitle1: 'Calculate USDT Amount',
        calcRubLabel: 'Amount (RUB)',
        calcRateLabel: 'USDT Rate (RUB)',
        calculateBtn: 'Calculate',
        calcTitle2: 'Calculate Purchase Rate',
        quickRubLabel: 'Amount (RUB)',
        quickUsdtLabel: 'USDT Received',
        calculateRateBtn: 'Calculate Rate',
        supportTitle: 'Support',
        supportDesc: 'Contact us if you find a bug or have suggestions',
        openChatBtn: 'Open Chat',
        languageTitle: 'App Language',
        importTitle: 'Import from Telegram Wallet',
        replaceAllBtn: 'Replace All',
        addBtn: 'Add',
        syncTitle: 'Sync Status',
        syncLoading: 'Loading...',
        tabMain: 'Main',
        tabCreate: 'Create',
        tabCalculator: 'Calculator',
        tabMore: 'More',
        confirmDelete: 'Are you sure you want to delete ALL deals?',
        deletedAll: 'All deals have been deleted',
        fillFields: 'Please fill in all fields',
        invalidDate: 'Invalid date format (DD.MM.YY)',
        dealAdded: 'Deal added successfully',
        deleteConfirm: 'Delete this deal?',
        fillBoth: 'Please fill in both fields',
        selectFile: 'Please select an Excel file from Telegram Wallet',
        fileEmpty: 'File is empty or contains no data',
        importSuccess: 'Imported',
        deals: 'deals!',
        skipped: 'Skipped:',
        replaceConfirm: 'Replace will delete all current deals',
        continueText: 'Continue?',
        syncLocal: 'Data saved locally',
        syncCloud: 'Data synced with cloud',
        syncError: 'Sync error',
        syncCheck: 'Check Sync',
        storageLocal: 'Local storage',
        storageCloud: 'Cloud storage',
        recommendation: 'Open this app through Telegram for cloud sync'
    }
};

function updateUILanguage() {
    const t = translations[currentLang];
    
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (t[key]) {
            if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    const idMappings = [
        'profitLabel', 'recentTitle', 'buysLabel', 'sellsLabel', 'totalLabel',
        'historyTitle', 'newDealTitle', 'dealTypeLabel', 'dealDateLabel',
        'amountLabel', 'usdtAmountLabel', 'priceLabel', 'paymentMethodLabel',
        'dealNumberLabel', 'receiptLinkLabel', 'saveDealBtn', 'calcTitle1',
        'calcRubLabel', 'calcRateLabel', 'calcTitle2', 'quickRubLabel',
        'quickUsdtLabel', 'supportTitle', 'supportDesc', 'languageTitle',
        'importTitle', 'syncTitle', 'tabMain', 'tabCreate', 'tabCalculator', 'tabMore'
    ];
    
    idMappings.forEach(id => {
        const el = document.getElementById(id);
        if (el && t[id]) el.textContent = t[id];
    });
    
    const buyOption = document.querySelector('#dealType option[value="buy"]');
    const sellOption = document.querySelector('#dealType option[value="sell"]');
    if (buyOption && t.buyUsdt) buyOption.textContent = t.buyUsdt;
    if (sellOption && t.sellUsdt) sellOption.textContent = t.sellUsdt;
    
    const filterBtns = document.querySelectorAll('[data-history-filter]');
    if (filterBtns.length >= 3) {
        if (t.filterAll) filterBtns[0].textContent = t.filterAll;
        if (t.filterBuys) filterBtns[1].textContent = t.filterBuys;
        if (t.filterSells) filterBtns[2].textContent = t.filterSells;
    }
    
    const searchInput = document.getElementById('historySearchInput');
    if (searchInput && t.searchPlaceholder) searchInput.placeholder = t.searchPlaceholder;
    
    if (typeof updateSyncStatusText === 'function') updateSyncStatusText();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_language', lang);
    
    const ruBtn = document.getElementById('langRuBtn');
    const enBtn = document.getElementById('langEnBtn');
    if (ruBtn) ruBtn.classList.toggle('active', lang === 'ru');
    if (enBtn) enBtn.classList.toggle('active', lang === 'en');
    
    updateUILanguage();
    if (typeof renderAll === 'function') renderAll();
}

function t(key) {
    return translations[currentLang][key] || key;
}