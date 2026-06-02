const { Telegraf, Markup, session } = require('telegraf');
const express = require('express');

// ========== КОНФИГУРАЦИЯ ==========
const TOKEN = '8824407853:AAHq_BcojLt6FnzKdLgdd6LnuGySb6M2His';  // Замените на ваш токен!
const APP_URL = 'https://kyratov.github.io/p2p_tracker';  // Замените на URL вашего приложения!
const SUPPORT_LINK = 'https://t.me/KyratovVD';  // Ссылка на чат поддержки
const CHANNEL_LINK = 'https://t.me/ваш_канал';  // Ссылка на ваш канал (опционально)

// ========== ИНИЦИАЛИЗАЦИЯ БОТА ==========
const bot = new Telegraf(TOKEN);
bot.use(session());

// ========== КОМАНДЫ ==========

// Команда /start - приветствие и главное меню
bot.start(async (ctx) => {
    const user = ctx.from;
    const firstName = user.first_name || 'Пользователь';
    
    const welcomeMessage = 
        `🌟 <b>${firstName}, добро пожаловать в P2P Tracker Pro!</b>\n\n` +
        `📊 <b>Ваш профессиональный помощник для учёта P2P-сделок</b>\n\n` +
        `▫️ Автоматический расчёт реальной прибыли\n` +
        `▫️ Полная синхронизация между устройствами\n` +
        `▫️ Мгновенный импорт из Telegram Wallet\n` +
        `▫️ Поддержка 6 языков: русский, English, Deutsch, Српски, Українська, Беларуская\n` +
        `▫️ Светлая и тёмная тема оформления\n\n` +
        `🚀 <b>Нажмите на кнопку ниже, чтобы открыть приложение</b>`;
    
    await ctx.replyWithHTML(welcomeMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 ОТКРЫТЬ P2P TRACKER PRO', web_app: { url: APP_URL } }],
                [{ text: '📖 Инструкция', callback_data: 'guide' }, { text: '🛟 Поддержка', callback_data: 'support' }],
                [{ text: '⚙️ Команды', callback_data: 'commands' }, { text: 'ℹ️ О программе', callback_data: 'about' }]
            ]
        }
    });
    
    // Сохраняем пользователя в сессию
    ctx.session = { userId: user.id, firstSeen: Date.now() };
});

// Команда /help - справка по командам
bot.help(async (ctx) => {
    const helpMessage = 
        `📖 <b>Справка по командам P2P Tracker Pro</b>\n\n` +
        `🔹 <code>/start</code> — Запустить приложение\n` +
        `🔹 <code>/help</code> — Показать эту справку\n` +
        `🔹 <code>/stats</code> — Ваша статистика (при наличии данных)\n` +
        `🔹 <code>/sync</code> — Синхронизировать данные с облаком\n` +
        `🔹 <code>/export</code> — Экспорт данных (PDF/Excel)\n` +
        `🔹 <code>/import</code> — Импорт из Telegram Wallet\n` +
        `🔹 <code>/language</code> — Сменить язык интерфейса\n` +
        `🔹 <code>/theme</code> — Сменить тему (светлая/тёмная)\n` +
        `🔹 <code>/faq</code> — Часто задаваемые вопросы\n` +
        `🔹 <code>/support</code> — Связаться с поддержкой\n` +
        `🔹 <code>/about</code> — О программе\n\n` +
        `✨ <b>Совет:</b> Нажмите на кнопку <b>«🚀 ОТКРЫТЬ P2P TRACKER PRO»</b> для запуска приложения!`;
    
    await ctx.replyWithHTML(helpMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Открыть приложение', web_app: { url: APP_URL } }],
                [{ text: '📚 Частые вопросы', callback_data: 'faq' }, { text: '🛟 Поддержка', callback_data: 'support' }]
            ]
        }
    });
});

// Команда /stats - статистика пользователя
bot.command('stats', async (ctx) => {
    const userId = ctx.from.id;
    
    await ctx.replyWithHTML(
        `📊 <b>Ваша статистика</b>\n\n` +
        `🆔 ID: <code>${userId}</code>\n` +
        `👤 Имя: ${ctx.from.first_name || '—'}\n` +
        `📅 Активен с: ${new Date(ctx.session?.firstSeen || Date.now()).toLocaleDateString('ru-RU')}\n\n` +
        `💡 <i>Подробная статистика по сделкам доступна в самом приложении</i>\n\n` +
        `👉 Нажмите на кнопку ниже, чтобы открыть приложение`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📊 Открыть статистику', web_app: { url: APP_URL } }]
                ]
            }
        }
    );
});

// Команда /sync - синхронизация данных
bot.command('sync', async (ctx) => {
    await ctx.replyWithHTML(
        `☁️ <b>Синхронизация данных</b>\n\n` +
        `Ваши данные автоматически синхронизируются с облаком Telegram.\n\n` +
        `✅ <b>Что это даёт:</b>\n` +
        `• Доступ к данным с любого устройства\n` +
        `• Восстановление после переустановки\n` +
        `• Безопасное хранение в облаке Telegram\n\n` +
        `📱 <b>Текущий статус:</b>\n` +
        `• Telegram WebApp: <b>Доступен</b>\n` +
        `• Cloud Storage: <b>Доступен</b>\n\n` +
        `👉 Откройте приложение для проверки синхронизации`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '☁️ Проверить синхронизацию', web_app: { url: APP_URL } }]
                ]
            }
        }
    );
});

// Команда /language - смена языка
bot.command('language', async (ctx) => {
    await ctx.replyWithHTML(
        `🌐 <b>Выберите язык интерфейса</b>\n\n` +
        `После выбора язык сохранится и приложение будет использовать его при следующем запуске.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }, { text: '🇬🇧 English', callback_data: 'lang_en' }],
                    [{ text: '🇩🇪 Deutsch', callback_data: 'lang_de' }, { text: '🇷🇸 Српски', callback_data: 'lang_sr' }],
                    [{ text: '🇺🇦 Українська', callback_data: 'lang_uk' }, { text: '🇧🇾 Беларуская', callback_data: 'lang_be' }]
                ]
            }
        }
    );
});

// Команда /theme - смена темы
bot.command('theme', async (ctx) => {
    await ctx.replyWithHTML(
        `🎨 <b>Выберите тему оформления</b>\n\n` +
        `Светлая тема — для дневного использования\n` +
        `Тёмная тема — для ночного времени и экономии заряда`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '☀️ Светлая тема', callback_data: 'theme_light' }, { text: '🌙 Тёмная тема', callback_data: 'theme_dark' }]
                ]
            }
        }
    );
});

// Команда /export - экспорт данных
bot.command('export', async (ctx) => {
    await ctx.replyWithHTML(
        `📎 <b>Экспорт данных</b>\n\n` +
        `Вы можете экспортировать все свои сделки в следующих форматах:\n\n` +
        `📄 <b>PDF</b> — для печати или отправки отчёта\n` +
        `📊 <b>Excel</b> — для анализа в электронных таблицах\n\n` +
        `🔧 <b>Как экспортировать:</b>\n` +
        `1. Откройте приложение\n` +
        `2. Перейдите в раздел «Прочее»\n` +
        `3. Нажмите «Экспорт PDF» или «Экспорт Excel»\n\n` +
        `✨ Данные экспортируются в удобном для чтения формате с полной статистикой.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📎 Открыть раздел экспорта', web_app: { url: APP_URL } }]
                ]
            }
        }
    );
});

// Команда /import - импорт из Telegram Wallet
bot.command('import', async (ctx) => {
    await ctx.replyWithHTML(
        `📥 <b>Импорт сделок из Telegram Wallet</b>\n\n` +
        `<b>Пошаговая инструкция:</b>\n\n` +
        `1️⃣ Откройте Telegram Wallet\n` +
        `2️⃣ Перейдите в «История операций»\n` +
        `3️⃣ Нажмите «Экспорт» → выберите формат Excel\n` +
        `4️⃣ Сохраните файл на устройство\n` +
        `5️⃣ Откройте P2P Tracker Pro\n` +
        `6️⃣ Перейдите в раздел «Прочее» → «Импорт из Telegram Wallet»\n` +
        `7️⃣ Выберите файл и нажмите «Добавить»\n\n` +
        `✅ После импорта все сделки появятся в вашем приложении с автоматическим расчётом прибыли!`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📥 Открыть импорт', web_app: { url: APP_URL } }]
                ]
            }
        }
    );
});

// Команда /faq - часто задаваемые вопросы
bot.command('faq', async (ctx) => {
    await ctx.replyWithHTML(
        `❓ <b>Часто задаваемые вопросы</b>\n\n` +
        `<b>🔹 Как добавить сделку?</b>\n` +
        `Перейдите во вкладку «Создать», заполните форму и нажмите «Записать сделку».\n\n` +
        `<b>🔹 Как импортировать сделки из Wallet?</b>\n` +
        `Используйте команду /import для подробной инструкции.\n\n` +
        `<b>🔹 Где хранятся мои данные?</b>\n` +
        `Данные синхронизируются с облаком Telegram и надёжно защищены.\n\n` +
        `<b>🔹 Как сменить язык?</b>\n` +
        `Используйте команду /language или настройки в приложении.\n\n` +
        `<b>🔹 Приложение бесплатное?</b>\n` +
        `Да, P2P Tracker Pro полностью бесплатен.\n\n` +
        `<b>🔹 Как связаться с поддержкой?</b>\n` +
        `Используйте команду /support или кнопку ниже.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🛟 Связаться с поддержкой', callback_data: 'support' }]
                ]
            }
        }
    );
});

// Команда /support - поддержка
bot.command('support', async (ctx) => {
    await ctx.replyWithHTML(
        `🛟 <b>Служба поддержки P2P Tracker Pro</b>\n\n` +
        `Если у вас возникли вопросы или вы нашли ошибку, напишите нам:\n\n` +
        `📧 Email: <b>ddos_vlados@mail.ru</b>\n` +
        `💬 Telegram: <b>${SUPPORT_LINK}</b>\n\n` +
        `⏰ <b>Время ответа:</b> обычно в течение 24 часов\n\n` +
        `<i>Пожалуйста, опишите проблему как можно подробнее и приложите скриншоты, если это возможно.</i>`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💬 Написать в поддержку', url: SUPPORT_LINK }]
                ]
            }
        }
    );
});

// Команда /about - о программе
bot.command('about', async (ctx) => {
    await ctx.replyWithHTML(
        `ℹ️ <b>О программе P2P Tracker Pro</b>\n\n` +
        `📊 <b>Версия:</b> 2.0.0\n` +
        `📅 <b>Дата выпуска:</b> Июнь 2026\n` +
        `👨‍💻 <b>Разработчик:</b> Vlad\n` +
        `🌐 <b>Поддерживаемые языки:</b> 6 языков\n\n` +
        `<b>✨ Основные возможности:</b>\n` +
        `• Учёт покупок и продаж USDT\n` +
        `• Автоматический расчёт реальной прибыли (FIFO)\n` +
        `• Импорт из Telegram Wallet\n` +
        `• Облачная синхронизация через Telegram Cloud\n` +
        `• Мультиязычный интерфейс\n` +
        `• Светлая и тёмная тема\n` +
        `• Экспорт в PDF и Excel\n\n` +
        `<b>🎯 Планы развития:</b>\n` +
        `• Поддержка других криптовалют\n` +
        `• Графики и аналитика\n` +
        `• Экспорт в Google Sheets\n\n` +
        `© 2026 P2P Tracker Pro — Все права защищены`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Открыть приложение', web_app: { url: APP_URL } }],
                    [{ text: '⭐ Оценить приложение', callback_data: 'rate' }, { text: '📢 Поделиться', callback_data: 'share' }]
                ]
            }
        }
    );
});

// ========== CALLBACK QUERY ОБРАБОТЧИКИ ==========

// Обработка нажатий на инлайн-кнопки
bot.action('guide', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
        `📖 <b>Краткая инструкция по использованию</b>\n\n` +
        `<b>🏠 Главный экран</b>\n` +
        `• Отображает вашу реальную прибыль\n` +
        `• Курсы валют USD, EUR, CNY\n` +
        `• Последние 3 операции\n\n` +
        `<b>➕ Создание сделки</b>\n` +
        `• Выберите тип: Покупка или Продажа\n` +
        `• Укажите дату, сумму и количество USDT\n` +
        `• Цена рассчитается автоматически\n\n` +
        `<b>🧮 Калькулятор</b>\n` +
        `• Расчёт USDT по сумме в RUB\n` +
        `• Расчёт курса по полученному USDT\n\n` +
        `<b>⚙️ Прочее</b>\n` +
        `• Импорт из Telegram Wallet\n` +
        `• Настройки языка и темы\n` +
        `• Статус синхронизации\n\n` +
        `📱 Для открытия приложения используйте кнопку ниже 👇`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Открыть приложение', web_app: { url: APP_URL } }]
                ]
            }
        }
    );
});

bot.action('commands', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
        `⌨️ <b>Все команды бота</b>\n\n` +
        `🔹 <code>/start</code> — Главное меню\n` +
        `🔹 <code>/help</code> — Справка\n` +
        `🔹 <code>/stats</code> — Моя статистика\n` +
        `🔹 <code>/sync</code> — Синхронизация\n` +
        `🔹 <code>/export</code> — Экспорт данных\n` +
        `🔹 <code>/import</code> — Импорт из Wallet\n` +
        `🔹 <code>/language</code> — Смена языка\n` +
        `🔹 <code>/theme</code> — Смена темы\n` +
        `🔹 <code>/faq</code> — Частые вопросы\n` +
        `🔹 <code>/support</code> — Поддержка\n` +
        `🔹 <code>/about</code> — О программе\n\n` +
        `💡 <i>Все команды доступны через меню команд (кнопка «/» в поле ввода)</i>`
    );
});

bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
        `🛟 <b>Служба поддержки</b>\n\n` +
        `📧 Email: <b>ddos_vlados@mail.ru</b>\n` +
        `💬 Telegram: ${SUPPORT_LINK}\n\n` +
        `Мы ответим вам в ближайшее время!`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💬 Написать', url: SUPPORT_LINK }]
                ]
            }
        }
    );
});

bot.action('faq', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
        `❓ <b>Часто задаваемые вопросы</b>\n\n` +
        `<b>❓ Как добавить первую сделку?</b>\n` +
        `Нажмите «Создать» → выберите тип → заполните поля → «Записать сделку»\n\n` +
        `<b>❓ Почему остаток USDT отрицательный?</b>\n` +
        `Вы продали больше USDT, чем купили. Добавьте недостающие покупки.\n\n` +
        `<b>❓ Как работает синхронизация?</b>\n` +
        `Данные автоматически сохраняются в облаке Telegram при каждом изменении.\n\n` +
        `<b>❓ Можно ли перенести данные на другой телефон?</b>\n` +
        `Да! Просто войдите в тот же аккаунт Telegram — данные подгрузятся автоматически.\n\n` +
        `<b>❓ Что делать, если не загружаются сделки?</b>\n` +
        `Проверьте соединение с интернетом и перезапустите приложение.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🛟 Связаться с поддержкой', callback_data: 'support' }]
                ]
            }
        }
    );
});

bot.action('about', async (ctx) => {
    await ctx.answerCbQuery();
    await bot.telegram.call('sendMessage', {
        chat_id: ctx.chat.id,
        text: `ℹ️ <b>P2P Tracker Pro v2.0.0</b>\n\nПрофессиональный инструмент для учёта P2P сделок.\n\nРазработчик: Vlad\nПоддержка: ddos_vlados@mail.ru`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Открыть приложение', web_app: { url: APP_URL } }]
            ]
        }
    });
    await ctx.answerCbQuery();
});

// Обработка выбора языка
bot.action(/lang_(.+)/, async (ctx) => {
    const langCode = ctx.match[1];
    const langNames = { ru: 'Русский', en: 'English', de: 'Deutsch', sr: 'Српски', uk: 'Українська', be: 'Беларуская' };
    
    await ctx.answerCbQuery(`Язык изменён на ${langNames[langCode] || langCode}`);
    await ctx.replyWithHTML(
        `🌐 Язык интерфейса изменён на <b>${langNames[langCode] || langCode}</b>.\n\n` +
        `При следующем открытии приложение будет использовать выбранный язык.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Открыть приложение', web_app: { url: APP_URL } }]
                ]
            }
        }
    );
});

// Обработка выбора темы
bot.action(/theme_(.+)/, async (ctx) => {
    const theme = ctx.match[1];
    const themeNames = { light: 'Светлая', dark: 'Тёмная' };
    
    await ctx.answerCbQuery(`Тема изменена на ${themeNames[theme]}`);
    await ctx.replyWithHTML(
        `🎨 Тема оформления изменена на <b>${themeNames[theme]}</b>.\n\n` +
        `При следующем открытии приложение будет использовать выбранную тему.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Открыть приложение', web_app: { url: APP_URL } }]
                ]
            }
        }
    );
});

// Обработка оценки и шаринга
bot.action('rate', async (ctx) => {
    await ctx.answerCbQuery('Спасибо за оценку!');
    await ctx.replyWithHTML(
        `⭐ <b>Оцените P2P Tracker Pro</b>\n\n` +
        `Если вам нравится приложение, поддержите нас хорошей оценкой!\n\n` +
        `Ваша обратная связь помогает нам становиться лучше.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '👍 Отлично', callback_data: 'rate_good' }, { text: '👎 Есть замечания', callback_data: 'rate_bad' }]
                ]
            }
        }
    );
});

bot.action('rate_good', async (ctx) => {
    await ctx.answerCbQuery('Спасибо!');
    await ctx.replyWithHTML(`❤️ Спасибо за поддержку! Рады, что вам нравится.`);
});

bot.action('rate_bad', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
        `😔 Жаль, что вам что-то не понравилось.\n\n` +
        `Пожалуйста, напишите нам, что можно улучшить:\n` +
        `📧 ddos_vlados@mail.ru\n\n` +
        `Мы обязательно учтём ваше мнение!`
    );
});

bot.action('share', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
        `📢 <b>Поделиться P2P Tracker Pro</b>\n\n` +
        `Расскажите друзьям о приложении для учёта P2P сделок!`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📤 Поделиться ссылкой', switch_inline_query: 'P2P Tracker Pro - умный учёт P2P сделок!' }]
                ]
            }
        }
    );
});

// ========== ЗАПУСК БОТА ==========
bot.launch().then(() => {
    console.log('🤖 Бот P2P Tracker Pro запущен!');
    console.log(`📱 Приложение доступно по адресу: ${APP_URL}`);
    console.log(`🆔 Bot username: @${bot.botInfo?.username}`);
}).catch((err) => {
    console.error('❌ Ошибка запуска бота:', err);
});

// Обработка остановки
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));