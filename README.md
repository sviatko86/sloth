# Sloth

Мотиваційний застосунок для лінивих: торг з ліню, голосове керування, бос дня, компаньйон-лінивець, клуб, серіал дня. Дві мови: українська та англійська.

A motivation app for lazy people: bargaining with laziness, voice control, boss of the day, a sloth companion, a lazy club and a daily episode. Ukrainian and English.

- `App.js`, `src/` — мобільний застосунок (Expo, React Native).
- `config.default.json` — стандартний контент: спільні налаштування + мовні пакети `languages.uk` і `languages.en`.
- `admin/` — веб-адмінка: редагування всього контенту обома мовами без програміста.
- `supabase/` — схема бази й початкові дані.

## Запуск на телефоні

1. Встанови на телефон **Expo Go** (App Store / Google Play).
2. На комп’ютері: `npm install`, потім `npx expo install --fix`, потім `npx expo start`.
3. Відскануй QR-код камерою телефона.

Голосове розпізнавання працює у власній збірці (`npx expo run:android` або EAS Build). В Expo Go замість мікрофона показуються фрази-кнопки.

## Мова

Застосунок бере мову телефона (українська → `uk`, інші → `en`, якщо є), її можна змінити у вкладці «Функції / Features». Нову мову можна додати в адмінці: скопіюй пакет `en` під новим кодом.
