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
    """Главное меню — чистое, без смайликов"""
    keyboard = [
        [InlineKeyboardButton("Открыть приложение", web_app=WebAppInfo(url=APP_URL))],
        [InlineKeyboardButton("Помощь", callback_data="help"),
         InlineKeyboardButton("О боте", callback_data="about")],
        [InlineKeyboardButton("Поддержка", callback_data="support"),
         InlineKeyboardButton("Приложение", callback_data="app")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_back_menu():
    """Клавиатура с кнопкой возврата"""
    keyboard = [
        [InlineKeyboardButton("← Назад", callback_data="main_menu")]
    ]
    return InlineKeyboardMarkup(keyboard)

# ========== КОМАНДЫ ==========

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Главное меню"""
    user = update.effective_user
    first_name = user.first_name or "Пользователь"
    
    text = (
        f"Здравствуйте, {first_name}.\n\n"
        f"P2P Tracker Pro — профессиональный учёт P2P-сделок.\n\n"
        f"Возможности:\n"
        f"— Автоматический расчёт прибыли\n"
        f"— Импорт из Telegram Wallet\n"
        f"— Синхронизация между устройствами\n"
        f"— 10 языков интерфейса\n\n"
        f"Нажмите «Открыть приложение», чтобы начать работу."
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_main_menu()
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Раздел помощи"""
    text = (
        "Помощь\n\n"
        "Как начать работу:\n"
        "1. Нажмите «Открыть приложение»\n"
        "2. Добавьте сделку во вкладке «Создать»\n"
        "3. Импортируйте историю из Telegram Wallet\n"
        "4. Следите за прибылью на главном экране\n\n"
        "Команды бота:\n"
        "/start — Главное меню\n"
        "/help — Помощь\n"
        "/app — Открыть приложение\n"
        "/support — Поддержка\n"
        "/about — О боте\n\n"
        "Синхронизация:\n"
        "Данные сохраняются в облаке Telegram и доступны с любого устройства."
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_menu()
    )

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """О боте"""
    text = (
        "О боте\n\n"
        "Название: P2P Tracker Pro\n"
        "Версия: 3.0.0\n"
        "Разработчик: Vlad\n\n"
        "Поддерживаемые языки:\n"
        "Русский, English, Deutsch, Français, 中文, 日本語, Қазақша, Українська, Беларуская, Српски\n\n"
        "Технологии:\n"
        "Telegram WebApp, Telegram Cloud Storage, Python\n\n"
        "© 2026 P2P Tracker Pro"
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_menu()
    )

async def support_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Поддержка"""
    text = (
        "Поддержка\n\n"
        "По всем вопросам обращайтесь:\n\n"
        "Email: ddos_vlados@mail.ru\n"
        "Telegram: @KyratovVD\n\n"
        "Время ответа: обычно в течение 24 часов.\n\n"
        "Пожалуйста, описывайте проблему подробно и прикладывайте скриншоты."
    )
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_menu()
    )

async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Ссылка на приложение"""
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("Открыть приложение", web_app=WebAppInfo(url=APP_URL))],
        [InlineKeyboardButton("← Назад", callback_data="main_menu")]
    ])
    
    text = (
        "Приложение\n\n"
        "Нажмите на кнопку ниже, чтобы открыть P2P Tracker Pro.\n\n"
        "Совет: добавьте бота в главное меню Telegram для быстрого доступа."
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
    
    if query.data == "main_menu":
        first_name = user.first_name or "Пользователь"
        text = (
            f"Здравствуйте, {first_name}.\n\n"
            f"P2P Tracker Pro — профессиональный учёт P2P-сделок.\n\n"
            f"Возможности:\n"
            f"— Автоматический расчёт прибыли\n"
            f"— Импорт из Telegram Wallet\n"
            f"— Синхронизация между устройствами\n"
            f"— 10 языков интерфейса\n\n"
            f"Нажмите «Открыть приложение», чтобы начать работу."
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_main_menu()
        )
    
    elif query.data == "help":
        text = (
            "Помощь\n\n"
            "Как начать работу:\n"
            "1. Нажмите «Открыть приложение»\n"
            "2. Добавьте сделку во вкладке «Создать»\n"
            "3. Импортируйте историю из Telegram Wallet\n"
            "4. Следите за прибылью на главном экране\n\n"
            "Команды бота:\n"
            "/start — Главное меню\n"
            "/help — Помощь\n"
            "/app — Открыть приложение\n"
            "/support — Поддержка\n"
            "/about — О боте\n\n"
            "Синхронизация:\n"
            "Данные сохраняются в облаке Telegram и доступны с любого устройства."
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_menu()
        )
    
    elif query.data == "about":
        text = (
            "О боте\n\n"
            "Название: P2P Tracker Pro\n"
            "Версия: 3.0.0\n"
            "Разработчик: Vlad\n\n"
            "Поддерживаемые языки:\n"
            "Русский, English, Deutsch, Français, 中文, 日本語, Қазақша, Українська, Беларуская, Српски\n\n"
            "Технологии:\n"
            "Telegram WebApp, Telegram Cloud Storage, Python\n\n"
            "© 2026 P2P Tracker Pro"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_menu()
        )
    
    elif query.data == "support":
        text = (
            "Поддержка\n\n"
            "По всем вопросам обращайтесь:\n\n"
            "Email: ddos_vlados@mail.ru\n"
            "Telegram: @KyratovVD\n\n"
            "Время ответа: обычно в течение 24 часов.\n\n"
            "Пожалуйста, описывайте проблему подробно и прикладывайте скриншоты."
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_menu()
        )
    
    elif query.data == "app":
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("Открыть приложение", web_app=WebAppInfo(url=APP_URL))],
            [InlineKeyboardButton("← Назад", callback_data="main_menu")]
        ])
        text = (
            "Приложение\n\n"
            "Нажмите на кнопку ниже, чтобы открыть P2P Tracker Pro.\n\n"
            "Совет: добавьте бота в главное меню Telegram для быстрого доступа."
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
    
    print("=" * 40)
    print("P2P Tracker Pro бот запущен")
    print(f"URL приложения: {APP_URL}")
    print("=" * 40)
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()