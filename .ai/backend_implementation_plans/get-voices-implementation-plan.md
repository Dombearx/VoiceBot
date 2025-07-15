# Plan wdrożenia punktu końcowego API: GET /voices

## 1. Przegląd punktu końcowego
Endpoint umożliwia klientowi pobranie listy wszystkich głosów dostępnych w systemie (pobranych z zewnętrznego API).

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka: `/voices`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: brak
- Request Body: brak

## 3. Wykorzystywane typy
**Backend** (`backend/app/models.py`):
- `VoiceSampleDTO`:
  - `id: str`
  - `text: str`
  - `audio_url: str`
- `VoiceDetailDTO`:
  - `id: str`
  - `name: str`
  - `prompt: str`
  - `created_at: datetime`
  - `samples: list[VoiceSampleDTO]`
- `ListVoicesResponseDTO`:
  - `items: list[VoiceDetailDTO]`

**Frontend** (`frontend/src/types.ts`):
- `VoiceDTO` (rozszerzony o pole `samples: { id: string; text: string; audioUrl: string }[]`)
- `ListVoicesResponseDTO`:
  - `items: VoiceDTO[]`

## 4. Przepływ danych
1. Klient wysyła GET `/voices`.
2. FastAPI router (`app/api/voices.py`) oddelegowuje do `VoiceService.list_voices()`.
3. `VoiceService`:
   1. Wywołuje synchronicznie  `ElevenLabsAPIClient.list_voices()` (klient zdefiniowany w `app/services/elevenlabs_client.py`, korzystający z klucza API z env).
   2. Mapuje otrzymane dane na modele Pydantic (`VoiceDetailDTO` + `VoiceSampleDTO`).
4. Router zwraca `ListVoicesResponseDTO` z kodem 200.

## 5. Względy bezpieczeństwa
- Klucz API ElevenLabs przechowywany wyłącznie w zmiennej środowiskowej (`ELEVENLABS_API_KEY`).
- Konfiguracja CORS ograniczona do zaufanych domen/VPN.
- Brak uwierzytelniania dla MVP (wewnętrzne użycie).
- Ochrona przed nadmiernymi wywołaniami (rate limiting) na poziomie FastAPI lub reverse proxy.

## 6. Obsługa błędów
- **500 Internal Server Error**:
  - Nieudane wywołanie zewnętrznego API (timeout, błąd sieci).
  - Błędy mapowania danych (niekompletne/podejrzane dane).
- **502 Bad Gateway** (przyszłe rozszerzenie): gdy zewnętrzne API odpowie błędem.
- **504 Gateway Timeout** (przyszłe rozszerzenie): przekroczenie limitu czasu przy wywołaniu zewnętrznym.

## 7. Wydajność
- Minimalizacja przetwarzania w routerze – delegowanie logiki do serwisu.
- Optymalizacja mapowania Pydantic (alias_generator już skonfigurowany w `CamelModel`).

## 8. Kroki implementacji

### Backend
1. Utworzyć nowe modele w `backend/app/models.py`:
   - `VoiceSampleDTO`, `VoiceDetailDTO`, `ListVoicesResponseDTO`.
2. Dodać usługę integracji z ElevenLabs:
   - `backend/app/services/elevenlabs_client.py` – klasa `ElevenLabsAPIClient` z metodą `def list_voices()`.
3. Utworzyć serwis biznesowy:
   - `backend/app/services/voice_service.py` – funkcja `def list_voices() -> list[VoiceDetailDTO]`.
4. Dodać router:
   - `backend/app/api/voices.py`:
     - `@router.get("/voices", response_model=ListVoicesResponseDTO)`
     - Wywołanie `VoiceService.list_voices()` i zwrócenie odpowiedzi.
5. Zarejestrować router w `backend/main.py` (lub pliku głównym aplikacji).
6. Napisać testy jednostkowe (`tests/test_voices_endpoint.py`):
   - Mocki klienta ElevenLabs.
   - Sprawdzenie mapowania modeli i kodów statusu.

### Frontend
1. Dodać typy w `frontend/src/types.ts` (rozszerzenie `VoiceDTO`).
2. Utworzyć usługę HTTP:
   - `frontend/src/lib/voiceService.ts` z funkcją `fetchVoices(): Promise<ListVoicesResponseDTO>`.
3. Utworzyć stronę/komponent listy głosów:
   - `frontend/src/pages/voices.tsx` – wywołanie `fetchVoices()`, prezentacja `items` w tabeli/kartach.
4. Dodać prostą nawigację do nowej strony w layoutach.

### Dokumentacja
1. Sprawdzić wygenerowaną specyfikację OpenAPI/Swagger.
2. Dodać krótki opis i przykładowe odpowiedzi dla GET `/voices`.

---

*Plan przygotowany zgodnie z zasadami FastAPI, Pydantic, regułami projektu i wytycznymi MVP.* 