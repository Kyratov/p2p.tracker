import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# ========== НАСТРОЙКИ ==========
# Токен берите из переменных окружения на хостинге
TOKEN = os.environ.get('BOT_TOKEN', '8824407853:AAHq_BcojLt6FnzKdLgdd6LnuGySb6M2His')

# Ссылка на ваше WebApp приложение
APP_URL = 'https://kyratov.github.io/p2p.tracker/'

# Настройка логов
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ========== КЛАВИАТУРЫ ==========
def get_main_keyboard():
    """Главная клавиатура с кнопкой WebApp"""
    keyboard = [
        [InlineKeyboardButton(
            "🚀 ОТКРЫТЬ P2P TRACKER PRO",
            web_app=WebAppInfo(url=APP_URL)
        )],
        [InlineKeyboardButton("📖 Помощь", callback_data="help"),
         InlineKeyboardButton("ℹ️ О боте", callback_data="about")],
        [InlineKeyboardButton("📱 Приложение", callback_data="app"),
         InlineKeyboardButton("🛟 Поддержка", callback_data="support")]
    ]
    return InlineKeyboardMarkup(keyboard)

# ========== КОМАНДЫ ==========
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start - главное меню"""
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
    """Команда /help - справка"""
    text = (
        "📖 <b>Справка по командам</b>\n\n"
        "🔹 /start — Главное меню\n"
        "🔹 /help — Эта справка\n"
        "🔹 /app — Ссылка на приложение\n"
        "🔹 /support — Поддержка\n"
        "🔹 /about — О программе\n\n"
        "💡 <b>Совет:</b> Нажмите на кнопку <b>«Menu»</b> внизу экрана!"
    )
    await update.message.reply_text(text, parse_mode='HTML')

async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /app - прямая ссылка на приложение"""
    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton("🚀 Открыть приложение", web_app=WebAppInfo(url=APP_URL))
    ]])
    await update.message.reply_text(
        "📱 <b>Откройте P2P Tracker Pro</b>\n\nНажмите на кнопку ниже:",
        parse_mode='HTML',
        reply_markup=keyboard
    )

async def support_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /support - поддержка"""
    text = (
        "🛟 <b>Служба поддержки</b>\n\n"
        "📧 Email: <b>ddos_vlados@mail.ru</b>\n"
        "💬 Telegram: <b>@KyratovVD</b>\n\n"
        "Мы ответим в ближайшее время!"
    )
    await update.message.reply_text(text, parse_mode='HTML')

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /about - о программе"""
    text = (
        "ℹ️ <b>P2P Tracker Pro</b>\n\n"
        "<b>Версия:</b> 2.0.0\n"
        "<b>Языки:</b> 10 языков\n"
        "<b>Разработчик:</b> Vlad\n\n"
        "✨ <b>Возможности:</b>\n"
        "• Учёт покупок и продаж USDT\n"
        "• Расчёт реальной прибыли (FIFO)\n"
        "• Импорт из Telegram Wallet\n"
        "• Облачная синхронизация\n"
        "• Светлая и тёмная тема\n\n"
        "© 2026 P2P Tracker Pro"
    )
    await update.message.reply_text(text, parse_mode='HTML')

# ========== ОБРАБОТКА КНОПОК ==========
async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий на инлайн-кнопки"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "help":
        text = (
            "📖 <b>Как пользоваться</b>\n\n"
            "1️⃣ Нажмите <b>«ОТКРЫТЬ P2P TRACKER PRO»</b>\n"
            "2️⃣ Добавляйте сделки во вкладке <b>«Создать»</b>\n"
            "3️⃣ Импортируйте историю из Telegram Wallet\n"
            "4️⃣ Следите за прибылью на главном экране\n\n"
            "☁️ <b>Синхронизация</b>\n"
            "Данные автоматически сохраняются в облаке Telegram."
        )
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=get_main_keyboard())
    
    elif query.data == "about":
        text = (
            "ℹ️ <b>P2P Tracker Pro v2.0.0</b>\n\n"
            "Профессиональный инструмент для учёта P2P сделок.\n\n"
            "Разработчик: Vlad\n"
            "Поддержка: @KyratovVD"
        )
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=get_main_keyboard())
    
    elif query.data == "app":
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("🚀 Открыть приложение", web_app=WebAppInfo(url=APP_URL))
        ]])
        await query.edit_message_text(
            "📱 <b>Откройте P2P Tracker Pro</b>\n\nНажмите на кнопку ниже:",
            parse_mode='HTML',
            reply_markup=keyboard
        )
    
    elif query.data == "support":
        text = (
            "🛟 <b>Служба поддержки</b>\n\n"
            "📧 Email: <b>ddos_vlados@mail.ru</b>\n"
            "💬 Telegram: <b>@KyratovVD</b>\n\n"
            "Мы ответим в ближайшее время!"
        )
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=get_main_keyboard())

# ========== ЗАПУСК БОТА ==========
def main():
    """Запуск бота"""
    if not TOKEN or TOKEN == '8824407853:AAHq_BcojLt6FnzKdLgdd6LnuGySb6M2His':
        print("❌ ОШИБКА: BOT_TOKEN не указан!")
        print("Добавьте переменную окружения BOT_TOKEN в настройках хостинга")
        return
    
    # Создаём приложение
    application = Application.builder().token(TOKEN).build()
    
    # Регистрируем команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("app", app_command))
    application.add_handler(CommandHandler("support", support_command))
    application.add_handler(CommandHandler("about", about_command))
    
    # Регистрируем обработчик кнопок
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Запускаем бота
    print("✅ Бот P2P Tracker Pro запущен!")
    print(f"📱 URL приложения: {APP_URL}")
    print("⏳ Бот работает и ожидает команды...")
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()