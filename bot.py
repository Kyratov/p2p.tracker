import os
import json
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

load_dotenv()

# ========== КОНФИГУРАЦИЯ ==========
TOKEN = os.getenv('BOT_TOKEN')
APP_URL = 'https://kyratov.github.io/p2p.tracker/'
ADMIN_ID = os.getenv('ADMIN_ID', 'KyratovVD')  # Ваш Telegram ID для админ-панели

# Статистика пользователей (хранится в памяти, можно расширить до БД)
user_stats = {}

if not TOKEN:
    print("❌ ОШИБКА: BOT_TOKEN не найден")
    exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

def save_user_stats(user_id, username, first_name):
    """Сохраняем статистику пользователя"""
    if user_id not in user_stats:
        user_stats[user_id] = {
            'first_seen': datetime.now().isoformat(),
            'username': username,
            'first_name': first_name,
            'commands_count': 0,
            'last_activity': datetime.now().isoformat()
        }
    else:
        user_stats[user_id]['commands_count'] += 1
        user_stats[user_id]['last_activity'] = datetime.now().isoformat()
        user_stats[user_id]['username'] = username
        user_stats[user_id]['first_name'] = first_name

def format_number(num):
    """Форматирует число с разделителями"""
    return f"{num:,}".replace(",", " ")

# ========== КЛАВИАТУРЫ ==========

def get_main_keyboard():
    """Главное меню — стильное, с иконками"""
    keyboard = [
        [InlineKeyboardButton("🚀 ОТКРЫТЬ P2P TRACKER PRO", web_app=WebAppInfo(url=APP_URL))],
        [InlineKeyboardButton("📖 Помощь", callback_data="help"),
         InlineKeyboardButton("📊 Статистика", callback_data="stats")],
        [InlineKeyboardButton("ℹ️ О боте", callback_data="about"),
         InlineKeyboardButton("🛟 Поддержка", callback_data="support")],
        [InlineKeyboardButton("⭐ Оценить", callback_data="rate"),
         InlineKeyboardButton("📢 Поделиться", callback_data="share")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_back_keyboard():
    """Клавиатура с кнопкой возврата"""
    keyboard = [
        [InlineKeyboardButton("🏠 В главное меню", callback_data="main_menu")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_admin_keyboard():
    """Админ-панель (только для вас)"""
    keyboard = [
        [InlineKeyboardButton("📊 Общая статистика", callback_data="admin_stats")],
        [InlineKeyboardButton("👥 Список пользователей", callback_data="admin_users")],
        [InlineKeyboardButton("📢 Рассылка", callback_data="admin_broadcast")],
        [InlineKeyboardButton("🏠 Назад", callback_data="main_menu")]
    ]
    return InlineKeyboardMarkup(keyboard)

# ========== КОМАНДЫ ==========

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Главное меню с приветствием"""
    user = update.effective_user
    user_id = user.id
    username = user.username or "без_username"
    first_name = user.first_name or "Пользователь"
    
    save_user_stats(user_id, username, first_name)
    
    # Разное приветствие в зависимости от времени суток
    hour = datetime.now().hour
    if 5 <= hour < 12:
        greeting = "🌅 Доброе утро"
    elif 12 <= hour < 18:
        greeting = "☀️ Добрый день"
    elif 18 <= hour < 23:
        greeting = "🌆 Добрый вечер"
    else:
        greeting = "🌙 Доброй ночи"
    
    text = (
        f"{greeting}, <b>{first_name}</b>! 👋\n\n"
        f"<b>✨ P2P Tracker Pro</b> — твой личный помощник для учёта P2P-сделок.\n\n"
        f"📊 <b>Твоя статистика:</b>\n"
        f"• ID: <code>{user_id}</code>\n"
        f"• Команд выполнено: <b>{user_stats[user_id]['commands_count']}</b>\n"
        f"• Впервые: <b>{user_stats[user_id]['first_seen'][:10]}</b>\n\n"
        f"👇 <b>Нажми на кнопку, чтобы открыть приложение</b>"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_main_keyboard()
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Расширенная помощь"""
    user = update.effective_user
    save_user_stats(user.id, user.username, user.first_name)
    
    text = (
        "📖 <b>Помощь по P2P Tracker Pro</b>\n\n"
        "<b>🚀 Как начать работу:</b>\n"
        "1️⃣ Нажми на кнопку <b>«ОТКРЫТЬ P2P TRACKER PRO»</b>\n"
        "2️⃣ Добавь первую сделку во вкладке <b>«Создать»</b>\n"
        "3️⃣ Импортируй историю из Telegram Wallet\n"
        "4️⃣ Следи за прибылью на главном экране\n\n"
        
        "<b>📋 Команды бота:</b>\n"
        "• /start — Главное меню\n"
        "• /help — Помощь\n"
        "• /app — Открыть приложение\n"
        "• /stats — Моя статистика\n"
        "• /support — Поддержка\n"
        "• /about — О боте\n\n"
        
        "<b>☁️ Синхронизация:</b>\n"
        "Все данные автоматически сохраняются в облаке Telegram.\n"
        "Ты можешь зайти с любого устройства — сделки никуда не денутся!\n\n"
        
        "<b>💡 Совет:</b> Добавь бота в меню Telegram для быстрого доступа!"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_keyboard()
    )

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Личная статистика пользователя"""
    user = update.effective_user
    user_id = user.id
    save_user_stats(user_id, user.username, user.first_name)
    
    stats = user_stats.get(user_id, {})
    first_seen = datetime.fromisoformat(stats.get('first_seen', datetime.now().isoformat()))
    last_active = datetime.fromisoformat(stats.get('last_activity', datetime.now().isoformat()))
    days_active = (datetime.now() - first_seen).days
    
    text = (
        f"📊 <b>Твоя статистика</b>\n\n"
        f"👤 <b>Профиль:</b>\n"
        f"• Имя: <b>{stats.get('first_name', user.first_name)}</b>\n"
        f"• Username: @{stats.get('username', user.username or '—')}\n"
        f"• ID: <code>{user_id}</code>\n\n"
        
        f"📈 <b>Активность:</b>\n"
        f"• Команд выполнено: <b>{stats.get('commands_count', 0)}</b>\n"
        f"• В приложении: <b>{stats.get('app_opens', 0)}</b> раз\n"
        f"• С нами: <b>{days_active}</b> дней\n"
        f"• Последний визит: <b>{last_active.strftime('%d.%m.%Y %H:%M')}</b>\n\n"
        
        f"⭐ <b>Уровень:</b> "
    )
    
    # Определяем уровень пользователя
    commands = stats.get('commands_count', 0)
    if commands < 10:
        text += "🟢 Новичок"
    elif commands < 50:
        text += "🔵 Опытный"
    elif commands < 200:
        text += "🟣 Профессионал"
    else:
        text += "👑 Мастер трейдинга"
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_keyboard()
    )

async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Прямая ссылка на приложение"""
    user = update.effective_user
    save_user_stats(user.id, user.username, user.first_name)
    
    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton("🚀 Открыть приложение", web_app=WebAppInfo(url=APP_URL))
    ], [
        InlineKeyboardButton("🏠 В главное меню", callback_data="main_menu")
    ]])
    
    text = (
        "📱 <b>P2P Tracker Pro</b>\n\n"
        "Нажми на кнопку ниже, чтобы открыть приложение.\n\n"
        "<i>Совет: добавь приложение в главное меню Telegram через BotFather!</i>"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=keyboard
    )

async def support_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Поддержка"""
    user = update.effective_user
    save_user_stats(user.id, user.username, user.first_name)
    
    text = (
        "🛟 <b>Служба поддержки P2P Tracker Pro</b>\n\n"
        "📧 <b>Email:</b> <code>ddos_vlados@mail.ru</code>\n"
        "💬 <b>Telegram:</b> @KyratovVD\n\n"
        
        "📅 <b>Время ответа:</b> обычно в течение 24 часов\n\n"
        
        "🔧 <b>Прежде чем писать:</b>\n"
        "• Проверь актуальную версию приложения\n"
        "• Обнови Telegram до последней версии\n"
        "• Перезапусти приложение\n\n"
        
        "<i>Пожалуйста, опиши проблему как можно подробнее и приложи скриншоты.</i>"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_keyboard()
    )

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """О боте — красиво и информативно"""
    user = update.effective_user
    save_user_stats(user.id, user.username, user.first_name)
    
    text = (
        "✨ <b>P2P Tracker Pro</b> ✨\n\n"
        "<b>Версия:</b> 3.0.0 VIP\n"
        "<b>Дата релиза:</b> Июнь 2026\n"
        "<b>Разработчик:</b> Vlad\n"
        "<b>Лицензия:</b> Free for all\n\n"
        
        "🎯 <b>Миссия:</b>\n"
        "Сделать учёт P2P-сделок простым и удобным\n\n"
        
        "⚡️ <b>Технологии:</b>\n"
        "• Telegram WebApp\n"
        "• Telegram Cloud Storage\n"
        "• HTML5, CSS3, JavaScript\n"
        "• Python + python-telegram-bot\n\n"
        
        "🌍 <b>Языки:</b>\n"
        "🇷🇺 Русский | 🇬🇧 English | 🇩🇪 Deutsch\n"
        "🇫🇷 Français | 🇨🇳 中文 | 🇯🇵 日本語\n"
        "🇰🇿 Қазақша | 🇺🇦 Українська | 🇧🇾 Беларуская\n\n"
        
        "📊 <b>Пользователей:</b> <code>{}</code>\n\n"
        "© 2026 P2P Tracker Pro — Все права защищены"
    ).format(format_number(len(user_stats)))
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_back_keyboard()
    )

# ========== АДМИН-КОМАНДЫ (только для вас) ==========

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Админ-панель (скрытая команда)"""
    user_id = str(update.effective_user.id)
    
    if user_id != ADMIN_ID and ADMIN_ID:
        await update.message.reply_text("⛔ У вас нет доступа к этой команде.")
        return
    
    text = (
        "👑 <b>Админ-панель P2P Tracker Pro</b>\n\n"
        f"📊 <b>Всего пользователей:</b> {format_number(len(user_stats))}\n"
        f"📈 <b>Всего команд:</b> {format_number(sum(s.get('commands_count', 0) for s in user_stats.values()))}\n\n"
        "Выбери действие:"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='HTML',
        reply_markup=get_admin_keyboard()
    )

async def admin_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Общая статистика (админ)"""
    query = update.callback_query
    await query.answer()
    
    total_commands = sum(s.get('commands_count', 0) for s in user_stats.values())
    total_app_opens = sum(s.get('app_opens', 0) for s in user_stats.values())
    
    # Активные за последние 7 дней
    week_ago = datetime.now() - timedelta(days=7)
    active_users = sum(1 for s in user_stats.values() 
                       if datetime.fromisoformat(s.get('last_activity', '2000-01-01')) > week_ago)
    
    text = (
        "📊 <b>Общая статистика</b>\n\n"
        f"👥 <b>Всего пользователей:</b> {format_number(len(user_stats))}\n"
        f"📈 <b>Всего команд:</b> {format_number(total_commands)}\n"
        f"📱 <b>Открытий приложения:</b> {format_number(total_app_opens)}\n"
        f"🟢 <b>Активных за 7 дней:</b> {format_number(active_users)}\n\n"
        
        f"📅 <b>Первый пользователь:</b>\n"
        f"<code>{min(user_stats.values(), key=lambda x: x['first_seen'])['first_name'] if user_stats else '—'}</code>"
    )
    
    await query.edit_message_text(
        text,
        parse_mode='HTML',
        reply_markup=get_admin_keyboard()
    )

async def admin_users(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Список пользователей (админ)"""
    query = update.callback_query
    await query.answer()
    
    if not user_stats:
        await query.edit_message_text("Нет пользователей", reply_markup=get_admin_keyboard())
        return
    
    # Формируем список топ-10
    users_list = sorted(user_stats.items(), key=lambda x: x[1]['commands_count'], reverse=True)[:10]
    
    text = "👥 <b>Топ-10 активных пользователей</b>\n\n"
    for i, (uid, data) in enumerate(users_list, 1):
        medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
        text += f"{medal} <b>{data['first_name']}</b> — {data['commands_count']} команд\n"
    
    await query.edit_message_text(
        text,
        parse_mode='HTML',
        reply_markup=get_admin_keyboard()
    )

# ========== ОБРАБОТКА КНОПОК ==========

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка всех кнопок"""
    query = update.callback_query
    user = update.effective_user
    await query.answer()
    
    save_user_stats(user.id, user.username, user.first_name)
    
    # Главное меню
    if query.data == "main_menu":
        hour = datetime.now().hour
        if 5 <= hour < 12:
            greeting = "🌅 Доброе утро"
        elif 12 <= hour < 18:
            greeting = "☀️ Добрый день"
        elif 18 <= hour < 23:
            greeting = "🌆 Добрый вечер"
        else:
            greeting = "🌙 Доброй ночи"
        
        text = (
            f"{greeting}, <b>{user.first_name}</b>! 👋\n\n"
            f"<b>✨ P2P Tracker Pro</b> — твой личный помощник для учёта P2P-сделок.\n\n"
            f"👇 <b>Нажми на кнопку, чтобы открыть приложение</b>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_main_keyboard()
        )
    
    # Помощь
    elif query.data == "help":
        text = (
            "📖 <b>Как пользоваться P2P Tracker Pro</b>\n\n"
            "1️⃣ Нажми <b>«ОТКРЫТЬ P2P TRACKER PRO»</b>\n"
            "2️⃣ Добавь сделку во вкладке <b>«Создать»</b>\n"
            "3️⃣ Импортируй историю из Telegram Wallet\n"
            "4️⃣ Следи за прибылью\n\n"
            "🔹 Команды: /start, /help, /stats, /app, /support, /about"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    # Статистика
    elif query.data == "stats":
        stats = user_stats.get(user.id, {})
        commands = stats.get('commands_count', 0)
        
        if commands < 10:
            level = "🟢 Новичок"
            next_level = "10 команд"
        elif commands < 50:
            level = "🔵 Опытный"
            next_level = "50 команд"
        elif commands < 200:
            level = "🟣 Профессионал"
            next_level = "200 команд"
        else:
            level = "👑 Мастер трейдинга"
            next_level = "максимум"
        
        text = (
            f"📊 <b>Твоя статистика</b>\n\n"
            f"👤 <b>{user.first_name}</b>\n"
            f"📈 Команд: <b>{commands}</b>\n"
            f"⭐ Уровень: <b>{level}</b>\n"
            f"🎯 До следующего уровня: <b>{next_level}</b>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    # О боте
    elif query.data == "about":
        text = (
            "✨ <b>P2P Tracker Pro</b> ✨\n\n"
            f"📊 <b>Пользователей:</b> {format_number(len(user_stats))}\n"
            f"🌍 <b>Языков:</b> 10\n"
            f"📅 <b>Версия:</b> 3.0.0 VIP\n\n"
            "💎 <b>Премиум-функции:</b>\n"
            "• Облачная синхронизация\n"
            "• 10 языков интерфейса\n"
            "• Импорт из Telegram Wallet\n"
            "• Тёмная тема\n"
            "• Экспорт PDF/Excel\n\n"
            "👨‍💻 Разработчик: @KyratovVD"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    # Поддержка
    elif query.data == "support":
        text = (
            "🛟 <b>Служба поддержки</b>\n\n"
            "📧 <code>ddos_vlados@mail.ru</code>\n"
            "💬 @KyratovVD\n\n"
            "Мы ответим в течение 24 часов!"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    # Оценка
    elif query.data == "rate":
        text = (
            "⭐ <b>Оцени P2P Tracker Pro</b>\n\n"
            "Если тебе нравится приложение — поставь оценку!\n\n"
            "Это поможет нам стать ещё лучше 🚀"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    # Поделиться
    elif query.data == "share":
        text = (
            "📢 <b>Поделись с друзьями!</b>\n\n"
            "Расскажи о P2P Tracker Pro своим знакомым трейдерам!\n\n"
            "🔗 <b>Ссылка на бота:</b>\n"
            f"<code>https://t.me/{context.bot.username}</code>"
        )
        await query.edit_message_text(
            text,
            parse_mode='HTML',
            reply_markup=get_back_keyboard()
        )
    
    # Админ-панель
    elif query.data.startswith("admin_"):
        if str(user.id) != ADMIN_ID and ADMIN_ID:
            await query.edit_message_text("⛔ Нет доступа")
            return
        
        if query.data == "admin_stats":
            await admin_stats(update, context)
        elif query.data == "admin_users":
            await admin_users(update, context)

# ========== ЗАПУСК БОТА ==========

def main():
    application = Application.builder().token(TOKEN).build()
    
    # Команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("stats", stats_command))
    application.add_handler(CommandHandler("app", app_command))
    application.add_handler(CommandHandler("support", support_command))
    application.add_handler(CommandHandler("about", about_command))
    application.add_handler(CommandHandler("admin", admin_command))  # скрытая команда
    
    # Обработчик кнопок
    application.add_handler(CallbackQueryHandler(button_callback))
    
    print("=" * 50)
    print("🤖 P2P Tracker Pro VIP БОТ ЗАПУЩЕН!")
    print(f"📱 URL приложения: {APP_URL}")
    print(f"👑 Админ ID: {ADMIN_ID or 'не задан'}")
    print("=" * 50)
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()