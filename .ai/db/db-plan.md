# Schemat bazy danych (SQLite)

## 1. Tabele

### generation_metrics
- **id** TEXT PRIMARY KEY
- **voice_id** TEXT NOT NULL
- **token_count** INTEGER NOT NULL CHECK(token_count >= 0)
- **text_length** INTEGER NOT NULL CHECK(text_length >= 0)
- **api_type** TEXT NOT NULL  -- możliwe wartości: 'voice_generation', 'tts', 'prompt_improvement'
- **created_at** TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ','now'))

### error_logs
- **id** TEXT PRIMARY KEY
- **voice_id** TEXT NOT NULL
- **error_message** TEXT NOT NULL
- **api_type** TEXT NOT NULL  -- 'voice_generation', 'tts', 'prompt_improvement'
- **created_at** TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ','now'))

## 2. Relacje
- Jeden głos (voice_id) może mieć wiele rekordów w `generation_metrics` oraz wiele rekordów w `error_logs` (1:N).

## 3. Indeksy
```sql
CREATE INDEX idx_generation_metrics_created_at ON generation_metrics(created_at);
CREATE INDEX idx_generation_metrics_voice_id ON generation_metrics(voice_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_logs_voice_id ON error_logs(voice_id);
```

## 4. Zasady SQLite (RLS)
SQLite nie wspiera natywnie RLS. Polityki dostępu na poziomie wiersza muszą być zaimplementowane w aplikacji.

## 5. Uwagi dodatkowe
- UUID przechowywane jako TEXT.
- Daty w formacie ISO 8601 UTC.
- Skoncentrowano się na metrykach i logach błędów; przechowywanie audio, promptów i konfiguracji bota jest poza zakresem bazy zgodnie z PRD. 