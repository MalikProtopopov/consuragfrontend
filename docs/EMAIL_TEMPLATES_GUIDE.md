# Руководство по Email-шаблонам

Документация для бэкенд-разработчика по созданию красивых email-писем для платформы ConsRAG.

## Содержание

1. [Общие принципы](#общие-принципы)
2. [Дизайн-токены](#дизайн-токены)
3. [Базовая структура письма](#базовая-структура-письма)
4. [Шаблоны писем](#шаблоны-писем)
   - [Подтверждение email](#1-подтверждение-email)
   - [Успешная регистрация](#2-успешная-регистрация)
   - [Лимиты исчерпаны](#3-лимиты-исчерпаны)
   - [Напоминание о подписке (3 дня)](#4-напоминание-о-подписке-3-дня)
   - [Напоминание о подписке (1 день)](#5-напоминание-о-подписке-1-день)
   - [Подписка истекла](#6-подписка-истекла)
5. [Компоненты](#компоненты)
6. [Рекомендации](#рекомендации)

---

## Общие принципы

### Совместимость с email-клиентами

1. **Используйте только inline-стили** — email-клиенты игнорируют `<style>` теги
2. **Табличная вёрстка** — используйте `<table>` для layout (flexbox/grid не работают)
3. **Максимальная ширина 600px** — стандарт для email
4. **Безопасные шрифты** — основной: Arial, запасной: Helvetica, sans-serif
5. **Alt-тексты для изображений** — многие клиенты блокируют картинки по умолчанию

### Структура письма

```
┌──────────────────────────────────────────────────────────────┐
│                    Логотип ConsRAG                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │                                                  │     │
│    │              Основной контент                    │     │
│    │              (белая карточка)                    │     │
│    │                                                  │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │         Акцентный блок (золотой)                 │     │
│    │         Кнопка CTA                               │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    Футер с контактами                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Дизайн-токены

### Цветовая палитра

| Токен | HEX | Использование |
|-------|-----|---------------|
| `--accent-primary` | `#FFCD33` | Акцентные элементы, кнопки CTA |
| `--accent-dark` | `#D4A900` | Hover состояния, тени |
| `--bg-dark` | `#0C0C0E` | Тёмный фон |
| `--bg-card` | `#151518` | Фон карточек (тёмная тема) |
| `--bg-light` | `#F4F4F5` | Светлый фон письма |
| `--text-primary` | `#1A1A1A` | Основной текст |
| `--text-secondary` | `#6B7280` | Вторичный текст |
| `--text-muted` | `#9CA3AF` | Приглушённый текст |
| `--success` | `#22C55E` | Успешные действия |
| `--warning` | `#F59E0B` | Предупреждения |
| `--error` | `#EF4444` | Ошибки, срочные уведомления |
| `--info` | `#3B82F6` | Информационные блоки |

### Типографика

```
Основной шрифт: Arial, Helvetica, sans-serif
Размеры:
  - Заголовок h1: 28px, bold
  - Заголовок h2: 22px, bold  
  - Подзаголовок: 18px, semibold
  - Основной текст: 16px, normal
  - Мелкий текст: 14px, normal
  - Футер: 12px, normal

Line-height: 1.5 (24px для 16px текста)
```

### Отступы и скругления

```
Внешние отступы контейнера: 24px
Внутренние отступы карточки: 32px
Скругления карточек: 16px
Скругления кнопок: 8px
```

---

## Базовая структура письма

### HTML-обёртка

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{SUBJECT}}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: Arial, Helvetica, sans-serif;">
  
  <!-- Основной контейнер -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F4F5;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        
        <!-- Контейнер письма 600px -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          
          <!-- HEADER -->
          {{HEADER}}
          
          <!-- CONTENT -->
          {{CONTENT}}
          
          <!-- FOOTER -->
          {{FOOTER}}
          
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>
```

### Компонент Header

```html
<!-- HEADER с логотипом -->
<tr>
  <td align="center" style="padding: 24px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right: 12px;">
          <!-- Иконка логотипа (квадрат с буквой C) -->
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 10px; display: inline-block; text-align: center; line-height: 40px;">
            <span style="color: #1A1A1A; font-size: 22px; font-weight: bold;">C</span>
          </div>
        </td>
        <td>
          <span style="font-size: 24px; font-weight: bold; color: #1A1A1A;">ConsRAG</span>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### Компонент Footer

```html
<!-- FOOTER -->
<tr>
  <td style="padding: 32px 24px; text-align: center;">
    <p style="margin: 0 0 16px; font-size: 14px; color: #6B7280; line-height: 1.5;">
      Это автоматическое сообщение от платформы ConsRAG.<br>
      Пожалуйста, не отвечайте на это письмо.
    </p>
    <p style="margin: 0 0 16px; font-size: 12px; color: #9CA3AF;">
      © 2026 ConsRAG. Все права защищены.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center">
      <tr>
        <td style="padding: 0 8px;">
          <a href="{{DASHBOARD_URL}}" style="color: #FFCD33; text-decoration: none; font-size: 12px;">Личный кабинет</a>
        </td>
        <td style="color: #9CA3AF;">|</td>
        <td style="padding: 0 8px;">
          <a href="{{SUPPORT_URL}}" style="color: #FFCD33; text-decoration: none; font-size: 12px;">Поддержка</a>
        </td>
        <td style="color: #9CA3AF;">|</td>
        <td style="padding: 0 8px;">
          <a href="{{UNSUBSCRIBE_URL}}" style="color: #9CA3AF; text-decoration: none; font-size: 12px;">Отписаться</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

---

## Шаблоны писем

### 1. Подтверждение email

**Subject:** Подтвердите ваш email — ConsRAG

```html
<!-- CONTENT: Подтверждение email -->
<tr>
  <td>
    <!-- Главная карточка -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Верхний акцентный бар -->
      <tr>
        <td style="height: 4px; background: linear-gradient(90deg, #FFCD33 0%, #D4A900 100%);"></td>
      </tr>
      
      <!-- Контент -->
      <tr>
        <td style="padding: 40px 32px;">
          <!-- Иконка -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
            <tr>
              <td style="width: 72px; height: 72px; background-color: #FEF3C7; border-radius: 50%; text-align: center; line-height: 72px;">
                <span style="font-size: 36px;">✉️</span>
              </td>
            </tr>
          </table>
          
          <!-- Заголовок -->
          <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: bold; color: #1A1A1A; text-align: center; line-height: 1.3;">
            Подтвердите ваш email
          </h1>
          
          <!-- Подзаголовок -->
          <p style="margin: 0 0 32px; font-size: 16px; color: #6B7280; text-align: center; line-height: 1.5;">
            Добро пожаловать в ConsRAG! Для завершения регистрации подтвердите ваш email-адрес.
          </p>
          
          <!-- Email пользователя -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <td style="padding: 16px 20px; background-color: #F9FAFB; border-radius: 8px; text-align: center;">
                <span style="font-size: 16px; color: #374151; font-weight: 500;">{{USER_EMAIL}}</span>
              </td>
            </tr>
          </table>
          
          <!-- Кнопка CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 8px;">
                <a href="{{VERIFICATION_URL}}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: bold; color: #1A1A1A; text-decoration: none;">
                  Подтвердить email
                </a>
              </td>
            </tr>
          </table>
          
          <!-- Дополнительная ссылка -->
          <p style="margin: 24px 0 0; font-size: 14px; color: #9CA3AF; text-align: center; line-height: 1.5;">
            Или скопируйте ссылку:<br>
            <a href="{{VERIFICATION_URL}}" style="color: #FFCD33; word-break: break-all;">{{VERIFICATION_URL}}</a>
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Информационный блок -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px;">
      <tr>
        <td style="padding: 20px 24px; background-color: #F0F9FF; border-radius: 12px; border-left: 4px solid #3B82F6;">
          <p style="margin: 0; font-size: 14px; color: #1E40AF; line-height: 1.5;">
            <strong>⏰ Важно:</strong> Ссылка действительна 24 часа. Если вы не запрашивали регистрацию, просто проигнорируйте это письмо.
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### 2. Успешная регистрация

**Subject:** Добро пожаловать в ConsRAG! 🎉

```html
<!-- CONTENT: Welcome -->
<tr>
  <td>
    <!-- Главная карточка -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Верхний баннер с градиентом -->
      <tr>
        <td style="padding: 48px 32px; background: linear-gradient(135deg, #0C0C0E 0%, #1A1A2E 100%); text-align: center;">
          <!-- Логотип на тёмном фоне -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
            <tr>
              <td style="width: 64px; height: 64px; background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 16px; text-align: center; line-height: 64px;">
                <span style="color: #1A1A1A; font-size: 32px; font-weight: bold;">C</span>
              </td>
            </tr>
          </table>
          <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: bold; color: #FFFFFF;">
            Добро пожаловать!
          </h1>
          <p style="margin: 0; font-size: 18px; color: #FFCD33;">
            Ваш аккаунт успешно создан
          </p>
        </td>
      </tr>
      
      <!-- Контент -->
      <tr>
        <td style="padding: 40px 32px;">
          <p style="margin: 0 0 24px; font-size: 16px; color: #374151; line-height: 1.6;">
            Привет, <strong>{{USER_NAME}}</strong>! 👋
          </p>
          <p style="margin: 0 0 32px; font-size: 16px; color: #6B7280; line-height: 1.6;">
            Спасибо за регистрацию в ConsRAG — платформе для создания AI-аватаров и интеллектуальных чат-ботов.
          </p>
          
          <!-- Что можно делать -->
          <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: bold; color: #1A1A1A;">
            Что вы можете делать:
          </h2>
          
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
            <!-- Пункт 1 -->
            <tr>
              <td style="padding: 12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 48px; height: 48px; background-color: #ECFDF5; border-radius: 12px; text-align: center; line-height: 48px; vertical-align: top;">
                      <span style="font-size: 24px;">🤖</span>
                    </td>
                    <td style="padding-left: 16px; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1A1A1A;">Создавать AI-аватары</p>
                      <p style="margin: 0; font-size: 14px; color: #6B7280;">Обучайте ботов на ваших документах</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Пункт 2 -->
            <tr>
              <td style="padding: 12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 48px; height: 48px; background-color: #FEF3C7; border-radius: 12px; text-align: center; line-height: 48px; vertical-align: top;">
                      <span style="font-size: 24px;">📊</span>
                    </td>
                    <td style="padding-left: 16px; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1A1A1A;">Отслеживать аналитику</p>
                      <p style="margin: 0; font-size: 14px; color: #6B7280;">Мониторьте использование и эффективность</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Пункт 3 -->
            <tr>
              <td style="padding: 12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 48px; height: 48px; background-color: #EDE9FE; border-radius: 12px; text-align: center; line-height: 48px; vertical-align: top;">
                      <span style="font-size: 24px;">🔗</span>
                    </td>
                    <td style="padding-left: 16px; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1A1A1A;">Интегрировать с Telegram</p>
                      <p style="margin: 0; font-size: 14px; color: #6B7280;">Подключайте ботов к мессенджерам</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 8px;">
                <a href="{{DASHBOARD_URL}}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: bold; color: #1A1A1A; text-decoration: none;">
                  Перейти в личный кабинет →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Блок с планом -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <p style="margin: 0 0 4px; font-size: 14px; color: #6B7280;">Ваш текущий план</p>
                <p style="margin: 0; font-size: 20px; font-weight: bold; color: #1A1A1A;">{{PLAN_NAME}}</p>
              </td>
              <td style="text-align: right;">
                <span style="display: inline-block; padding: 6px 16px; background-color: #ECFDF5; color: #059669; font-size: 14px; font-weight: 600; border-radius: 20px;">
                  Активен
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### 3. Лимиты исчерпаны

**Subject:** ⚠️ Лимит токенов исчерпан — ConsRAG

```html
<!-- CONTENT: Лимиты исчерпаны -->
<tr>
  <td>
    <!-- Главная карточка -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Верхний оранжевый бар предупреждения -->
      <tr>
        <td style="height: 4px; background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);"></td>
      </tr>
      
      <!-- Контент -->
      <tr>
        <td style="padding: 40px 32px;">
          <!-- Иконка предупреждения -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
            <tr>
              <td style="width: 72px; height: 72px; background-color: #FEF3C7; border-radius: 50%; text-align: center; line-height: 72px;">
                <span style="font-size: 36px;">⚠️</span>
              </td>
            </tr>
          </table>
          
          <!-- Заголовок -->
          <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: bold; color: #1A1A1A; text-align: center;">
            Лимит токенов исчерпан
          </h1>
          
          <p style="margin: 0 0 32px; font-size: 16px; color: #6B7280; text-align: center; line-height: 1.5;">
            Вы использовали все доступные токены на вашем плане <strong>{{PLAN_NAME}}</strong>.
          </p>
          
          <!-- Статистика использования -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px; background-color: #F9FAFB; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="padding: 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <!-- Chat токены -->
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 14px; color: #6B7280;">Chat токены</td>
                          <td style="text-align: right; font-size: 14px; font-weight: 600; color: #EF4444;">
                            {{CHAT_USED}} / {{CHAT_LIMIT}}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 8px;">
                            <div style="height: 8px; background-color: #E5E7EB; border-radius: 4px; overflow: hidden;">
                              <div style="width: 100%; height: 100%; background-color: #EF4444; border-radius: 4px;"></div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Embedding токены -->
                  <tr>
                    <td>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 14px; color: #6B7280;">Embedding токены</td>
                          <td style="text-align: right; font-size: 14px; font-weight: 600; color: {{EMBED_COLOR}};">
                            {{EMBED_USED}} / {{EMBED_LIMIT}}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 8px;">
                            <div style="height: 8px; background-color: #E5E7EB; border-radius: 4px; overflow: hidden;">
                              <div style="width: {{EMBED_PERCENT}}%; height: 100%; background-color: {{EMBED_COLOR}}; border-radius: 4px;"></div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 16px;">
            <tr>
              <td style="background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 8px;">
                <a href="{{UPGRADE_URL}}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: bold; color: #1A1A1A; text-decoration: none;">
                  Увеличить лимит →
                </a>
              </td>
            </tr>
          </table>
          
          <p style="margin: 0; font-size: 14px; color: #9CA3AF; text-align: center;">
            Или подождите до {{RESET_DATE}} для сброса лимитов
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Преимущества апгрейда -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; background: linear-gradient(135deg, #0C0C0E 0%, #1A1A2E 100%); border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #FFCD33;">
            💡 Преимущества следующего плана:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 4px 0; color: #FFFFFF; font-size: 14px;">✓ {{NEXT_PLAN_CHAT_LIMIT}} chat токенов</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #FFFFFF; font-size: 14px;">✓ {{NEXT_PLAN_EMBED_LIMIT}} embedding токенов</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #FFFFFF; font-size: 14px;">✓ До {{NEXT_PLAN_PROJECTS}} проектов</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### 4. Напоминание о подписке (3 дня)

**Subject:** Ваша подписка истекает через 3 дня — ConsRAG

```html
<!-- CONTENT: Напоминание 3 дня -->
<tr>
  <td>
    <!-- Главная карточка -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Верхний блок с таймером -->
      <tr>
        <td style="padding: 40px 32px; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">
            Подписка истекает через
          </p>
          <!-- Таймер -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="padding: 0 8px; text-align: center;">
                <div style="width: 72px; height: 72px; background-color: rgba(255,255,255,0.15); border-radius: 12px; line-height: 72px;">
                  <span style="font-size: 36px; font-weight: bold; color: #FFFFFF;">3</span>
                </div>
                <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">ДНЯ</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Контент -->
      <tr>
        <td style="padding: 40px 32px;">
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #1A1A1A; text-align: center;">
            Не потеряйте доступ к вашим проектам
          </h1>
          
          <p style="margin: 0 0 32px; font-size: 16px; color: #6B7280; text-align: center; line-height: 1.5;">
            Ваша подписка <strong>{{PLAN_NAME}}</strong> истекает <strong>{{EXPIRY_DATE}}</strong>. 
            Продлите сейчас, чтобы сохранить все возможности.
          </p>
          
          <!-- Что будет потеряно -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px; background-color: #FEF2F2; border-radius: 12px; border-left: 4px solid #EF4444;">
            <tr>
              <td style="padding: 20px 24px;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #991B1B;">
                  Что произойдёт после истечения:
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 4px 0; color: #7F1D1D; font-size: 14px;">• Доступ будет ограничен до плана FREE</td></tr>
                  <tr><td style="padding: 4px 0; color: #7F1D1D; font-size: 14px;">• Лимиты токенов уменьшатся</td></tr>
                  <tr><td style="padding: 4px 0; color: #7F1D1D; font-size: 14px;">• Часть проектов станет недоступна</td></tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 8px;">
                <a href="{{RENEW_URL}}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: bold; color: #1A1A1A; text-decoration: none;">
                  Продлить подписку
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### 5. Напоминание о подписке (1 день)

**Subject:** ⚡ ПОСЛЕДНИЙ ДЕНЬ подписки — ConsRAG

```html
<!-- CONTENT: Напоминание 1 день (СРОЧНО) -->
<tr>
  <td>
    <!-- Главная карточка -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Верхний блок СРОЧНО -->
      <tr>
        <td style="padding: 40px 32px; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
            ⚡ СРОЧНО
          </p>
          <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: bold; color: #FFFFFF;">
            Последний день подписки!
          </h1>
          <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">
            Истекает сегодня в 23:59
          </p>
        </td>
      </tr>
      
      <!-- Контент -->
      <tr>
        <td style="padding: 40px 32px;">
          <p style="margin: 0 0 24px; font-size: 16px; color: #374151; line-height: 1.6; text-align: center;">
            <strong>{{USER_NAME}}</strong>, ваша подписка <strong>{{PLAN_NAME}}</strong> 
            истекает сегодня. Действуйте сейчас!
          </p>
          
          <!-- Статус аккаунта -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <td width="50%" style="padding: 16px; background-color: #F9FAFB; border-radius: 12px 0 0 12px; text-align: center; border-right: 1px solid #E5E7EB;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Активных проектов</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1A1A1A;">{{PROJECTS_COUNT}}</p>
              </td>
              <td width="50%" style="padding: 16px; background-color: #F9FAFB; border-radius: 0 12px 12px 0; text-align: center;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280; text-transform: uppercase;">AI-аватаров</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1A1A1A;">{{AVATARS_COUNT}}</p>
              </td>
            </tr>
          </table>
          
          <!-- CTA большая -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 12px; text-align: center;">
                <a href="{{RENEW_URL}}" style="display: block; padding: 20px; font-size: 18px; font-weight: bold; color: #1A1A1A; text-decoration: none;">
                  🔒 Сохранить доступ — Продлить сейчас
                </a>
              </td>
            </tr>
          </table>
          
          <p style="margin: 24px 0 0; font-size: 14px; color: #9CA3AF; text-align: center;">
            Есть вопросы? <a href="{{SUPPORT_URL}}" style="color: #FFCD33;">Напишите в поддержку</a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### 6. Подписка истекла

**Subject:** Ваша подписка истекла — ConsRAG

```html
<!-- CONTENT: Подписка истекла -->
<tr>
  <td>
    <!-- Главная карточка -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Серый верхний бар -->
      <tr>
        <td style="height: 4px; background-color: #9CA3AF;"></td>
      </tr>
      
      <!-- Контент -->
      <tr>
        <td style="padding: 40px 32px;">
          <!-- Иконка -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
            <tr>
              <td style="width: 72px; height: 72px; background-color: #F3F4F6; border-radius: 50%; text-align: center; line-height: 72px;">
                <span style="font-size: 36px;">😔</span>
              </td>
            </tr>
          </table>
          
          <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: bold; color: #1A1A1A; text-align: center;">
            Подписка истекла
          </h1>
          
          <p style="margin: 0 0 32px; font-size: 16px; color: #6B7280; text-align: center; line-height: 1.5;">
            Ваша подписка <strong>{{PLAN_NAME}}</strong> завершилась {{EXPIRY_DATE}}.<br>
            Ваш аккаунт переведён на бесплатный план.
          </p>
          
          <!-- Что изменилось -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px; background-color: #F9FAFB; border-radius: 12px;">
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1A1A1A;">
                  Текущие ограничения:
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                      <span style="color: #6B7280;">Chat токены</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; text-align: right;">
                      <span style="color: #1A1A1A; font-weight: 600;">10,000 / мес</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                      <span style="color: #6B7280;">Проектов</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; text-align: right;">
                      <span style="color: #1A1A1A; font-weight: 600;">1</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #6B7280;">Аватаров на проект</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: #1A1A1A; font-weight: 600;">1</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 16px;">
            <tr>
              <td style="background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 8px;">
                <a href="{{UPGRADE_URL}}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: bold; color: #1A1A1A; text-decoration: none;">
                  Возобновить подписку
                </a>
              </td>
            </tr>
          </table>
          
          <p style="margin: 0; font-size: 14px; color: #9CA3AF; text-align: center;">
            Ваши данные сохранены и будут доступны после возобновления
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Специальное предложение -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; background: linear-gradient(135deg, #0C0C0E 0%, #1A1A2E 100%); border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #FFCD33; text-transform: uppercase; letter-spacing: 1px;">
            🎁 Специальное предложение
          </p>
          <p style="margin: 0 0 16px; font-size: 20px; font-weight: bold; color: #FFFFFF;">
            Скидка 20% на любой план
          </p>
          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">
            Используйте код <span style="color: #FFCD33; font-weight: bold;">COMEBACK20</span> при оплате
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

---

## Компоненты

### Кнопка CTA (Primary)

```html
<table role="presentation" cellpadding="0" cellspacing="0" align="center">
  <tr>
    <td style="background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 8px;">
      <a href="{{URL}}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: bold; color: #1A1A1A; text-decoration: none;">
        {{BUTTON_TEXT}}
      </a>
    </td>
  </tr>
</table>
```

### Кнопка Secondary

```html
<table role="presentation" cellpadding="0" cellspacing="0" align="center">
  <tr>
    <td style="border: 2px solid #E5E7EB; border-radius: 8px;">
      <a href="{{URL}}" style="display: inline-block; padding: 14px 46px; font-size: 16px; font-weight: 600; color: #374151; text-decoration: none;">
        {{BUTTON_TEXT}}
      </a>
    </td>
  </tr>
</table>
```

### Алерт информационный

```html
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 16px 20px; background-color: #F0F9FF; border-radius: 8px; border-left: 4px solid #3B82F6;">
      <p style="margin: 0; font-size: 14px; color: #1E40AF; line-height: 1.5;">
        <strong>ℹ️ Информация:</strong> {{MESSAGE}}
      </p>
    </td>
  </tr>
</table>
```

### Алерт предупреждение

```html
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 16px 20px; background-color: #FFFBEB; border-radius: 8px; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.5;">
        <strong>⚠️ Внимание:</strong> {{MESSAGE}}
      </p>
    </td>
  </tr>
</table>
```

### Алерт ошибка

```html
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 16px 20px; background-color: #FEF2F2; border-radius: 8px; border-left: 4px solid #EF4444;">
      <p style="margin: 0; font-size: 14px; color: #991B1B; line-height: 1.5;">
        <strong>❌ Ошибка:</strong> {{MESSAGE}}
      </p>
    </td>
  </tr>
</table>
```

### Разделитель

```html
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 24px 0;">
      <div style="height: 1px; background-color: #E5E7EB;"></div>
    </td>
  </tr>
</table>
```

---

## Рекомендации

### Переменные шаблонов

| Переменная | Описание | Пример |
|------------|----------|--------|
| `{{USER_NAME}}` | Имя пользователя | Александр |
| `{{USER_EMAIL}}` | Email пользователя | alex@example.com |
| `{{PLAN_NAME}}` | Название плана | GROWTH |
| `{{EXPIRY_DATE}}` | Дата истечения | 15 января 2026 |
| `{{VERIFICATION_URL}}` | URL подтверждения | https://... |
| `{{DASHBOARD_URL}}` | URL личного кабинета | https://app.consrag.com |
| `{{UPGRADE_URL}}` | URL страницы апгрейда | https://app.consrag.com/billing |
| `{{SUPPORT_URL}}` | URL поддержки | https://consrag.com/support |
| `{{CHAT_USED}}` | Использовано chat токенов | 98,500 |
| `{{CHAT_LIMIT}}` | Лимит chat токенов | 100,000 |

### Тестирование писем

1. **Litmus / Email on Acid** — для тестирования в разных клиентах
2. **Проверяйте в**:
   - Gmail (Web + Mobile)
   - Outlook (Desktop + Web)
   - Apple Mail
   - Yahoo Mail
3. **Dark mode** — проверьте как выглядит в тёмной теме клиента

### Доставляемость

1. Добавьте DKIM, SPF, DMARC записи
2. Используйте консистентный From address
3. Не используйте спам-слова ("бесплатно", "срочно" и т.д. в subject)
4. Соблюдайте соотношение текст/картинки (больше текста)
5. Добавьте ссылку отписки

### Локализация

Все тексты должны поддерживать локализацию. Рекомендуемая структура:

```json
{
  "email": {
    "verify": {
      "subject": "Подтвердите ваш email — ConsRAG",
      "title": "Подтвердите ваш email",
      "description": "Добро пожаловать в ConsRAG!...",
      "button": "Подтвердить email",
      "expires_note": "Ссылка действительна 24 часа"
    }
  }
}
```

---

## Пример полного письма

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Подтвердите ваш email — ConsRAG</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F4F5;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          
          <!-- HEADER -->
          <tr>
            <td align="center" style="padding: 24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #FFCD33 0%, #D4A900 100%); border-radius: 10px; text-align: center; line-height: 40px;">
                      <span style="color: #1A1A1A; font-size: 22px; font-weight: bold;">C</span>
                    </div>
                  </td>
                  <td>
                    <span style="font-size: 24px; font-weight: bold; color: #1A1A1A;">ConsRAG</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CONTENT (подставляется нужный шаблон) -->
          <!-- ... -->
          
          <!-- FOOTER -->
          <tr>
            <td style="padding: 32px 24px; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #6B7280; line-height: 1.5;">
                Это автоматическое сообщение от платформы ConsRAG.<br>
                Пожалуйста, не отвечайте на это письмо.
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #9CA3AF;">
                © 2026 ConsRAG. Все права защищены.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://app.consrag.com" style="color: #FFCD33; text-decoration: none; font-size: 12px;">Личный кабинет</a>
                  </td>
                  <td style="color: #9CA3AF;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="https://consrag.com/support" style="color: #FFCD33; text-decoration: none; font-size: 12px;">Поддержка</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Чек-лист перед отправкой

- [ ] Все переменные заменены на реальные значения
- [ ] Ссылки работают корректно
- [ ] Протестировано в основных email-клиентах
- [ ] Текст читается без картинок
- [ ] Есть ссылка отписки
- [ ] Subject line не содержит спам-слов
- [ ] Preheader text настроен
- [ ] Письмо корректно отображается на мобильных

