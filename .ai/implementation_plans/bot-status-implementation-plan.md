# API Endpoint Implementation Plan: GET /discord-bot/status

## 1. Przegląd punktu końcowego
- Cel: Udostępnienie statusu połączenia bota Discord i identyfikatora kanału głosowego.
- Funkcjonalność: Klient może w każdej chwili sprawdzić, czy bot jest połączony, oraz na którym kanale głosowym.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka: `/discord-bot/status`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: brak
- Request Body: brak

## 3. Wykorzystywane typy
- Backend:
  - `DiscordBotStatusDTO` (zdefiniowany w `backend/app/models.py`)
- Frontend:
  - `DiscordBotStatusDTO` (zdefiniowany w `frontend/src/types.ts`)

## 4. Szczegóły odpowiedzi
- Kody statusu:
  - `200 OK` – zwrócenie obiektu statusu
  - `500 Internal Server Error` – błąd po stronie serwera
- Struktura odpowiedzi (JSON):
  ```json
  {
    "connected": true | false,
    "channelId": "string?"
  }
  ```

## 5. Przepływ danych
1. Klient wysyła GET `/discord-bot/status`.
2. Router FastAPI przekierowuje żądanie do handlera w `discord_bot_router.py`.
3. Handler wywołuje `DiscordBotService.get_status()`:
   - Odczyt instancji `discord.Client` (globalnie udostępnionej w aplikacji).
   - Sprawdzenie `client.is_connected()` i `client.voice_clients` dla aktualnego kanału.
   - Zwrócenie `DiscordBotStatusDTO(connected=..., channel_id=...)`.
4. FastAPI waliduje odpowiedź za pomocą Pydantic i serializuje do JSON.
5. Frontend pobiera JSON i renderuje status w interfejsie.

## 6. Względy bezpieczeństwa
- Brak wewnętrznej autoryzacji – endpoint powinien być dostępny tylko w sieci VPN.
- W przyszłości: dodać middleware autoryzacji oraz uwierzytelnianie tokenem.
- Brak danych wejściowych od użytkownika, minimalne ryzyko SQL Injection.

## 7. Obsługa błędów
| Kod   | Przyczyna                                              | Akcja                                        |
|-------|--------------------------------------------------------|----------------------------------------------|
| 200   | Pomyślne odczytanie statusu bota                       | Zwróć obiekt `DiscordBotStatusDTO`           |
| 500   | Wyjątek podczas komunikacji z Discord lub serwisem      | Zarejestruj w loggerze i zwróć HTTP 500      |

## 8. Rozważania dotyczące wydajności
- Operacja lekka (tylko odczyt pola w klientcie). 
- Można cache’ować wynik na krótką chwilę (np. 1–2 s) przy dużym ruchu.

## 9. Kroki implementacji
### Backend
1. Stworzyć `backend/app/api/discord_bot_router.py`:
   - Zarejestrować `APIRouter(prefix="/discord-bot")`.
   - Dodać handler:
     ```python
     @router.get("/status", response_model=DiscordBotStatusDTO)
     async def get_status():
         return await discord_bot_service.get_status()
     ```
2. Utworzyć `backend/app/services/discord_bot_service.py`:
   - Funkcja `async def get_status() -> DiscordBotStatusDTO`.
   - Pobranie globalnej instancji klienta Discord z `main.py` lub DI.
   - Sprawdzenie `client.is_connected()` i aktualnego `voice_client.channel.id`.
3. W `backend/main.py`:
   - Zaimportować i uruchomić router.
   - Zadeklarować i wystawić instancję `discord.Client` jako zależność lub w module globalnym.
4. Dodać testy jednostkowe w `backend/tests/services/test_discord_bot_service.py`
   - Mock klienta Discord i zasymulować różne stany.
5. Zaraportować wyjątki poprzez logger i obsłużyć HTTP 500 w handlerze.
6. Zaktualizować dokumentację OpenAPI (automatycznie przez FastAPI).

### Frontend
1. Utworzyć plik `frontend/src/lib/discordBotService.ts`:
   ```ts
   import { DiscordBotStatusDTO } from '../types';

   export async function fetchDiscordBotStatus(): Promise<DiscordBotStatusDTO> {
     const res = await fetch('/api/discord-bot/status');
     if (!res.ok) throw new Error('Failed to fetch bot status');
     return res.json();
   }
   ```
   