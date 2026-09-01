I'll look at the assessment folder first.

Прочитал все файлы пакета. Объясняю по-простому.

## Идея мок-данных на пальцах

Представь, что ты строишь витрину магазина, а товар с фабрики ещё не приехал. Ты ставишь **муляжи** — коробки нужного размера и веса. Витрина выглядит и работает точно так же, как с настоящим товаром, и ты спокойно доводишь её до ума.

Мок-данные — это те же муляжи, только вместо бэкенда. Фронтенд «думает», что общается с сервером, а на самом деле отвечает подделка.

## Два способа — и почему в этом задании разрешён только один

**Способ 1 (наивный, здесь запрещён):** импортировать JSON прямо в компонент.

```tsx
import sessions from './fixtures/sessions.json'; // ❌ так нельзя
```

Проблема: когда появится настоящий бэкенд, придётся переписывать все компоненты. Ты ведь не проверил ни загрузку, ни ошибки, ни задержки сети — этого просто не было.

**Способ 2 (правильный, требуется в задании): перехват сети.** Компонент честно делает `fetch('/api/sessions')`. Запрос уходит в сеть — и его на полпути ловит **MSW (Mock Service Worker)** и отвечает сам, из фикстур.

Аналогия: MSW — это дублёр-каскадёр. Камера снимает как обычно, актёр «настоящий» с точки зрения съёмки, но прыгает с крыши дублёр. Когда бэкенд будет готов — просто **выключаешь MSW одной строчкой**, и приложение не меняется ни на байт.

Именно поэтому в [MOCKING_GUIDE.md](training/frontend-accelerator-assessment/MOCKING_GUIDE.md) написано: «Application components and the API client must not import fixture JSON directly».

## Как это устроено технически

MSW регистрирует в браузере **Service Worker** — маленький посредник между твоей страницей и сетью. Он смотрит на каждый исходящий запрос: если путь совпал с описанным «хендлером» — отвечает фейком; если нет — пропускает в реальную сеть.

В тестах (Vitest/Jest) браузера нет, поэтому там MSW перехватывает на уровне Node — но код хендлеров тот же самый.

## Пошагово

### 1. Установка

```bash
npm install --save-dev msw@2.14.6
```

```bash
npx msw init public --save
```

Вторая команда кладёт файл `public/mockServiceWorker.js` — это и есть тот самый «посредник».

### 2. Структура файлов

```text
src/
  mocks/            ← вся «фабрика подделок» живёт здесь и только здесь
    handlers.ts     ← правила: какой путь → какой ответ
    db.ts           ← состояние в памяти (список сессий)
    clock.ts        ← сдвиг дат из fixture-clock.json
    scenarios.ts    ← выбор сценария: normal / empty / list-error / ...
    browser.ts      ← запуск в браузере
    server.ts       ← запуск в тестах
  api/
    sessionsClient.ts ← обычный fetch, ничего не знает про моки
  features/...        ← компоненты, ничего не знают про моки
```

Ключевое правило: **вся «ложь» заперта в папке `src/mocks/`**. Остальное приложение живёт так, будто бэкенд настоящий.

### 3. Хендлеры — сердце всего

```ts
// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { rebase } from './clock';
import { db } from './db';

export const handlers = [
  http.get('/api/sessions', async ({ request }) => {
    await delay(250);

    const url = new URL(request.url);
    const query = (url.searchParams.get('query') ?? '').toLowerCase();
    const status = url.searchParams.get('status') ?? '';

    // ВАЖНО: фильтрация происходит ЗДЕСЬ, в «сервере», а не в компоненте
    const filtered = db.sessions.filter((s) => {
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.coach.name.toLowerCase().includes(query) ||
        s.location.name.toLowerCase().includes(query);
      const matchesStatus = !status || s.status === status;
      return matchesQuery && matchesStatus;
    });

    return HttpResponse.json({
      data: filtered.map(rebase),
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }),

  http.get('/api/sessions/:sessionId', async ({ params }) => {
    const found = db.details.get(params.sessionId as string);
    if (!found) {
      return HttpResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found.' } },
        { status: 404 },
      );
    }
    return HttpResponse.json(rebase(found));
  }),

  http.post('/api/sessions', async ({ request }) => {
    const body = await request.json();
    const fieldErrors = validate(body); // твоя проверка полей

    if (Object.keys(fieldErrors).length > 0) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Invalid input.', fieldErrors } },
        { status: 400 },
      );
    }

    const created = db.create(body); // кладём в память
    return HttpResponse.json(created, { status: 201 });
  }),
];
```

Обрати внимание на две вещи, которые прямо требует задание:

- **Фильтр `query`/`status` считается в хендлере.** Нельзя отдать все 5 записей и отфильтровать их в React — в [API_CONTRACT.md](training/frontend-accelerator-assessment/API_CONTRACT.md) сказано: «MSW handlers must apply `query` and `status` before calculating `meta.total`». Смысл в том, что настоящий сервер работает так же, и твой UI должен быть к этому готов.
- **`POST` меняет состояние.** Созданная сессия должна потом появиться в списке и в деталях. Отсюда `db.ts` — обычный объект в памяти, который живёт до перезагрузки страницы.

### 4. Запуск в браузере

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

```tsx
// src/main.tsx
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'warn' });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
});
```

Здесь важен `await` перед рендером: иначе первый запрос успеет улететь мимо ещё не проснувшегося воркера, и ты получишь загадочную ошибку.

### 5. Запуск в тестах

```ts
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```ts
// vitest.setup.ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

В конкретном тесте можно точечно подменить ответ — проверить, как UI показывает ошибку:

```ts
server.use(
  http.get('/api/sessions', () =>
    HttpResponse.json(
      { error: { code: 'SESSIONS_UNAVAILABLE', message: '...' } },
      { status: 500 },
    ),
  ),
);
```

## Две специфические штуки этого задания

**«Часы фикстур» ([fixture-clock.json](training/frontend-accelerator-assessment/fixtures/fixture-clock.json)).** В фикстурах даты зафиксированы на 27 июля 2026. Если открыть приложение через год, все сессии окажутся «в прошлом», и вкладка «предстоящие» опустеет. Поэтому при старте моков считаешь разницу между «сейчас» и `referenceNow` и сдвигаешь на неё все `startsAt`, `createdAt`, `updatedAt`, `cancelledAt`. Это как перевести стрелки у всех часов в декорациях сразу — соотношение «эта сессия раньше той» сохраняется навсегда.

Сдвиг делается **только внутри моков**. Наружу уходят обычные ISO-строки, и приложение ни о чём не догадывается.

**Сценарии.** В [mock-scenarios.json](training/frontend-accelerator-assessment/fixtures/mock-scenarios.json) описаны состояния: `normal`, `empty`, `list-error`, `details-error`, `coaches-error`, `create-error`. Это переключатель «а покажи-ка мне, как выглядит пустой список» или «как выглядит упавший сервер». Способ переключения выбираешь сам — например, переменная окружения или параметр URL:

```ts
// src/mocks/scenarios.ts
export const scenario =
  new URLSearchParams(location.search).get('scenario') ??
  import.meta.env.VITE_MOCK_SCENARIO ??
  'normal';
```

Читается этот флаг **только в `src/mocks/`**. Компонент никогда не пишет `if (scenario === 'empty')` — он просто получает пустой массив и рисует пустое состояние. Это прямо записано в контракте: «Presentation components ... must not branch on scenario names».

## Короткий чек-лист

| Можно | Нельзя |
|---|---|
| `fetch('/api/sessions?query=...')` из клиента | `import sessions from '.../sessions.json'` в компоненте |
| Фильтрация внутри хендлера | Фильтрация всего списка в React |
| Флаг сценария читает только `src/mocks/` | `if (scenario === 'empty')` в JSX |
| Ошибки как настоящие HTTP-коды 400/404/500 | `throw new Error()` вместо ответа |
| Даты — ISO-строки UTC на границе | Сдвиг времени в компонентах |

**Главная мысль:** мок — это не «данные внутри приложения», а **фальшивый сервер снаружи него**. Приложение остаётся полностью честным, и в день, когда появится реальный бэкенд, ты удаляешь одну строчку `enableMocking()` — и всё работает.
