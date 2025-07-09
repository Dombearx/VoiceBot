# API Endpoint Implementation Plan: POST /prompts/improve

## 1. Przegląd punktu końcowego
Endpoint służy do automatycznej poprawy promptu użytkownika za pomocą zewnętrznego API AI.

## 2. Szczegóły żądania
- Metoda HTTP: POST  
- URL: `/prompts/improve`  
- Nagłówki:
  - `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `prompt` (string, maks. 1000 znaków)
  - Opcjonalne: brak  
- Request Body:
  ```json
  {
    "prompt": "string (max 1000 chars)"
  }
  ```

## 3. Wykorzystywane typy
- Backend (Pydantic):
  - `PromptImprovementCommand`  
  - `PromptImprovementResponseDTO`
- Frontend (TypeScript):
  - `PromptImprovementCommand`
  - `PromptImprovementResponseDTO`

## 4. Szczegóły odpowiedzi
- Status 200:
  ```json
  {
    "improvedPrompt": "string (max 1000 chars)"
  }
  ```
- Błędy:
  - 400 – nieprawidłowe dane wejściowe (brak `prompt` lub długość > 1000)
  - 500 – błąd wewnętrzny lub awaria zewnętrznego API

## 5. Przepływ danych
1. FastAPI waliduje JSON body przez `PromptImprovementCommand`.
2. Kontroler (`app/api/prompt_router.py`) wywołuje:
   ```python
   improved = prompt_service.improve_prompt(cmd)
   ```
3. `prompt_service.improve_prompt`:
   - Importuje bibliotekę `openai.OpenAI` oraz zmienną `INSTRUCTION` z `app/config/prompt_instructions.py`
   - Tworzy klienta: `client = OpenAI()`
   - Wywołuje `client.responses.create(model="gpt-4.1-mini", instructions=INSTRUCTION, input=cmd.prompt)`
   - Zwraca `response.output_text`
4. Kontroler zwraca `PromptImprovementResponseDTO(improvedPrompt=improved)`

## 6. Względy bezpieczeństwa
- Ograniczyć rozmiar `prompt` (Pydantic `max_length=1000`)
- Walidować typ (string), brak dodatkowych znaków
- Rozważyć rate limiting (np. FastAPI middleware)
- Użyć HTTPS do zewnętrznych wywołań

## 7. Obsługa błędów
- Walidacja wejścia → `HTTPException(status_code=400, detail=…)`
- Try/except wokół wywołania zewnętrznego API:
  - Logowanie błędu przez `error_logging_service.log_error(...)`
  - `HTTPException(status_code=500, detail="External API failure")`

## 9. Kroki implementacji
1. **Router**: `backend/app/api/prompt_router.py`
   - Dodaj POST `/prompts/improve`
   - Importuj modele i serwis
2. **Modele**:
   - Weryfikacja `PromptImprovementCommand` z `max_length=1000`
   - Dodaj `PromptImprovementResponseDTO`
3. **Serwis**: `backend/app/services/prompt_service.py`
   - Implementuj `async def improve_prompt(cmd: PromptImprovementCommand) -> str` korzystając z `openai.OpenAI` zamiast HTTPX; importuj `INSTRUCTION` z `app/config/prompt_instructions.py`
4. **Konfiguracja instrukcji**: utwórz plik `backend/app/config/prompt_instructions.py` z zawartością:
   ```python
   # Mocked instruction for prompt improvement
   INSTRUCTION = "Popraw język promptu używając naturalnego stylu i precyzji."
   ```
5. **Błędy**: `backend/app/services/error_logging.py`
   - Dodaj metodę `log_error(api_type: ApiType, message: str)`
6. **Frontend**: `frontend/src/lib/prompt.ts`
   - Dodaj funkcję `improvePrompt(command: PromptImprovementCommand): Promise<PromptImprovementResponseDTO>`
   - Użyj `fetch` lub `axios`
7. **Dokumentacja**:
   - Zaktualizuj OpenAPI (FastAPI automatyczne)
   - Dodaj przykłady w Swagger UI
