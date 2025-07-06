<conversation_summary>
<decisions>
1. Zdecydowano się na jedną tabelę `generation_metrics` (z dodatkową tabelą `error_logs` dla nieudanych prób) zamiast wielu tabel.
2. Klucz główny w formie UUID przechowywany jako `TEXT`.
3. Przechowywanie `voice_id` jako `TEXT`, bez relacji FK do zewnętrznych głosów.
4. Przechowywanie znacznika czasu `created_at` w formacie UTC.
5. Pola `token_count` (liczba tokenów) i `text_length` (liczba znaków) z ograniczeniami `CHECK`.
6. Tryb usuwania rekordów: hard delete.
7. Pole `api_type` - voice_generation, tts, prompt_improvement
</decisions>

<matched_recommendations>
1. Stworzyć tabelę `generation_metrics` z kolumnami: `id TEXT PRIMARY KEY`, `voice_id TEXT`, `token_count INTEGER NOT NULL CHECK(token_count>=0)`, `text_length INTEGER NOT NULL CHECK(text_length>=0)`, `created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))`, `api_type TEXT`.
2. Używać `TEXT` dla UUID zamiast `AUTOINCREMENT`.
4. Dodać indeksy na `created_at` i `voice_id`.
5. Egzekwować integralność danych przez `NOT NULL` i `CHECK`.
</matched_recommendations>

<database_planning_summary>
Dla MVP przyjmujemy prostą strukturę bazodanową w SQLite, skoncentrowaną na przechowywaniu metryk generacji mowy:
- Jedna główna tabela `generation_metrics` do przechowywania zużycia tokenów oraz długości tekstu wraz z UUID i znacznikiem czasu UTC.
- Tabela `error_logs` do zapisu nieudanych wywołań API z kolumnami: `id TEXT PRIMARY KEY`, `voice_id TEXT`, `error_message TEXT`, `created_at DATETIME`.
- Brak przechowywania audio, promptów i konfiguracji bota w bazie; te elementy są zarządzane poza DB.
- Zastosowanie `CHECK` i `NOT NULL` dla integralności danych.
- Hard delete dla usuwania rekordów.
- Indeksy na `created_at` i `voice_id` oraz widoki agregujące do raportów.
</database_planning_summary>

<unresolved_issues>
1. Szczegółowy schemat tabeli `error_logs`: jakie dokładnie kolumny i ograniczenia powinny się znaleźć (np. długość komunikatu, dodatkowe znaczniki czasu).
</unresolved_issues>
</conversation_summary> 