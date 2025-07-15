# API Endpoint Implementation Plan: POST /discord-bot/play

## 1. Przegląd punktu końcowego
Endpoint umożliwia odtwarzanie mowy (TTS) w aktualnie połączonym kanale głosowym Discorda. Na wejściu przyjmuje identyfikator głosu i tekst, generuje dźwięk przez istniejące API `/tts`, a następnie przesyła go do odtwarzania przez bota.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Ścieżka URL: `/discord-bot/play`
- Nagłówki: `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `voiceId` (string) – identyfikator istniejącego głosu
    - `text` (string) – tekst do wygenerowania mowy
  - Opcjonalne: brak
- Body JSON:
  ```json
  {
    "voiceId": "string",
    "text": "string"
  }
  ```

## 3. Wykorzystywane typy
- **PlayCommand** (Pydantic): pola `voice_id: str`, `text: str`
- **TextToSpeechCommand** (Pydantic): do wewnętrznego wywołania `/tts`
- **TextToSpeechResponseDTO** (Pydantic): oczekiwana struktura odpowiedzi z TTS (np. base64 lub bytes)
- **DiscordBotStatusDTO** (Pydantic): sprawdzenie stanu połączenia bota

## 4. Szczegóły odpowiedzi
- 202 Accepted – żądanie przyjęte do realizacji (brak ciała odpowiedzi)
- Błędy:
  - 400 Bad Request – nieprawidłowe dane wejściowe (Pydantic lub dodatkowa walidacja)
  - 404 Not Found – nieistniejący `voiceId`
  - 409 Conflict – bot nie jest podłączony do kanału głosowego
  - 500 Internal Server Error – błąd podczas generowania lub odtwarzania audio

## 5. Przepływ danych
1. **Walidacja wejścia**: FastAPI deserializuje JSON do `PlayCommand` (Pydantic).
2. **Sprawdzenie istnienia głosu**: wywołanie serwisu głosów lub DB (service.get_voice_by_id).
3. **Generowanie mowy**: zbudowanie i wysłanie `TextToSpeechCommand` do endpointu `/tts` (Async HTTPX).
4. **Sprawdzenie stanu bota**: odczyt `DiscordBotStatusDTO` (np. z menedżera połączeń). Jeśli `connected == False`, wyrzucamy `BotNotConnectedException`.
5. **Odtworzenie audio**: przekazanie zwróconych danych audio do discord.py VoiceClient:
   - Stworzenie `discord.FFmpegPCMAudio` lub `PCMVolumeTransformer` z danych
   - Wywołanie `VoiceClient.play(...)`
6. **Zwrócenie odpowiedzi**: HTTP 202, serwer kontynuuje odtwarzanie w tle.

## 6. Względy bezpieczeństwa
- **Walidacja długości tekstu**: ograniczyć np. do 5000 znaków, aby uniknąć przeciążeń.
- **Sanityzacja `voiceId`**: upewnić się, że nie ma injection lub traversal.
- **Ograniczenie liczby wywołań**: ewentualna ochrona przed nadużyciami (rate-limiting, VPN jest wewnętrzne).
- **Bezpośredni routing**: endpoint dostępny tylko wewnątrz VPN, brak publicznego uwierzytelniania.

## 7. Obsługa błędów
| Kod | Sytuacja                                        | Mechanizm                           |
|-----|-------------------------------------------------|-------------------------------------|
| 400 | Pydantic ValidationError, puste lub nieciągłe dane | FastAPI -> HTTPException(400)      |
| 404 | `voiceId` nie istnieje                           | `HTTPException(status_code=404)`    |
| 409 | Bot niepodłączony                                 | `HTTPException(status_code=409)`    |
| 500 | Błąd wewnętrzny (TTS lub Discord)                  | `HTTPException(status_code=500)`    |


## 8. Rozważania dotyczące wydajności
- **Asynchroniczność**: użycie HTTPX AsyncClient i `async def` w FastAPI
- **Buforowanie audio**: rozważyć cache bazując na hashach `(voiceId, text)` dla krótkich tekstów, by unikać ponownego wywoływania `/tts`
- **Strumieniowanie vs pamięć**: komponenty `FFmpegPCMAudio` strumieniują audio, co może obniżyć zużycie pamięci

## 9. Kroki implementacji
1. Utworzyć wyjątki w `app/services/exceptions.py`: `BotNotConnectedException`, `PlaybackErrorException`.
2. Dodać serwis `app/services/tts_client.py` (jeśli nie istnieje) z funkcją `async def synthesize(command: TextToSpeechCommand) -> bytes`.
3. Utworzyć `app/services/discord_service.py` z funkcją `async def play_audio(cmd: PlayCommand)`, implementującą kroki od 2 do 5 (zastosować discord.py async API).
4. Dodać router `app/api/discord_bot.py`:
   ```python
   from fastapi import APIRouter, HTTPException, status
   from app.models import PlayCommand
   from app.services.discord_service import play_audio, BotNotConnectedException, PlaybackErrorException

   router = APIRouter(prefix="/discord-bot", tags=["discord-bot"])

   @router.post("/play", status_code=status.HTTP_202_ACCEPTED)
   async def play(cmd: PlayCommand):
       try:
           await play_audio(cmd)
       except BotNotConnectedException:
           raise HTTPException(status_code=409, detail="Bot is not connected to a voice channel")
       except PlaybackErrorException as e:
           raise HTTPException(status_code=500, detail=str(e))
   ```
5. Zarejestrować router w `backend/main.py`.
6. Napisać testy jednostkowe (pytest + HTTPX AsyncClient):
   - poprawna ścieżka (202)
   - brak połączenia (409)
   - błędny `voiceId` (404)
   - błędna treść (400)
7. Zaktualizować dokumentację OpenAPI (FastAPI wygeneruje automatycznie z Pydantic).
8. Frontend: w `frontend/src/lib/discord.ts` dodać funkcję `playVoice({ voiceId, text }): Promise<void>` wysyłającą POST `/discord-bot/play` i obsługującą kody 202/ błędy.
---
*Plan przygotowany z uwzględnieniem FastAPI, Pydantic v2 i discord.py.* 