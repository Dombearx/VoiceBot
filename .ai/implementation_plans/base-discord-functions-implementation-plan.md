# API Endpoint Implementation Plan: Discord Bot Integration Endpoints

## 1. Przegląd punktu końcowego
Ten zestaw punktów końcowych umożliwia integrację bota Discord z kanałami głosowymi:
- **GET /discord-bot/channels**: pobranie listy dostępnych kanałów głosowych
- **POST /discord-bot/connect**: podłączenie bota do wybranego kanału
- **POST /discord-bot/disconnect**: rozłączenie bota z kanału
- **PATCH /discord-bot/config**: aktualizacja nazwy oraz awatara bota

## 2. Szczegóły żądania

### GET /discord-bot/channels  
- Metoda HTTP: GET  
- URL: `/discord-bot/channels`  
- Parametry zapytania: brak  

### POST /discord-bot/connect  
- Metoda HTTP: POST  
- URL: `/discord-bot/connect`  
- Request Body (JSON):  
  ```json
  { "channelId": "string" }
  ```  
- Walidacja: `channelId` nie może być pusty  

### POST /discord-bot/disconnect  
- Metoda HTTP: POST  
- URL: `/discord-bot/disconnect`  
- Request Body: brak  

### PATCH /discord-bot/config  
- Metoda HTTP: PATCH  
- URL: `/discord-bot/config`  
- Request Body (multipart/form-data):  
  - `name` (string, wymagane, 1–100 znaków)  
  - `avatar` (plik: `jpg|png`, max 2 MB)  
- Walidacja: typ MIME i rozszerzenie pliku, oraz długość nazwy  

### Wykorzystywane typy żądań
- `ConnectBotCommand` (Pydantic BaseModel)  
- `BotConfigCommand` (Pydantic BaseModel)  

## 3. Szczegóły odpowiedzi

### GET /discord-bot/channels → 200 OK  
```json
[ { "id": "string", "name": "string" } ]
```  

### POST /discord-bot/connect → 200 OK  
```json
{ "connected": true, "channelId": "string" }
```  

### POST /discord-bot/disconnect → 200 OK  
```json
{ "connected": false }
```  

### PATCH /discord-bot/config → 200 OK  
```json
{ "name": "string", "avatarUrl": "string" }
```  

### Wykorzystywane typy odpowiedzi
- `VoiceChannelDTO`  
- `DiscordBotStatusDTO`  
- `BotConfigResponseDTO`  

## 4. Przepływ danych
1. Klient wysyła żądanie do odpowiedniego endpointa FastAPI  
2. FastAPI waliduje dane za pomocą Pydantic Command/DTO  
3. Endpoint wywołuje metodę w `DiscordBotManager` (istniejący serwis w `backend/app/services/discord_bot_service.py`)  
   - `list_channels()`  
   - `connect(channel_id)`  
   - `disconnect()`  
   - `update_config(name, avatar_bytes)`  
4. `DiscordService` korzysta z `discord.py` do komunikacji z Discord Gateway  
5. Wynik zwracany jest jako Pydantic DTO przez FastAPI  

## 5. Względy bezpieczeństwa
- **Brak autoryzacji w MVP** – dostęp tylko w sieci VPN  
- Ograniczenie rozmiaru i typu pliku dla awatara  
- Sanitizacja i walidacja pól wejściowych  
- Obsługa rate limiting (możliwość dodania middleware)  
- Unikanie ujawniania szczegółów wewnętrznych błędów klientowi  

## 6. Obsługa błędów
| Scenariusz                             | Kod statusu | Opis                                 |
|----------------------------------------|-------------|--------------------------------------|
| Nieprawidłowe dane wejściowe           | 400         | Błędny JSON lub brakujące pola       |
| Brak kanału o podanym `channelId`      | 404         | Kanał nie istnieje lub jest niedostępny |
| Brak uprawnień Discord API (Forbidden) | 403         | Bot nie ma dostępu do kanału         |
| Błąd wewnętrzny `discord.py` lub serwera | 500         | Nieoczekiwany wyjątek                |

## 7. Rozważania dotyczące wydajności
- Użycie asynchronicznych wywołań `discord.py`  
- Buforowanie listy kanałów na krótki czas (np. 30 s)  
- Ograniczenie rozmiaru przepływu pliku awatara  
- Skalowanie Uvicorn z wieloma workerami  

## 8. Kroki implementacji
1. Zaktualizować istniejący serwis `backend/app/services/discord_bot_service.py`, implementując/metody:
    - `list_channels()`
    - `connect(channel_id)`
    - `disconnect()`
    - `update_config(name, avatar_bytes)`  
2. Dodać nowe routery w `backend/app/api/discord_bot.py`, importować i rejestrować je w `main.py`  
3. Zdefiniować Pydantic Command/DTO w `backend/app/models.py` (jeśli brakujące)  
4. Implementować logikę na bazie `discord.py` w serwisie  
5. Dodać walidację pliku awatara (rozszerzenie, rozmiar) w endpointzie PATCH  
6. Dodać jednostkowe testy pytest dla każdego endpointu (mock `DiscordService`) 