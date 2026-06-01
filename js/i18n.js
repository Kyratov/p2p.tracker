function createLanguageSelector() {
    const selector = document.createElement('select');
    selector.className = 'language-select';
    selector.style.cssText = `
        position: fixed;
        top: 12px;
        left: 16px;
        z-index: 100;
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(10px);
        padding: 6px 12px;
        border-radius: 30px;
        border: 1px solid #e5e7eb;
        font-size: 13px;
        cursor: pointer;
    `;
    
    Object.entries(availableLocales).forEach(([code, info]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${info.flag} ${info.name}`;
        if (currentLocale === code) option.selected = true;
        selector.appendChild(option);
    });
    
    selector.onchange = async (e) => {
        await setLocale(e.target.value);
    };
    
    // Тёмная тема
    const observer = new MutationObserver(() => {
        if (document.body.classList.contains('dark')) {
            selector.style.background = 'rgba(30,41,59,0.9)';
            selector.style.borderColor = '#334155';
            selector.style.color = '#f1f5f9';
        } else {
            selector.style.background = 'rgba(255,255,255,0.9)';
            selector.style.borderColor = '#e5e7eb';
            selector.style.color = '#1e293b';
        }
    });
    observer.observe(document.body, { attributes: true });
    
    document.body.appendChild(selector);
    return selector;
}