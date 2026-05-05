# BookStore — Документация проекта

## Структура проекта

```
bookstore/
├── index.html                  ← Главная страница
├── pages/
│   ├── catalog.html            ← Каталог книг
│   ├── book.html               ← Страница книги (book.html?id=1)
│   ├── cart.html               ← Корзина
│   ├── checkout.html           ← Оформление заказа
│   ├── about.html              ← О нас
│   └── contacts.html           ← Контакты
│
├── scss/                       ← SCSS исходники
│   ├── _variables.scss         ← Переменные, цвета, миксины
│   ├── _base.scss              ← Сброс, базовые стили, анимации
│   ├── _layout.scss            ← Header, Footer
│   ├── _components.scss        ← Карточки, кнопки, формы, модалки
│   ├── index.scss              ← Стили главной страницы
│   ├── catalog.scss            ← Стили каталога
│   ├── book.scss               ← Стили страницы книги
│   ├── cart.scss               ← Стили корзины
│   └── pages.scss              ← Стили About, Contacts, Checkout
│
├── css/                        ← Скомпилированный CSS
│   ├── index.css
│   ├── catalog.css
│   ├── book.css
│   ├── cart.css
│   └── pages.css
│
├── js/
│   ├── cart.js                 ← Модуль корзины (localStorage) + Toast
│   ├── xml-loader.js           ← Загрузка XML, парсинг, рендер карточек
│   ├── header.js               ← Бургер-меню, активные ссылки, sticky
│   ├── index.js                ← Главная: слайдер, загрузка секций
│   ├── catalog.js              ← Каталог: фильтры, поиск, сортировка
│   ├── book.js                 ← Страница книги: данные из XML
│   ├── cart-page.js            ← Корзина: рендер, изменение кол-ва
│   ├── checkout.js             ← Оформление: форма, валидация, успех
│   └── contacts.js             ← Форма контактов
│
├── xml/
│   └── catalog.xml             ← Каталог книг (12 книг)
│
└── images/
    ├── covers/                 ← Обложки книг (добавить самостоятельно)
    └── icons/                  ← Иконки

```

## Цветовая схема

| Переменная         | Hex       | Описание              |
|--------------------|-----------|-----------------------|
| `$color-bg`        | `#0d0d0d` | Основной фон          |
| `$color-bg-card`   | `#1a1a1a` | Фон карточек          |
| `$color-gold`      | `#c9a84c` | Золотой акцент        |
| `$color-gold-light`| `#f0c96e` | Светлый золотой       |
| `$color-text`      | `#e8e0d0` | Основной текст        |
| `$color-text-muted`| `#888880` | Приглушённый текст    |
| `$color-border`    | `#2a2a2a` | Границы               |
| `$color-red`       | `#e03a3a` | Красный (скидки)      |
| `$color-green`     | `#4caf7a` | Зелёный (успех)       |

## Шрифты

- **Заголовки**: Montserrat (700, 800, 900) — Google Fonts
- **Текст**: Times New Roman (serif) — системный
- **UI-элементы**: Montserrat (400, 500, 600)

## Адаптивность

| Breakpoint  | Ширина   |
|-------------|----------|
| Mobile      | ≤ 420px  |
| Tablet      | ≤ 768px  |
| Laptop      | ≤ 1024px |
| Desktop     | ≥ 1280px |

## Компиляция SCSS

```bash
# Установить Sass
npm install -g sass

# Компилировать все файлы
sass scss/index.scss css/index.css --style=compressed
sass scss/catalog.scss css/catalog.css --style=compressed
sass scss/book.scss css/book.css --style=compressed
sass scss/cart.scss css/cart.css --style=compressed
sass scss/pages.scss css/pages.css --style=compressed

# Автоматическая пересборка при изменениях
sass --watch scss/:css/ --style=compressed
```

## Добавление обложек книг

Поместите изображения обложек в папку `images/covers/` со следующими именами:
- `master.jpg` — Мастер и Маргарита
- `1984.jpg` — 1984
- `dune.jpg` — Дюна
- `crime.jpg` — Преступление и наказание
- `harry.jpg` — Гарри Поттер и философский камень
- `lotr.jpg` — Властелин колец
- `atomic.jpg` — Atomic Habits
- `solitude.jpg` — Сто лет одиночества
- `ender.jpg` — Игра Эндера
- `thinking.jpg` — Думай медленно...
- `prince.jpg` — Маленький принц
- `three.jpg` — Три товарища

Если изображение не найдено — автоматически показывается плейсхолдер с названием книги.

## Добавление новой книги в XML

```xml
<book id="13">
  <title>Название книги</title>
  <author>Автор</author>
  <genre>Жанр</genre>
  <year>2024</year>
  <publisher>Издательство</publisher>
  <price>12.99</price>
  <oldPrice>19.99</oldPrice>  <!-- пусто если нет скидки -->
  <discount>35</discount>     <!-- 0 если нет скидки -->
  <pages>320</pages>
  <language>Русский</language>
  <cover>images/covers/new-book.jpg</cover>
  <rating>4.7</rating>
  <reviews>1234</reviews>
  <description>Описание книги...</description>
  <featured>false</featured>
  <new>true</new>
</book>
```

## Запуск проекта

Откройте `index.html` в браузере. Для корректной загрузки XML рекомендуется использовать локальный сервер:

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# VS Code: расширение Live Server
```
