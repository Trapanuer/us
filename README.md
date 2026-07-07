# Мы — Telegram Mini App для пары

Приватное приложение для двоих, которые временно на расстоянии. Счётчик до встречи, кнопка "скучаю", лента моментов.

## Структура проекта

```
us/
├── backend/                 # Node.js + Express + Firestore
│   ├── src/
│   │   ├── index.js         # Главный сервер
│   │   ├── firebase.js      # Firebase конфиг
│   │   ├── middleware/
│   │   │   └── auth.js      # Авторизация по Telegram ID
│   │   └── routes/
│   │       ├── countdown.js # Таймер до встречи
│   │       ├── miss.js      # Кнопка "скучаю" + пуш-уведомления
│   │       ├── moments.js   # Лента моментов
│   │       └── settings.js  # Настройки (дата, имена)
│   ├── .env.example
│   └── package.json
│
├── frontend/                # React + Vite + @twa-dev/sdk
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx          # Роутинг
│   │   ├── App.css          # Стили
│   │   ├── components/
│   │   │   ├── Countdown.jsx    # Счётчик до встречи
│   │   │   └── MissButton.jsx   # Кнопка "скучаю"
│   │   └── pages/
│   │       ├── HomePage.jsx     # Главная
│   │       ├── MomentsPage.jsx  # Лента моментов
│   │       └── SettingsPage.jsx # Настройки
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Быстрый старт

### 1. Настройка Telegram-бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте нового бота: `/newbot`
3. Задайте имя (например: "Мы — для двоих")
4. Задайте username (например: `us_for_two_bot`)
5. **Скопируйте токен** — он понадобится для `.env`

Подключите мини-апп к боту:
```
/setmenubutton
```
Выберите вашего бота, затем введите URL вашего развёрнутого мини-аппа (пока можно оставить, заполните после деплоя).

### 2. Получение Telegram ID

Каждому из двоих нужно узнать свой Telegram ID:
1. Откройте [@userinfobot](https://t.me/userinfobot)
2. Нажмите Start
3. Бот пришлёт ваш ID (число типа `123456789`)

### 3. Настройка Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com)
2. Создайте новый проект (название любое)
3. Перейдите в **Firestore Database** → Создайте базу (выберите регион ближайший к пользователям)
4. Перейдите в **Project Settings** → **Service Accounts** → **Generate New Private Key**
5. Скачанный JSON-файл содержит данные для `.env`

### 4. Запуск локально

**Backend:**
```bash
cd backend
cp .env.example .env
# Заполните .env (см. переменные ниже)
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Заполните .env
npm install
npm run dev
```

### 5. Переменные окружения

**Backend (.env):**
```
BOT_TOKEN=123456:ABC-DEF...        # Токен от BotFather
USER_A_ID=111111111                 # Telegram ID первого
USER_B_ID=222222222                 # Telegram ID второго
FIREBASE_PROJECT_ID=us-couple-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@us-couple-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
PORT=3001
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001  # URL бэкенда
VITE_USER_A_ID=111111111
VITE_USER_B_ID=222222222
```

---

## Деплой

### Вариант A: Render (бесплатно) + Vercel (бесплатно)

**Backend на Render:**
1. Загрузите код на GitHub
2. Зайдите на [render.com](https://render.com), создайте аккаунт
3. **New Web Service** → подключите репозиторий
4. Настройки:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: добавьте все переменные из `.env`
5. Скопируйте URL (например `https://us-backend.onrender.com`)

**Frontend на Vercel:**
1. Зайдите на [vercel.com](https://vercel.com), подключите GitHub
2. Импортируйте проект
3. Настройки:
   - Root Directory: `frontend`
   - Framework: Vite
   - Environment Variables:
     - `VITE_API_URL` = URL вашего бэкенда на Render
     - `VITE_USER_A_ID` = Telegram ID первого
     - `VITE_USER_B_ID` = Telegram ID второго
4. Деплой

**После деплоя фронтенда:**
1. Вернитесь в @BotFather → `/setmenubutton`
2. Выберите бота
3. Введите URL Vercel-приложения

### Вариант B: Railway + Vercel

Тот же принцип, но бэкенд деплоится на [railway.app](https://railway.app) — slightly easier настройка.

---

## Как это работает

1. Один из двоих открывает бота → нажимает "Открыть" (кнопка меню) → открывается мини-апп
2. Приложение определяет пользователя по Telegram ID и показывает общий интерфейс
3. В настройках задаётся дата встречи и имена
4. На главной — счётчик дней и кнопки "скучаю"
5. При нажатии кнопки — партнёр получает пуш через Telegram-бота
6. В разделе "Моменты" — оба могут делиться фото и текстом

---

## Дальнейшие улучшения (Stage 2)

- Вопрос дня (с ежедневным бот-напоминанием)
- Список "когда встретимся"
- Капсула времени
- Чек-ин настроения
- Общий плейлист
