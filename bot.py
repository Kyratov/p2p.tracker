import os
import logging
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

load_dotenv()

TOKEN = os.getenv('BOT_TOKEN')
APP_URL = 'https://kyratov.github.io/p2p.tracker/'

if not TOKEN:
    print("❌ ОШИБКА: BOT_TOKEN не найден")
    exit(1)

logging.basicConfig(level=logging.INFO)

# ========== КЛАВИАТУРЫ ==========

def get_main_keyboard():
    """Главное меню"""
    keyboard = [
        [InlineKeyboardButton("🚀 ОТКРЫТЬ P2P TRACKER PRO", web_app=WebAppInfo(url=APP_URL))],
        [InlineKeyboardButton("📖 Помощь", callback_data="help"),
         InlineKeyboardButton("ℹ️ О боте", callback_data="about")],
        [InlineKeyboardButton("📱 Приложение", callback_data="app"),
         InlineKeyboardButton("🛟 Поддержка", callback_data="support")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_back_keyboard():
    """Клавиатура с кнопкой возврата в главное меню"""
    keyboard = [
        [InlineKeyboardButton("🏠 Главное меню", callback_data="main_menu")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_main_menu_button():
    """Одна кнопка возврата в главное меню"""
    keyboard = [[InlineKeyboardButton("🏠 В главное меню", callback_data="main_menu")]]
    return InlineKeyboardMarkup(keyboard)

# ========== КОМАНДЫ ==========

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Главное меню"""
    user = update.effective_user
    user_name = user.first_name or "пользователь"
    
    text = (
        f"🚀 <b>Добро пожаловать, {user_name}!</b>\n\n"
        f"<b>P2P Tracker Pro</b> — профессиональный учёт P2P сделок.\n\n"
        f"▫️ Автоматический расчёт прибыли\n"
        f"▫️ Импорт из Telegram Wallet\n"
        f"▫️ Синхронизация между устройствами\n"
        f"▫️ 10 языков интерфейса\n\n"
        f"👇 <b>Нажмите на кнопку ниже, чтобы открыть приложение</b>"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_main_keyboard()
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Раздел помощи"""
    text = (
        "📖 <b>Как пользоваться P2P Tracker Pro</b>\n\n"
        "1️⃣ Нажмите <b>«ОТКРЫТЬ P2P TRACKER PRO»</b>\n"
        "2️⃣ Добавляйте сделки во вкладке <b>«Создать»</b>\n"
        "3️⃣ Импортируйте историю из Telegram Wallet\n"
        "4️⃣ Следите за прибылью на главном экране\n\n"
        "☁️ <b>Синхронизация</b>\n"
        "Данные автоматически сохраняются в облаке Telegram.\n\n"
        "🔹 <b>Команды:</b>\n"
        "/start — Главное меню\n"
        "/help — Эта справка\n"
        "/app — Открыть приложение\n"
        "/support — Поддержка\n"
        "/about — О программе"
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_keyboard()
    )

async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Ссылка на приложение"""
    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton("🚀 Открыть приложение", web_app=WebAppInfo(url=APP_URL))
    ]])
    await update.message.reply_text(
        "📱 <b>Откройте P2P Tracker Pro</b>\n\nНажмите на кнопку ниже:",
        parse_mode='HTML',
        reply_markup=keyboard
    )

async def support_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Раздел поддержки"""
    text = (
        "🛟 <b>Служба поддержки</b>\n\n"
        "📧 <b>Email:</b> ddos_vlados@mail.ru\n"
        "💬 <b>Telegram:</b> @KyratovVD\n\n"
        "Мы ответим в ближайшее время!\n\n"
        "📅 <b>Время ответа:</b> обычно в течение 24 часов\n\n"
        "<i>Пожалуйста, опишите проблему как можно подробнее.</i>"
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_keyboard()
    )

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """О программе"""
    text = (
        "ℹ️ <b>P2P Tracker Pro</b>\n\n"
        "<b>Версия:</b> 2.0.0\n"
        "<b>Языки:</b> 10 языков (🇷🇺🇬🇧🇩🇪🇫🇷🇨🇳🇯🇵🇰🇿 и другие)\n"
        "<b>Разработчик:</b> Vlad\n\n"
        "✨ <b>Возможности:</b>\n"
        "• Учёт покупок и продаж USDT\n"
        "• Расчёт реальной прибыли (FIFO)\n"
        "• Импорт из Telegram Wallet\n"
        "• Облачная синхронизация\n"
        "• Светлая и тёмная тема\n"
        "• Экспорт в PDF и Excel\n\n"
        "© 2026 P2P Tracker Pro"
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_keyboard()
    )

# ========== ОБРАБОТКА КНОПОК ==========

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий на инлайн-кнопки"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "main_menu":
        # Возврат в главное меню
        user = update.effective_user
        user_name = user.first_name or "пользователь"
        text = (
            f"🚀 <b>Добро пожаловать, {user_name}!</b>\n\n"
            f"<b>P2P Tracker Pro</b> — профессиональный учёт P2P сделок.\n\n"
            f"👇 <b>Нажмите на кнопку ниже, чтобы открыть приложение</b>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_main_keyboard()
        )
    
    elif query.data == "help":
        text = (
            "📖 <b>Как пользоваться P2P Tracker Pro</b>\n\n"
            "1️⃣ Нажмите <b>«ОТКРЫТЬ P2P TRACKER PRO»</b>\n"
            "2️⃣ Добавляйте сделки во вкладке <b>«Создать»</b>\n"
            "3️⃣ Импортируйте историю из Telegram Wallet\n"
            "4️⃣ Следите за прибылью на главном экране\n\n"
            "☁️ <b>Синхронизация</b>\n"
            "Данные автоматически сохраняются в облаке Telegram.\n\n"
            "🔹 <b>Команды:</b>\n"
            "/start — Главное меню\n"
            "/help — Эта справка\n"
            "/app — Открыть приложение\n"
            "/support — Поддержка\n"
            "/about — О программе"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    elif query.data == "about":
        text = (
            "ℹ️ <b>P2P Tracker Pro v2.0.0</b>\n\n"
            "Профессиональный инструмент для учёта P2P сделок.\n\n"
            "<b>Статистика:</b>\n"
            "• 10 языков интерфейса\n"
            "• Поддержка всех валют\n"
            "• Облачная синхронизация\n\n"
            "<b>Разработчик:</b> Vlad\n"
            "<b>Поддержка:</b> @KyratovVD"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    elif query.data == "app":
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("🚀 Открыть приложение", web_app=WebAppInfo(url=APP_URL))
        ]])
        await query.edit_message_text(
            "📱 <b>Откройте P2P Tracker Pro</b>\n\nНажмите на кнопку ниже:",
            parse_mode='HTML',
            reply_markup=keyboard
        )
        # Добавляем кнопку назад отдельным сообщением
        await query.message.reply_text(
            "⬅️ Чтобы вернуться в главное меню, нажмите на кнопку ниже:",
            reply_markup=get_main_menu_button()
        )
    
    elif query.data == "support":
        text = (
            "🛟 <b>Служба поддержки</b>\n\n"
            "📧 <b>Email:</b> ddos_vlados@mail.ru\n"
            "💬 <b>Telegram:</b> @KyratovVD\n\n"
            "📅 <b>Время ответа:</b> обычно в течение 24 часов\n\n"
            "<i>Пожалуйста, опишите проблему как можно подробнее.</i>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )

# ========== ЗАПУСК БОТА ==========

def main():
    application = Application.builder().token(TOKEN).build()
    
    # Команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("app", app_command))
    application.add_handler(CommandHandler("support", support_command))
    application.add_handler(CommandHandler("about", about_command))
    
    # Обработчик кнопок
    application.add_handler(CallbackQueryHandler(button_callback))
    
    print("✅ Бот P2P Tracker Pro запущен!")
    print(f"📱 URL приложения: {APP_URL}")
    print("⏳ Бот работает и ожидает команды...")
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()