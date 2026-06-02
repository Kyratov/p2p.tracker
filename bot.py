import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

load_dotenv()

# ========== КОНФИГУРАЦИЯ ==========
TOKEN = os.getenv('BOT_TOKEN')
APP_URL = 'https://kyratov.github.io/p2p.tracker'

if not TOKEN:
    print("Ошибка: BOT_TOKEN не найден")
    exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# ========== КЛАВИАТУРЫ ==========

def get_main_menu():
    """Главное меню — стильное, с минимальными иконками"""
    keyboard = [
        [InlineKeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url=APP_URL))],
        [InlineKeyboardButton("❓ Помощь", callback_data="help"),
         InlineKeyboardButton("ℹ️ О боте", callback_data="about")],
        [InlineKeyboardButton("🛟 Поддержка", callback_data="support"),
         InlineKeyboardButton("🔗 Приложение", callback_data="app")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_back_menu():
    """Клавиатура с кнопкой возврата в главное меню"""
    keyboard = [
        [InlineKeyboardButton("◀️ Назад в главное меню", callback_data="main_menu")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_simple_back():
    """Простая кнопка назад для коротких сообщений"""
    keyboard = [
        [InlineKeyboardButton("◀️ Назад", callback_data="main_menu")]
    ]
    return InlineKeyboardMarkup(keyboard)

# ========== ФОРМАТИРОВАНИЕ ТЕКСТА ==========

def format_text(title, content):
    """Форматирует текст с разделителями"""
    separator = "─" * 30
    return f"<b>{title}</b>\n\n{content}\n\n{separator}"

# ========== КОМАНДЫ ==========

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Главное меню"""
    user = update.effective_user
    first_name = user.first_name or "Пользователь"
    
    text = (
        f"<b>Добро пожаловать, {first_name}!</b>\n\n"
        f"<b>P2P Tracker Pro</b> — профессиональный инструмент для учёта P2P-сделок.\n\n"
        f"<b>Возможности:</b>\n"
        f"├ Автоматический расчёт прибыли\n"
        f"├ Импорт из Telegram Wallet\n"
        f"├ Синхронизация между устройствами\n"
        f"└ 10 языков интерфейса\n\n"
        f"<i>Нажмите «Открыть приложение», чтобы начать работу.</i>"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_main_menu()
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Раздел помощи"""
    text = format_text(
        "📖 Помощь",
        "<b>Как начать работу:</b>\n"
        "1️⃣ Нажмите «Открыть приложение»\n"
        "2️⃣ Добавьте сделку во вкладке «Создать»\n"
        "3️⃣ Импортируйте историю из Telegram Wallet\n"
        "4️⃣ Следите за прибылью на главном экране\n\n"
        "<b>Команды бота:</b>\n"
        "├ /start — Главное меню\n"
        "├ /help — Помощь\n"
        "├ /app — Открыть приложение\n"
        "├ /support — Поддержка\n"
        "└ /about — О боте\n\n"
        "<b>Синхронизация:</b>\n"
        "Данные сохраняются в облаке Telegram и доступны с любого устройства."
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_menu()
    )

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """О боте"""
    text = format_text(
        "ℹ️ О боте",
        "<b>Название:</b> P2P Tracker Pro\n"
        "<b>Версия:</b> 3.0.0\n"
        "<b>Разработчик:</b> Vlad\n\n"
        "<b>Поддерживаемые языки:</b>\n"
        "Русский, English, Deutsch, Français,\n"
        "中文, 日本語, Қазақша, Українська,\n"
        "Беларуская, Српски\n\n"
        "<b>Технологии:</b>\n"
        "├ Telegram WebApp\n"
        "├ Telegram Cloud Storage\n"
        "└ Python + python-telegram-bot\n\n"
        "<b>© 2026 P2P Tracker Pro</b>"
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_menu()
    )

async def support_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Поддержка"""
    text = format_text(
        "🛟 Поддержка",
        "<b>По всем вопросам обращайтесь:</b>\n\n"
        "📧 <b>Email:</b> <code>ddos_vlados@mail.ru</code>\n"
        "💬 <b>Telegram:</b> @KyratovVD\n\n"
        "⏰ <b>Время ответа:</b> обычно в течение 24 часов\n\n"
        "<i>Пожалуйста, описывайте проблему подробно и прикладывайте скриншоты.</i>"
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_menu()
    )

async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Ссылка на приложение"""
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url=APP_URL))],
        [InlineKeyboardButton("◀️ Назад в главное меню", callback_data="main_menu")]
    ])
    
    text = (
        "<b>🔗 Приложение</b>\n\n"
        "Нажмите на кнопку ниже, чтобы открыть P2P Tracker Pro.\n\n"
        "<i>Совет: добавьте бота в главное меню Telegram для быстрого доступа.</i>\n\n"
        "─" * 30
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=keyboard
    )

# ========== ОБРАБОТКА КНОПОК ==========

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий на кнопки"""
    query = update.callback_query
    user = update.effective_user
    await query.answer()
    
    # Главное меню
    if query.data == "main_menu":
        first_name = user.first_name or "Пользователь"
        text = (
            f"<b>Добро пожаловать, {first_name}!</b>\n\n"
            f"<b>P2P Tracker Pro</b> — профессиональный инструмент для учёта P2P-сделок.\n\n"
            f"<b>Возможности:</b>\n"
            f"├ Автоматический расчёт прибыли\n"
            f"├ Импорт из Telegram Wallet\n"
            f"├ Синхронизация между устройствами\n"
            f"└ 10 языков интерфейса\n\n"
            f"<i>Нажмите «Открыть приложение», чтобы начать работу.</i>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_main_menu()
        )
    
    # Помощь
    elif query.data == "help":
        text = format_text(
            "📖 Помощь",
            "<b>Как начать работу:</b>\n"
            "1️⃣ Нажмите «Открыть приложение»\n"
            "2️⃣ Добавьте сделку во вкладке «Создать»\n"
            "3️⃣ Импортируйте историю из Telegram Wallet\n"
            "4️⃣ Следите за прибылью на главном экране\n\n"
            "<b>Команды бота:</b>\n"
            "├ /start — Главное меню\n"
            "├ /help — Помощь\n"
            "├ /app — Открыть приложение\n"
            "├ /support — Поддержка\n"
            "└ /about — О боте\n\n"
            "<b>Синхронизация:</b>\n"
            "Данные сохраняются в облаке Telegram и доступны с любого устройства."
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_menu()
        )
    
    # О боте
    elif query.data == "about":
        text = format_text(
            "ℹ️ О боте",
            "<b>Название:</b> P2P Tracker Pro\n"
            "<b>Версия:</b> 3.0.0\n"
            "<b>Разработчик:</b> Vlad\n\n"
            "<b>Поддерживаемые языки:</b>\n"
            "Русский, English, Deutsch, Français,\n"
            "中文, 日本語, Қазақша, Українська,\n"
            "Беларуская, Српски\n\n"
            "<b>Технологии:</b>\n"
            "├ Telegram WebApp\n"
            "├ Telegram Cloud Storage\n"
            "└ Python + python-telegram-bot\n\n"
            "<b>© 2026 P2P Tracker Pro</b>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_menu()
        )
    
    # Поддержка
    elif query.data == "support":
        text = format_text(
            "🛟 Поддержка",
            "<b>По всем вопросам обращайтесь:</b>\n\n"
            "📧 <b>Email:</b> <code>ddos_vlados@mail.ru</code>\n"
            "💬 <b>Telegram:</b> @KyratovVD\n\n"
            "⏰ <b>Время ответа:</b> обычно в течение 24 часов\n\n"
            "<i>Пожалуйста, описывайте проблему подробно и прикладывайте скриншоты.</i>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_menu()
        )
    
    # Приложение
    elif query.data == "app":
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url=APP_URL))],
            [InlineKeyboardButton("◀️ Назад в главное меню", callback_data="main_menu")]
        ])
        text = (
            "<b>🔗 Приложение</b>\n\n"
            "Нажмите на кнопку ниже, чтобы открыть P2P Tracker Pro.\n\n"
            "<i>Совет: добавьте бота в главное меню Telegram для быстрого доступа.</i>\n\n"
            "─" * 30
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=keyboard
        )

# ========== ЗАПУСК ==========

def main():
    application = Application.builder().token(TOKEN).build()
    
    # Команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("about", about_command))
    application.add_handler(CommandHandler("support", support_command))
    application.add_handler(CommandHandler("app", app_command))
    
    # Обработчик кнопок
    application.add_handler(CallbackQueryHandler(button_callback))
    
    print("═" * 40)
    print("P2P Tracker Pro бот успешно запущен")
    print(f"URL приложения: {APP_URL}")
    print("═" * 40)
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()