<conversation_summary>
<decisions>
1. Dodajemy `Sidebar` z trzema sekcjami: Voices, Discord, Metrics.
2. Tworzymy osobne widoki: `/voices` do tworzenia i testowania głosów oraz `/bot` do zarządzania botem Discord.
3. Inline “Improve prompt” jako dodatkowy przycisk zastępujący oryginalny prompt.
4. Po utworzeniu głosu pokazujemy toast potwierdzający i wyświetlamy trzy próbki audio, z których użytkownik wybiera jedną do zapisu.
5. Skupiamy się na desktopowej obsłudze Chrome; mobilne wsparcie tylko jeśli implementacja jest prosta.
6. Brak wymagań accessibility – interakcje wyłącznie myszką.
7. Brak autoryzacji/sesji w UI.
8. Wykorzystujemy toasty do komunikatów oraz dropdown do wyboru głosu i kanału.
9. Prosta strategia zarządzania stanem: `useState`/`useEffect` z natywnym `fetch`.
10. Spinner przy ładowaniu i toasty przy sukcesach i błędach.
11. Brak paginacji (maks. 10 głosów).
12. Cache audioURL i listy głosów w `localStorage` (stale-while-revalidate).
13. Audio nie jest strumieniowane – korzystamy z pełnych URLi zwracanych przez API.
14. Metryki jako osobna strona `/metrics`.
15. Brak lokalizacji (tylko polski UI).
16. Dark mode z ciemną, stonowaną paletą kolorów.
</decisions>

<matched_recommendations>
1. Implementacja `Sidebar` z odnośnikami do `/voices`, `/bot`, `/metrics`.
2. Konfiguracja routingu (React Router) dla tras `/voices`, `/bot`, `/metrics`.
3. Widok `/voices` z tabelą głosów, formularzem prompt, przyciskiem “Improve prompt”, spinnerem, wyświetlaniem próbek audio oraz toastami.
4. Widok `/bot` z fetchowaniem statusu i kanałów, dropdownami, przyciskami connect/disconnect/play ze spinnerami i toastami.
5. Osobna strona `/metrics` z kafelkami metryk i manualnym odświeżaniem (spinner, toast).
6. Proste hooki `useState`/`useEffect` i natywny `fetch` do zarządzania stanem.
7. Cache audioURL i listy głosów w `localStorage` (stale-while-revalidate).
8. Wykorzystanie Shadcn/ui i Radix: Sidebar, Table, Dropdown, Toast, Spinner.
9. Dedykowany komponent `AudioPlayer` oparty na HTMLAudioElement z kontrolkami play/pause.
10. Tailwind CSS z ciemnym motywem i desktop-first breakpointami.
11. Spinner przy każdym fetchu/submicie i toast notifications dla sukcesów oraz błędów.
12. Upraszczamy: pomijamy autoryzację oraz funkcjonalności accessibility.
</matched_recommendations>

<ui_architecture_planning_summary>
a. Główne wymagania UI
- Prosty desktopowy panel z sidebar, dark mode, brak auth i accessibility.
- Trzy sekcje: tworzenie/testowanie głosów, zarządzanie botem Discord, dashboard metryk.

b. Kluczowe widoki i przepływy
- `/voices`: lista głosów, formularz prompt, “Improve prompt”, generacja głosu (spinner, timeout 120 s), wyświetlenie 3 próbek audio, wybór jednej próbki i zapis (toast).
- `/bot`: status połączenia (GET /status), lista kanałów (GET /channels) i głosów (GET /voices), dropdowny, connect/disconnect (POST /connect, /disconnect), play (POST /play) ze spinnerami i toastami.
- `/metrics`: kafelki z wynikami GET /metrics, przycisk “Refresh” ponawiający fetch z spinnerem i toastem.

c. Integracja z API i zarządzanie stanem
- Endpoints: GET /voices, POST /prompts/improve, POST /voices, GET /discord-bot/status, GET /discord-bot/channels, POST /discord-bot/connect|/disconnect|/play, GET /metrics.
- Zarządzanie stanem: natywny `fetch`, `useState`/`useEffect`, proste hooki.
- Cache w `localStorage` dla audioURL i listy głosów (stale-while-revalidate).

d. Responsywność, dostępność, bezpieczeństwo
- Desktop-first, minimalne wsparcie tabletów.
- Brak wymagań a11y (tylko myszka).
- Brak auth/UI – środowisko chronione przez VPN.

e. Obszary wymagające dalszego wyjaśnienia
- Brak – wszystkie kluczowe kwestie zostały doprecyzowane przez użytkownika.
</ui_architecture_planning_summary>

<unresolved_issues>
Brak nierozwiązanych kwestii.
</unresolved_issues>
</conversation_summary> 