<conversation_summary>
<decisions>
1. Docelowymi użytkownikami są osoby nietechniczne, oczekujące prostego, przejrzystego interfejsu.
2. Formularz tworzenia głosu będzie zawierał tylko pole tekstowe na prompt, z maksymalną długością 1000 znaków.
3. Generacja mowy ma timeout 30 s z możliwością anulowania oraz wyświetleniem błędu po przekroczeniu limitu.
4. Interfejs desktopowy wspierający przeglądarkę Chrome na standardowym ekranie HD, bez pełnej responsywności.
5. Autoryzacja ograniczona do VPN – brak dodatkowego uwierzytelniania.
6. UI ma umożliwiać: listowanie głosów, podgląd (play/pause w przeglądarce), usuwanie z potwierdzeniem, upload awatara bota discordowego i zmianę nazwy bota discordowego.
7. Panel bota Discord: pokaz status połączenia i kanału, dropdown do podłączania/odłączania.
8. Dane przechowywane w SQLite (głosy są przechowywane po stronie zewnętrzego API); pozostałe logi do konsoli w kontenerze Docker.
9. Backend: FastAPI; frontend: React + TypeScript; aplikacja uruchamiana przez Docker Compose w jednym kontenerze.
10. Metryki: liczba głosów, liczba zaakceptowanych, długości tekstów, koszty Eleven Labs i OpenAI; dashboard z ręcznym odświeżaniem.
11. CI uruchamia testy jednostkowe; brak minimalnego progu pokrycia.
12. Lintery dla Pythona (ruff) i typescripta, uruchamiane ręcznie.
</decisions>
<matched_recommendations>
1. Udokumentować format audio z API i wymagania dotyczące odtwarzania w przeglądarce.
2. Zdefiniować integrację „polepsz prompt” z OpenAI: model, autoryzacja, limity, obsługa błędów.
3. Wybrać SQLite z plikiem DB montowanym jako wolumin w Docker Compose.
4. Zaprojektować prosty dashboard z wykresami kluczowych metryk i ręcznym odświeżaniem.
5. Przyjąć React + TypeScript dla frontendu.
6. Uruchamiać testy jednostkowe w CI bez minimalnego progu pokrycia.
7. Utrzymywać logi HTTP i błędów w konsoli Dockera.
8. Skonfigurować Docker Compose z jednym serwisem FastAPI + SQLite.
9. Wprowadzić walidację promptu (maks. 1000 znaków) i czytelne komunikaty o błędach.
10. Dodać UI: play/pause, przycisk anulowania, potwierdzenie usunięcia, dropdown kanałów, upload awatara i zmiana nazwy bota.
11. Dodać lintery Python (ruff) dla spójności stylu.
</matched_recommendations>
<prd_planning_summary>
a. Główne wymagania funkcjonalne
* Zarządzanie głosami: lista, podgląd (play/pause), usuwanie z potwierdzeniem.
* Tworzenie głosu: pole tekstowe na prompt (max 1000 znaków), opcja ulepszenia AI, generacja mowy z timeoutem 30 s i anulowaniem, odtwarzanie w przeglądarce.
* Panel bota Discord: status połączenia, aktualny kanał, dropdown do przełączania/odłączania/ponownego podłączania, zmiana nazwy i awatara.
* Dashboard metryk: liczba głosów, liczba zaakceptowanych, długości tekstów, koszty zewnętrznych API; ręczne odświeżanie.
* Storage: SQLite w woluminie Docker.
* Logging: konsola w kontenerze.
* Technologia: FastAPI (Python), React + TypeScript; Docker Compose.
* Testy: jednostkowe uruchamiane w CI.
* Narzędzia jakości: lintery Python (black, flake8).
b. Kluczowe historie użytkownika
* Jako użytkownik nietechniczny chcę listować, odtwarzać i usuwać głosy z potwierdzeniem, aby zarządzać dostępnymi głosami.
* Jako użytkownik chcę wpisać prompt, opcjonalnie go ulepszyć, wygenerować głos i odtworzyć nagranie w przeglądarce z możliwością anulowania.
* Jako użytkownik chcę zobaczyć status bota i kanał, przełączać go między kanałami lub odłączać/ponownie podłączać, oraz zmieniać nazwę i awatar.
* Jako użytkownick chcę móc wpisać tekst, wybrać głos i odtworzyć go na głosywm kanale poprzed bota na discordzie.
* Jako użytkownik chcę przeglądać dashboard metryk i ręcznie odświeżać dane, by monitorować użycie i koszty.
c. Kryteria sukcesu i mierniki
* 100% operacji generacji głosu zakończone lub wywołujące błąd po 30 s.
* Intuicyjność interfejsu dla nietechnicznych użytkowników (mierzone feedbackiem testowym).
* Dokładność metryk: liczba generacji, akceptacji, długości tekstów, koszty API.
* Stabilne uruchomienie w Docker Compose, testy jednostkowe przechodzące w CI.
</prd_planning_summary>
<unresolved_issues>
1. Należy potwierdzić format audio (MP3/WAV) zwracany przez zewnętrzne API i ewentualne wymagania konwersji.
2. Dokładne parametry integracji „polepsz prompt” (model OpenAI, limity zapytań, schemat błędów).
3. Szczegóły wizualizacji metryk w dashboardzie (rodzaje wykresów, zakresy czasowe).
</unresolved_issues>
</conversation_summary>