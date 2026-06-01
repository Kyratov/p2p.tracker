// ===== IMPORT FROM TELEGRAM WALLET =====
function importFromTelegramWallet(replaceMode) {
    const fileInput = document.getElementById('telegramImportFile');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert(t('selectFile'));
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
        
        if (!rows || rows.length < 2) {
            alert(t('fileEmpty'));
            return;
        }
        
        const headers = rows[0].map(cell => String(cell || '').toLowerCase().trim());
        
        const colIndex = {
            adType: headers.findIndex(h => h.includes('ad type') || h.includes('тип объявления')),
            role: headers.findIndex(h => h.includes('role') || h.includes('роль')),
            orderNumber: headers.findIndex(h => h.includes('order number') || h.includes('номер заказа')),
            netCrypto: headers.findIndex(h => h.includes('net crypto') || h.includes('криптовалюта нетто')),
            fiatAmount: headers.findIndex(h => h.includes('fiat amount') || h.includes('фиатная сумма')),
            paymentMethod: headers.findIndex(h => h.includes('payment method') || h.includes('способ оплаты')),
            completionTime: headers.findIndex(h => h.includes('completion time') || h.includes('время завершения'))
        };
        
        function parseDateFromText(dateStr) {
            if (!dateStr) return '';
            const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1].slice(-2)}`;
            const dotMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{2})/);
            if (dotMatch) return `${dotMatch[1]}.${dotMatch[2]}.${dotMatch[3]}`;
            return '';
        }
        
        const newDeals = [];
        let importErrors = 0;
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            
            let adType = colIndex.adType >= 0 ? String(row[colIndex.adType] || '').toUpperCase() : '';
            let role = colIndex.role >= 0 ? String(row[colIndex.role] || '').toUpperCase() : '';
            
            let type = null;
            if (adType === 'SALE' && role === 'SELLER') type = 'sell';
            else if (adType === 'PURCHASE' && role === 'BUYER') type = 'buy';
            else if (adType === 'SALE' && role === 'BUYER') type = 'buy';
            else if (adType === 'PURCHASE' && role === 'SELLER') type = 'sell';
            else if (adType === 'BUY' && role === 'BUYER') type = 'buy';
            else if (adType === 'SELL' && role === 'SELLER') type = 'sell';
            
            if (!type) {
                importErrors++;
                continue;
            }
            
            let usdtAmount = colIndex.netCrypto >= 0 ? parseFloat(row[colIndex.netCrypto]) : 0;
            let amountPaid = colIndex.fiatAmount >= 0 ? parseFloat(row[colIndex.fiatAmount]) : 0;
            let counterparty = colIndex.paymentMethod >= 0 ? String(row[colIndex.paymentMethod] || '') : '';
            counterparty = counterparty.replace(/ \(ex\..*?\)/g, '').replace(/ \(ex\./g, '').replace(/\)/g, '').trim();
            let dealNumber = colIndex.orderNumber >= 0 ? String(row[colIndex.orderNumber] || '') : '';
            let pricePerUsdt = usdtAmount > 0 ? amountPaid / usdtAmount : 0;
            let completionRaw = colIndex.completionTime >= 0 ? String(row[colIndex.completionTime] || '') : '';
            let customDate = parseDateFromText(completionRaw);
            
            if (isNaN(usdtAmount) || isNaN(amountPaid) || usdtAmount <= 0 || amountPaid <= 0) {
                importErrors++;
                continue;
            }
            
            newDeals.push({
                type: type,
                amountPaid: amountPaid,
                usdtAmount: usdtAmount,
                pricePerUsdt: parseFloat(pricePerUsdt.toFixed(2)),
                counterparty: counterparty,
                dealNumber: dealNumber,
                comment: '',
                customDate: customDate || ''
            });
        }
        
        if (newDeals.length === 0) {
            alert(`Failed to recognize deals. Errors: ${importErrors}. Please check file format.`);
            return;
        }
        
        if (replaceMode) {
            const confirmMsg = `${t('replaceConfirm')} (${deals.length}) ${t('continueText')} ${newDeals.length} ${t('deals')}`;
            if (confirm(confirmMsg)) {
                while(deals.length) deleteDeal(deals[0].id);
            } else {
                return;
            }
        }
        
        for (const deal of newDeals) addDeal(deal);
        alert(`${t('importSuccess')} ${newDeals.length} ${t('deals')} ${t('skipped')}: ${importErrors}`);
        fileInput.value = '';
    };
    
    reader.readAsArrayBuffer(file);
}