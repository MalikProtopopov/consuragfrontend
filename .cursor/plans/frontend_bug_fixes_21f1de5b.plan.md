---
name: Frontend Bug Fixes
overview: "Исправление 6 проблем фронтенда: дублирование запросов при создании аватара, модальное окно для смены плана, длинные названия в сайдбаре, кнопка уведомлений и скрытие нерабочей страницы sessions."
todos:
  - id: fix-avatar-double-submit
    content: Заменить useRef на useState для блокировки кнопки создания аватара
    status: completed
  - id: create-plan-upgrade-modal
    content: Создать модальное окно PlanUpgradeDialog для выбора плана и отправки заявки
    status: completed
  - id: fix-sidebar-project-names
    content: Добавить truncate класс для длинных названий проектов в сайдбаре
    status: completed
  - id: fix-notifications-button
    content: Сделать кнопку уведомлений ссылкой на /settings/notifications
    status: completed
  - id: hide-sessions-page
    content: Скрыть пункт меню 'История сессий' из навигации аватара
    status: completed
---

# План исправления фронтенд-багов

## 1. Дублирование запроса при создании аватара

**Проблема:** `useRef` не вызывает ре-рендер, поэтому кнопка не блокируется сразу после первого клика.**Файл:** [`src/app/(dashboard)/projects/[id]/avatars/new/page.tsx`](src/app/(dashboard)/projects/[id]/avatars/new/page.tsx)**Решение:** Заменить `useRef` на `useState` для `isSubmitting`:

```tsx
// Было:
const isSubmittingRef = useRef(false);

// Станет:
const [isSubmitting, setIsSubmitting] = useState(false);
```

И обновить `handleSubmit` и `disabled` кнопки для использования `isSubmitting` состояния.---

## 2. Модальное окно "Улучшить план"

**Проблема:** Кнопка делает `mailto:`, нужно модальное окно с выбором плана и отправкой заявки через API.**Файл:** [`src/app/(dashboard)/settings/usage/page.tsx`](src/app/\\(dashboard)/settings/usage/page.tsx)**Решение:**

- Создать компонент `PlanUpgradeDialog` с выбором плана и полем для сообщения
- Использовать существующий хук `useCreatePlanRequest` из `@/entities/plan-request`
- Доступные планы: `starter`, `growth`, `scale`, `enterprise`
- API: `POST /api/v1/plan-requests/` с `request_type: "plan_upgrade"`

Тут даже не дублирование запроса а то что лоадер исчезае с кнопки и получается также что запрос отправился, лоадер появился, я потом смотрю лоадер сходит с кнопки, я его еще раз нажимаю и запрос еще раз с теми же данными отправляется.---

## 3. Длинные названия проектов в сайдбаре

**Проблема:** Название проекта выходит за границы сайдбара.**Файл:** [`src/widgets/app-shell/ui/Sidebar.tsx`](src/widgets/app-shell/ui/Sidebar.tsx) (строки 314-322)**Решение:** Добавить `truncate` класс к Link элементу и ограничить ширину контейнера:

```tsx
// Было:
className={cn(
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all overflow-hidden min-w-0 max-w-full",
  ...
)}

// Станет:
className={cn(
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all overflow-hidden min-w-0 truncate",
  ...
)}
```

---

## 4. Кнопка уведомлений в хедере

**Проблема:** Кнопка не реагирует на клик.**Файл:** [`src/widgets/app-shell/ui/header.tsx`](src/widgets/app-shell/ui/header.tsx) (строка 129-133)**Решение:** Заменить `Button` на `Link` ведущий на `/settings/notifications`:

```tsx
// Было:
<Button variant="ghost" size="icon" className="relative">
  <Bell className="size-5" />
</Button>

// Станет:
<Button variant="ghost" size="icon" className="relative" asChild>
  <Link href="/settings/notifications">
    <Bell className="size-5" />
  </Link>
</Button>
```

---

## 5. Скрыть страницу sessions из сайдбара

**Проблема:** Страница `/avatars/[avatarId]/sessions` выдает Application Error.**Файл:** [`src/widgets/app-shell/ui/Sidebar.tsx`](src/widgets/app-shell/ui/Sidebar.tsx)**Решение:** Найти и закомментировать/удалить пункт меню "История сессий" в навигации аватара.---

## 6. Ссылка "Помощь"

**Статус:** Уже исправлена на `https://parmenid.tech/docs` (строки 497-511 в Sidebar.tsx). Изменения нужно задеплоить на сервер через `git pull && make prod-build`.---

## Порядок выполнения

1. Исправить дублирование при создании аватара (критично)
2. Создать модальное окно для смены плана
3. Исправить длинные названия в сайдбаре