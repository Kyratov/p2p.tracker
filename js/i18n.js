// js/i18n.js - Система мультиязычности

const translations = {};

// Доступные языки
const availableLocales = {
    'ru': { name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    'en': { name: 'English', flag: '🇬🇧', dir: 'ltr' },
    'tr': { name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
    'es': { name: 'Español', flag: '🇪🇸', dir: 'ltr' }
};

let currentLocale = 'ru';

// Загрузка файла перевода
async function loadLocale(locale) {
    try {
        const response = await fetch(`js/locales/${locale}.json`);
        if (!response.ok) throw new Error(`Failed to load ${locale}`);
        translations[locale] = await response.json();
        return true;
    } catch (error) {
        console.error(`Error loading locale ${locale}:`, error);
        return false;
    }
}

// Загрузка всех языков
async function loadAllLocales() {
    const promises = Object.keys(availableLocales).map(locale => loadLocale(locale));
    await Promise.all(promises);
}

// Получение перевода по ключу
function t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[currentLocale];
    
    if (!value) return key;
    
    for (const k of keys) {
        if (value[k] === undefined) return key;
        value = value[k];
    }
    
    if (typeof value === 'string' && params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    }
    
    return value;
}

// Установка текущего языка
async function setLocale(locale) {
    if (!availableLocales[locale]) return false;
    
    if (!translations[locale]) {
        const loaded = await loadLocale(locale);
        if (!loaded) return false;
    }
    
    currentLocale = locale;
    localStorage.setItem('app_locale', locale);
    
    // Обновляем направление текста для RTL языков
    const dir = availableLocales[locale].dir;
    document.body.style.direction = dir;
    document.body.setAttribute('dir', dir);
    
    // Обновляем все тексты на странице
    updateAllTexts();
    
    return true;
}

// Обновление всех текстов на странице
function updateAllTexts() {
    // Обновляем элементы с атрибутом data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        if (translation !== key) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.getAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.value = translation;
                }
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Обновляем плейсхолдеры
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation !== key) {
            element.placeholder = translation;
        }
    });
    
    // Перерисовываем динамический контент
    if (typeof renderAll === 'function') {
        renderAll();
    }
    
    // Обновляем статус синхронизации
    if (typeof showSyncStatus === 'function') {
        showSyncStatus(t('sync.savedLocal'), false);
    }
}

// Создание селектора языка
function createLanguageSelector() {
    const selector = document.createElement('div');
    selector.className = 'language-selector';
    selector.style.cssText = `
        position: fixed;
        top: 12px;
        left: 16px;
        z-index: 100;
        display: flex;
        gap: 4px;
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(10px);
        padding: 4px 8px;
        border-radius: 40px;
        border: 1px solid #e5e7eb;
    `;
    
    Object.entries(availableLocales).forEach(([code, info]) => {
        const btn = document.createElement('button');
        btn.textContent = info.flag;
        btn.title = info.name;
        btn.style.cssText = `
            background: ${currentLocale === code ? '#3b82f6' : 'transparent'};
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 30px;
            transition: 0.2s;
        `;
        btn.onclick = async () => {
            await setLocale(code);
            // Обновляем стиль кнопок
            selector.querySelectorAll('button').forEach(b => {
                b.style.background = 'transparent';
            });
            btn.style.background = '#3b82f6';
        };
        selector.appendChild(btn);
    });
    
    // Добавляем тёмную тему для селектора
    const observer = new MutationObserver(() => {
        if (document.body.classList.contains('dark')) {
            selector.style.background = 'rgba(30,41,59,0.9)';
            selector.style.borderColor = '#334155';
        } else {
            selector.style.background = 'rgba(255,255,255,0.9)';
            selector.style.borderColor = '#e5e7eb';
        }
    });
    observer.observe(document.body, { attributes: true });
    
    document.body.appendChild(selector);
    return selector;
}

// Инициализация
async function initI18n() {
    const savedLocale = localStorage.getItem('app_locale') || 'ru';
    
    await loadAllLocales();
    await setLocale(savedLocale);
    
    createLanguageSelector();
}

// Экспорт функций
window.t = t;
window.setLocale = setLocale;
window.initI18n = initI18n;