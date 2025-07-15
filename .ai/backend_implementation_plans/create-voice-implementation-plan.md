# API Endpoint Implementation Plan: POST /voices

## 1. Przegląd punktu końcowego
- Cel: Utworzenie i wygenerowanie nowego głosu na podstawie tekstowego prompta oraz przykładowego tekstu (`sampleText`), zwrócenie trzech próbek audio.

## 2. Szczegóły żądania
- Metoda HTTP: **POST**
- URL: `/voices`
- Body (JSON):
  ```json
  {
    "prompt": "string (max 1000 chars)",
    "sampleText": "string (max 500 chars)",
    "loudness": number,
    "creativity": number
  }
  ```
- Parametry:
  - Wymagane:
    - `prompt`: string (1–1000 znaków)
    - `sampleText`: string (1–500 znaków)
    - `loudness`: number (float) ([-1, 1])
    - `creativity`: number (float) ([0, 100])
  - Opcjonalne: brak

## 3. Wykorzystywane typy
- **Input Command**: `CreateVoiceCommand`
  - Pydantic model z polami:
    - `prompt: str` (max_length=1000)
    - `sample_text: str` alias `sampleText` (max_length=500)
    - `loudness: float`
    - `creativity: float`
- **Response DTO**:
  - `VoiceDTO`
  - `VoiceSampleDTO`

## 4. Szczegóły odpowiedzi
- **201 Created**
  ```json
  {
    "id": "string",
    "name": "string",
    "prompt": "string",
    "createdAt": "ISO8601",
    "samples": [
      { "id": "string", "text": "string", "audio_base_64": "string" },
      { "id": "string", "text": "string", "audio_base_64": "string" },
      { "id": "string", "text": "string", "audio_base_64": "string" }
    ]
  }
  ```
- **Błędy**:
  - `400 Bad Request`: nieprawidłowe dane wejściowe (walidacja Pydantic)
  - `408 Request Timeout`: przekroczono limit czasu generacji (120s)
  - `500 Internal Server Error`: błąd zewnętrznego API lub wewnętrzny

## 5. Przepływ danych
1. Klient wywołuje POST `/voices` z JSON-em.
2. FastAPI waliduje dane wejściowe za pomocą Pydantic (`CreateVoiceCommand`).
3. Endpoint przekazuje komendę do `voice_service.create_voice(command)`.
4. W `voice_service`:
   - Autoryzacja i konfiguracja klienta HTTP do ElevenLabs.
   - Wywołanie API `design` i `create voice` (elevenlabs spec).
   - Pętla `for i in range(3)`: wywołanie `create speech` z `sampleText`, `loudness`, `creativity`.
   - Zebranie URL-i audio i metadanych dla każdej próbki.
   - (Opcjonalnie) Zapis rekordu głosu i próbek do bazy danych.
5. Mapowanie wyniku na `VoiceDTO` i zwrócenie odpowiedzi.

## 6. Względy bezpieczeństwa
- Walidacja długości pól (`max_length`) i typów.
- Limit liczby żądań (rate limiting) na poziomie routera.
- CORS whitelist dla frontendu.
- Brak uwierzytelniania w MVP; rozważyć token API w przyszłości.
- Unikać wstrzyknięć – wszystkie wartości tekstowe traktować jako dane, nie kod.

## 7. Obsługa błędów
- **400**: `HTTPException(status_code=400)` przy niepoprawnych danych wejściowych.
- **408**: `HTTPException(status_code=408)` przy `asyncio.TimeoutError` lub przekroczeniu `timeout=120s`.
- **500**: `HTTPException(status_code=500)` przy błędach HTTP lub wewnętrznych.
- Logowanie szczegółów błędów do tabeli `error_logs` (serwis `error_log_service.log_error`).

## 8. Rozważania dotyczące wydajności
- Asynchroniczne wywołania HTTP (`httpx.AsyncClient`).
- Ograniczenie współbieżnych połączeń (Semaphore).
- Ustawienie `timeout` dla każdego Requestu.
- Ewentualne buforowanie autoryzacji (tokeny).

## 9. Kroki implementacji
1. Utworzyć plik `backend/app/api/voices.py` i zadeklarować router.
2. Zdefiniować Pydantic `CreateVoiceCommand` w `backend/app/models.py` lub `schemas/voices.py` z walidacją.
3. Stworzyć `backend/app/services/voice_service.py` z funkcją:
   ```python
   async def create_voice(cmd: CreateVoiceCommand) -> VoiceDTO:
       # implementacja wywołań elevenlabs
   ```
4. W `voice_service` zaimplementować logikę:
   - `design_voice`
   - `create_voice`
   - `generate_speech` (3 razy)
   - Obsługę timeoutów i błędów
5. (Opcjonalnie) Dodać warstwę zapisu do bazy danych SQLModel.
6. W endpointzie `/voices`:
   - Wywołać `voice_service.create_voice`
   - Zwrócić `VoiceDTO` z kodem 201
7. Dodać testy jednostkowe i integracyjne (pytest + httpx.MockTransport).
8. Zarejestrować router w `main.py`.
9. Zweryfikować dokumentację OpenAPI wygenerowaną przez FastAPI.
10. Przeprowadzić manualne testy end-to-end z frontendem. 